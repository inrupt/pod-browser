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

/* eslint-disable camelcase */
import useSWR from "swr";
import { space, ldp } from "rdf-namespaces";

import {
  getSolidDataset,
  getResourceInfoWithAcl,
  getIriAll,
  getResourceAcl,
  getThing,
  hasResourceAcl,
  isContainer,
  getAgentAccessAll,
  getAgentDefaultAccessAll,
  hasAccessibleAcl,
  getFallbackAcl,
  getSourceUrl,
} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";

import { getIriPath } from "../../solidClientHelpers/utils";
import { normalizePermissions } from "../../solidClientHelpers/permissions";
import { fetchResourceWithAcl } from "../../solidClientHelpers/resource";

export async function fetchContainerResourceIris(containerIri, fetch) {
  const litDataset = await getSolidDataset(containerIri, { fetch });
  const container = getThing(litDataset, containerIri);
  const iris = getIriAll(container, ldp.contains);
  return iris;
}

export const GET_CONTAINER_RESOURCE_IRIS = "getContainerResourceIris";
/* istanbul ignore next */
export function useFetchContainerResourceIris(iri) {
  const { session } = useSession();

  return useSWR([iri, GET_CONTAINER_RESOURCE_IRIS], () =>
    fetchContainerResourceIris(iri, session.fetch)
  );
}

export async function fetchResourceDetails(iri, fetch) {
  const name = getIriPath(iri);
  const resourceInfo = await getResourceInfoWithAcl(iri, { fetch });
  let defaultPermissions = [];
  let permissions = [];

  if (hasResourceAcl(resourceInfo)) {
    const accessModeList = getAgentAccessAll(resourceInfo);
    permissions = await normalizePermissions(accessModeList, fetch);
    const resourceAcl = getResourceAcl(resourceInfo);
    const defaultAccessModeList = getAgentDefaultAccessAll(resourceAcl);

    defaultPermissions = await normalizePermissions(
      defaultAccessModeList,
      fetch
    );
  } else if (hasAccessibleAcl(resourceInfo)) {
    const fallbackAcl = getFallbackAcl(resourceInfo);
    const accessModeList = getAgentDefaultAccessAll(fallbackAcl);
    permissions = await normalizePermissions(accessModeList, fetch);
  }

  let types = [];
  const contentType = resourceInfo?.internal_resourceInfo?.contentType;

  if (contentType) types = [contentType];
  if (isContainer(resourceInfo)) types = ["Container"];

  return {
    iri,
    permissions,
    defaultPermissions,
    types,
    name,
    dataset: resourceInfo,
  };
}

export const FETCH_RESOURCE_DETAILS = "fetchResourceDetails";
/* istanbul ignore next */
export function useFetchResourceDetails(iri) {
  const { session } = useSession();
  return useSWR([iri, FETCH_RESOURCE_DETAILS], () =>
    fetchResourceDetails(iri, session.fetch)
  );
}

export const FETCH_RESOURCE_WITH_ACL = "fetchResourceWithAcl";
/* istanbul ignore next */
export function useFetchResourceWithAcl(iri) {
  const { session } = useSession();
  return useSWR([iri, FETCH_RESOURCE_WITH_ACL], () =>
    fetchResourceWithAcl(iri, session.fetch)
  );
}

export async function fetchPodIrisFromWebId(webId, fetch) {
  const profileDoc = await getSolidDataset(webId, { fetch });
  const profile = getThing(profileDoc, webId);

  return getIriAll(profile, space.storage);
}

export const FETCH_POD_IRIS_FROM_WEB_ID = "fetchPodIrisFromWebId";
/* istanbul ignore next */
export function useFetchPodIrisFromWebId(webId) {
  const { session } = useSession();
  return useSWR([webId, FETCH_POD_IRIS_FROM_WEB_ID], () =>
    fetchPodIrisFromWebId(webId, session.fetch)
  );
}
