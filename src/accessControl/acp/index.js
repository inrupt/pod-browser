/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* istanbul ignore file */
// TODO: Remove once Solid Client ACP API is complete

import {
  acp_lowlevel_preview as acp,
  asUrl,
  getSolidDataset,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { joinPath } from "../../stringHelpers";
import { fetchProfile } from "../../solidClientHelpers/profile";
import {
  ACL,
  createAccessMap,
  displayPermissions,
} from "../../solidClientHelpers/permissions";
import {
  chain,
  chainPromise,
  createResponder,
  sharedStart,
} from "../../solidClientHelpers/utils";
import { getOrCreateDataset } from "../../solidClientHelpers/resource";

const POLICIES_CONTAINER = "pb_policies/";

export function getPoliciesContainerUrl(podRootUri) {
  return joinPath(podRootUri, POLICIES_CONTAINER);
}

export function createAcpMap(read = false, write = false, append = false) {
  return {
    [ACL.READ.key]: read,
    [ACL.WRITE.key]: write,
    [ACL.APPEND.key]: append,
  };
}

export function addAcpModes(existingAcpModes, newAcpModes) {
  return existingAcpModes
    ? createAcpMap(
        existingAcpModes.read || newAcpModes.read,
        existingAcpModes.write || newAcpModes.write,
        existingAcpModes.append || newAcpModes.append
      )
    : newAcpModes;
}

export function convertAcpToAcl(access) {
  return createAccessMap(
    access.apply.read,
    access.apply.write,
    access.apply.append,
    access.access.read && access.access.write
  );
}

export function getOrCreatePermission(permissions, webId) {
  const permission = permissions[webId] ?? {
    webId,
  };
  permission.acp = permission.acp ?? {
    apply: createAcpMap(),
    access: createAcpMap(),
  };
  return permission;
}

export function getPolicyUrl(resource, policiesContainer) {
  const resourceUrl = getSourceUrl(resource);
  const policiesUrl = getSourceUrl(policiesContainer);
  const matchingStart = sharedStart(resourceUrl, policiesUrl);
  const path = resourceUrl.substr(matchingStart.length);
  return `${getPoliciesContainerUrl(matchingStart) + path}.ttl`;
}

export function getOrCreatePolicy(policyDataset, url) {
  const existingPolicy = acp.getPolicy(policyDataset, url);
  if (existingPolicy) {
    return { policy: existingPolicy, dataset: policyDataset };
  }
  const newPolicy = acp.createPolicy(url);
  const updatedPolicyDataset = acp.setPolicy(policyDataset, newPolicy);
  return { policy: newPolicy, dataset: updatedPolicyDataset };
}

export function getRulesOrCreate(ruleUrls, policy, policyDataset) {
  // assumption: Rules resides in the same resource as the policies
  const rules = ruleUrls
    .map((url) => acp.getRule(policyDataset, url))
    .filter((rule) => !!rule);
  if (rules.length === 0) {
    const ruleUrl = `${asUrl(policy)}Rule`; // e.g. <pod>/policies/.ttl#readPolicyRule
    return { existing: false, rules: [acp.createRule(ruleUrl)] };
  }
  return { existing: true, rules };
}

export function getRuleWithAgent(rules, agentWebId) {
  // assumption 1: the rules for the policies we work with will not have agents across multiple rules
  // assumption 2: there will always be at least one rule (we enforce this with getRulesOrCreate)
  const rule = rules.find((r) =>
    acp.getAgentForRuleAll(r).find((webId) => webId === agentWebId)
  );
  // if we don't find the agent in a rule, we'll just pick the first one
  return rule || rules[0];
}

export async function setAgents(policy, policyDataset, webId, accessToMode) {
  const ruleUrls = acp.getRequiredRuleForPolicyAll(policy);
  const { existing, rules } = getRulesOrCreate(ruleUrls, policy, policyDataset);
  const rule = getRuleWithAgent(rules, webId);
  const existingAgents = acp.getAgentForRuleAll(rule);
  const agentIndex = existingAgents.indexOf(webId);
  let modifiedRule = rule;
  if (accessToMode && agentIndex === -1) {
    modifiedRule = acp.addAgentForRule(rule, webId);
  }
  if (!accessToMode && agentIndex !== -1) {
    modifiedRule = acp.removeAgentForRule(rule, webId);
  }
  const modifiedDataset = setThing(policyDataset, modifiedRule);
  return {
    policy: existing
      ? acp.setRequiredRuleForPolicy(policy, modifiedRule)
      : acp.addRequiredRuleForPolicy(policy, modifiedRule),
    dataset: modifiedDataset,
  };
}

export default class AcpAccessControlStrategy {
  #datasetWithAcr;

  #policyUrl;

  #fetch;

  constructor(datasetWithAcr, policiesContainer, fetch) {
    this.#datasetWithAcr = datasetWithAcr;
    this.#policyUrl = getPolicyUrl(datasetWithAcr, policiesContainer);
    this.#fetch = fetch;
  }

  async getPolicyModesAndAgents(policyUrls) {
    const policyResources = await Promise.all(
      policyUrls.map((url) => getSolidDataset(url, { fetch: this.#fetch }))
    );
    const policies = policyResources
      .map((dataset) =>
        acp.getPolicyAll(dataset).map((policy) => ({
          policy,
          dataset,
        }))
      )
      .flat();
    return Promise.all(
      policies.map(({ policy, dataset }) => {
        const modes = acp.getAllowModesOnPolicy(policy);
        const ruleUrls = acp.getRequiredRuleForPolicyAll(policy);
        // assumption: rule resides in the same resource as policies
        const rules = ruleUrls.map((url) => acp.getRule(dataset, url));
        const agents = rules.map((rule) => acp.getAgentForRuleAll(rule)).flat();
        return {
          modes,
          agents,
        };
      })
    );
  }

  async getPermissions() {
    const permissions = {};
    // assigning Read, Write, and Append
    const accessControls = acp.getAccessControlAll(this.#datasetWithAcr);
    const policyUrls = accessControls
      .map((ac) => {
        // we only want policies that is in the corresponding policy resource
        return acp
          .getPolicyUrlAll(ac)
          .filter((url) => url.startsWith(this.#policyUrl));
      })
      .flat();
    (await this.getPolicyModesAndAgents(policyUrls)).forEach(
      ({ modes, agents }) =>
        agents.forEach((webId) => {
          const permission = getOrCreatePermission(permissions, webId);
          permission.acp.apply = addAcpModes(permission.acp.apply, modes);
          permissions[webId] = permission;
        })
    );
    // assigning Control
    const controlPolicies = acp.getAcrPolicyUrlAll(this.#datasetWithAcr);
    const controlPolicyUrls = controlPolicies.filter((url) =>
      url.startsWith(this.#policyUrl)
    );
    (await this.getPolicyModesAndAgents(controlPolicyUrls)).forEach(
      ({ modes, agents }) =>
        agents.forEach((webId) => {
          const permission = getOrCreatePermission(permissions, webId);
          permission.acp.access = addAcpModes(permission.acp.access, modes);
          permissions[webId] = permission;
        })
    );
    // normalize permissions
    return Promise.all(
      Object.values(permissions).map(async ({ acp: access, webId }) => {
        const acl = convertAcpToAcl(access);
        return {
          acl,
          alias: displayPermissions(acl),
          profile: await fetchProfile(webId, this.#fetch),
          webId,
        };
      })
    );
  }

  async ensureAccessControl(policyUrl, datasetWithAcr) {
    const accessControls = acp.getAccessControlAll(datasetWithAcr);
    const existingAccessControl = accessControls.find((ac) =>
      acp.getPolicyUrlAll(ac).find((url) => policyUrl === url)
    );
    let modifiedDatasetWithAcr = datasetWithAcr;
    if (!existingAccessControl) {
      const newAccessControl = chain(
        acp.createAccessControl(),
        (ac) => acp.addPolicyUrl(ac, policyUrl),
        (ac) => acp.addMemberPolicyUrl(ac, policyUrl)
      );
      modifiedDatasetWithAcr = acp.setAccessControl(
        datasetWithAcr,
        newAccessControl
      );
      modifiedDatasetWithAcr = await acp.saveAcrFor(modifiedDatasetWithAcr, {
        fetch: this.#fetch,
      });
    }
    return modifiedDatasetWithAcr;
  }

  async saveApplyPolicyWithAgentForOriginalResource(
    policyDataset,
    webId,
    access,
    mode,
    acpMap
  ) {
    const policyUrl = `${this.#policyUrl}#${mode}ApplyPolicy`;
    const existingPolicy = acp.getPolicy(policyDataset, policyUrl);
    if (!existingPolicy && !access[mode]) {
      // no need to add policy if it doesn't exist and we're not adding the agent to it
      return policyDataset;
    }
    const { dataset: modifiedPolicyDataset } = await chainPromise(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: acp.setAllowModesOnPolicy(policy, acpMap),
        dataset,
      }),
      async ({ policy, dataset }) =>
        setAgents(policy, dataset, webId, access[mode]),
      ({ policy, dataset }) => ({
        policy,
        dataset: acp.setPolicy(dataset, policy),
      })
    );
    // making sure that policy is connected to access control
    this.#datasetWithAcr = await this.ensureAccessControl(
      policyUrl,
      this.#datasetWithAcr
    );
    return modifiedPolicyDataset;
  }

  async saveAccessPolicyWithAgentForOriginalResource(
    policyDataset,
    webId,
    access
  ) {
    const policyUrl = `${this.#policyUrl}#controlAccessPolicy`;
    const existingPolicy = acp.getPolicy(policyDataset, policyUrl);
    if (!existingPolicy && !access.control) {
      // no need to add policy if it doesn't exist and we're not adding the agent to it
      return policyDataset;
    }
    const { dataset: modifiedPolicyDataset } = await chainPromise(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: acp.setAllowModesOnPolicy(policy, createAcpMap(true, true)),
        dataset,
      }),
      async ({ policy, dataset }) =>
        setAgents(policy, dataset, webId, access.control),
      ({ policy, dataset }) => ({
        policy,
        dataset: acp.setPolicy(dataset, policy),
      })
    );
    // making sure that policy is connected to access control
    this.#datasetWithAcr = await chainPromise(
      acp.addAcrPolicyUrl(this.#datasetWithAcr, policyUrl),
      (datasetWithAcr) => acp.addMemberAcrPolicyUrl(datasetWithAcr, policyUrl),
      async (datasetWithAcr) =>
        acp.saveAcrFor(datasetWithAcr, {
          fetch: this.#fetch,
        })
    );
    // return the modified policy dataset
    return modifiedPolicyDataset;
  }

  async saveApplyPolicyWithAgentsForPolicyResource(
    policyDataset,
    webId,
    access
  ) {
    const policyUrl = `${this.#policyUrl}#controlApplyPolicy`;
    const existingPolicy = acp.getPolicy(policyDataset, policyUrl);
    if (!existingPolicy && !access.control) {
      // no need to add policy if it doesn't exist and we're not adding the agent to it
      return policyDataset;
    }
    const policyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
      getSourceUrl(policyDataset),
      { fetch: this.#fetch }
    );
    const { policy: modifiedPolicyDataset } = await chainPromise(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: acp.setAllowModesOnPolicy(policy, createAcpMap(true, true)),
        dataset,
      }),
      async ({ policy, dataset }) =>
        setAgents(policy, dataset, webId, access.control),
      ({ policy, dataset }) => ({
        policy: acp.setPolicy(dataset, policy),
        dataset,
      })
    );
    // ensuring that access control is set for policy resource ACR
    await this.ensureAccessControl(policyUrl, policyDatasetWithAcr);
    return modifiedPolicyDataset;
  }

  async savePermissionsForAgent(webId, access) {
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDataset(this.#policyUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);

    try {
      const updatedDataset = await chainPromise(
        policyDataset,
        async (dataset) =>
          this.saveApplyPolicyWithAgentForOriginalResource(
            dataset,
            webId,
            access,
            "read",
            createAcpMap(true)
          ),
        async (dataset) =>
          this.saveApplyPolicyWithAgentForOriginalResource(
            dataset,
            webId,
            access,
            "write",
            createAcpMap(false, true)
          ),
        async (dataset) =>
          this.saveApplyPolicyWithAgentForOriginalResource(
            dataset,
            webId,
            access,
            "append",
            createAcpMap(false, false, true)
          ),
        async (dataset) =>
          this.saveAccessPolicyWithAgentForOriginalResource(
            dataset,
            webId,
            access
          ),
        async (dataset) =>
          this.saveApplyPolicyWithAgentsForPolicyResource(
            dataset,
            webId,
            access
          )
      );
      // saving to the policy resource
      await saveSolidDatasetAt(this.#policyUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    } catch (err) {
      return error(err.message);
    }
    return respond(this.#datasetWithAcr);
  }

  static async init(resourceInfo, policiesContainer, fetch) {
    const resourceUrl = getSourceUrl(resourceInfo);
    const datasetWithAcr = await acp.getResourceInfoWithAcr(resourceUrl, {
      fetch,
    });
    return new AcpAccessControlStrategy(
      datasetWithAcr,
      policiesContainer,
      fetch
    );
  }
}
