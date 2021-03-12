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
  asUrl,
  getSolidDataset,
  getThing,
  getThingAll,
} from "@inrupt/solid-client";
import { getContactIndex } from "./collection";
import { getBaseUrl } from "../../solidClientHelpers/resource";

/*
 * Contacts represent the agents or groups in a user's AddressBook
 */

/* Model functions */
export function getContactUrl(contactThing) {
  // a safe way of getting URL for a contact -  we might pass in a contact that hasn't been saved yet
  try {
    return asUrl(contactThing); // TODO: Remove when isThingLocal works properly
  } catch {
    return null;
  }
}

export function getContactType(contactThing, types) {
  return types.find((type) => type.isOfType(contactThing));
}

export async function getContactFullFromContactThing(
  contactThing,
  types,
  fetch
) {
  const contactUrl = getContactUrl(contactThing);
  if (!contactUrl) return null;
  const contactDatasetUrl = getBaseUrl(contactUrl);
  const dataset = await getSolidDataset(contactDatasetUrl, { fetch });
  const thing = getThing(dataset, contactUrl);
  const type = getContactType(thing, types);
  return {
    dataset,
    thing,
    type,
  };
}

export function getContactAllFromContactsIndex(contactIndex) {
  const { dataset, type } = contactIndex;
  return getThingAll(dataset)
    .filter((contact) => type.isOfType(contact))
    .map((thing) => ({
      thing,
      dataset,
      type,
    }));
}

function getContactAllFromContactIndexArray(contactIndexArray) {
  return contactIndexArray
    .map((index) => getContactAllFromContactsIndex(index))
    .reduce((memo, contacts) => memo.concat(contacts), []);
}

export async function getContactAll(addressBook, types, fetch) {
  const contactIndexArray = await Promise.all(
    types.map(async (type) => getContactIndex(addressBook, type, fetch))
  );
  return getContactAllFromContactIndexArray(contactIndexArray);
}

export async function getOriginalUrlForContactAll(addressBook, types, fetch) {
  const contactAll = await getContactAll(addressBook, types, fetch);
  const contactFullAll = await Promise.all(
    contactAll.map(async (contact) =>
      getContactFullFromContactThing(contact.thing, types, fetch)
    )
  );
  return contactFullAll.map((contact) => contact.type.getOriginalUrl(contact));
}
