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

import {
  addUrl,
  asUrl,
  getSolidDataset,
  getSourceUrl,
  getStringNoLocale,
  getThing,
  getUrlAll,
  removeUrl,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import { getBaseUrl } from "../../solidClientHelpers/resource";
import { chain } from "../../solidClientHelpers/utils";

/*
 * A group might refer to a group in the address book, but could also live outside of it.
 */

/* Model functions */
export async function getGroup(groupUrl, fetch) {
  const dataset = await getSolidDataset(getBaseUrl(groupUrl), { fetch });
  return {
    dataset,
    thing: getThing(dataset, groupUrl),
  };
}

export function getGroupUrl(group) {
  return asUrl(group.thing);
}

export function getGroupName(group) {
  return getStringNoLocale(group.thing, vcard.fn);
}

export function getGroupDescription(group) {
  return getStringNoLocale(group.thing, vcard.note) || "";
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function addGroupMember(group, agentUrl, fetch) {
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, addUrl(group.thing, vcard.hasMember, agentUrl)),
    { fetch }
  );
  return {
    dataset: savedDataset,
    thing: getThing(savedDataset, asUrl(group.thing)),
  };
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function removeGroupMember(group, agentUrl, fetch) {
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, removeUrl(group.thing, vcard.hasMember, agentUrl)),
    { fetch }
  );
  return {
    dataset: savedDataset,
    thing: getThing(savedDataset, asUrl(group.thing)),
  };
}

/**
 * Note that you might need to refresh the cache of the specific group after this, e.g. mutate SWR cache
 */
export async function updateGroupMembers(
  group,
  membersToAdd,
  membersToRemove,
  fetch
) {
  const updatedGroup = chain(
    group.thing,
    ...[]
      .concat(membersToAdd.map((url) => (t) => addUrl(t, vcard.hasMember, url)))
      .concat(
        membersToRemove.map((url) => (t) => removeUrl(t, vcard.hasMember, url))
      )
  );
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, updatedGroup),
    { fetch }
  );
  return {
    dataset: savedDataset,
    thing: getThing(savedDataset, asUrl(group.thing)),
  };
}

/**
 * Do not return the dataset of each group member, must be loaded separately
 */
export function getGroupMemberUrlAll(group) {
  return getUrlAll(group.thing, vcard.hasMember);
}
