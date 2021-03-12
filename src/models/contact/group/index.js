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
  addStringNoLocale,
  addUrl,
  asUrl,
  createSolidDataset,
  createThing,
  deleteContainer,
  deleteFile,
  getSolidDataset,
  getSourceUrl,
  getThing,
  getUrlAll,
  removeStringNoLocale,
  removeThing,
  removeUrl,
  saveSolidDatasetAt,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { ldp, rdf, vcard } from "rdf-namespaces";
import { v4 as uuid } from "uuid";
import { chain } from "../../../solidClientHelpers/utils";
import { getContainerUrl, joinPath } from "../../../stringHelpers";
import {
  addContactIndexToAddressBook,
  getContactIndexUrl,
} from "../collection";
import { vcardExtras } from "../../../addressBook";
import { updateOrCreateDataset } from "../../dataset";
import { getContactAll } from "../index";
import { getAddressBookThingUrl } from "../../addressBook";
import { getGroupDescription, getGroupName } from "../../group";

/* Model constants */
export const NAME_GROUP_INDEX_PREDICATE = vcardExtras("groupIndex");
export const GROUPS_INDEX_FILE = "groups.ttl";
export const GROUP_CONTAINER = "Group";
export const INDEX_FILE = "index.ttl";
export const GROUP_CONTACT = {
  indexFile: GROUPS_INDEX_FILE,
  container: GROUP_CONTAINER,
  indexFilePredicate: NAME_GROUP_INDEX_PREDICATE,
  contactTypeUrl: vcard.Group,
  isOfType: (thing) => getUrlAll(thing, rdf.type).includes(vcard.Group),
  searchNoResult: "No groups found",
  getOriginalUrl: (contact) => asUrl(contact.thing),
  getName: (contact) => getGroupName(contact),
  getAvatarProps: (contact) => ({
    icon: "users",
  }),
};

/* Model internal functions */
function createGroupThing(name, thingOptions) {
  return chain(
    createThing(thingOptions),
    (t) => setUrl(t, rdf.type, vcard.Group),
    (t) => setStringNoLocale(t, vcard.fn, name)
  );
}

function createIndexThing(indexDataset, addressBook, groupThingUrl) {
  const addressBookThingUrl = getAddressBookThingUrl(addressBook);
  const addressBookInDataset =
    getThing(indexDataset, addressBookThingUrl) ||
    createThing({
      url: addressBookThingUrl,
    });
  return addUrl(
    addressBookInDataset,
    vcardExtras("includesGroup"),
    groupThingUrl
  );
}

/* Model functions */
export function createGroupDatasetUrl(addressBook, id = uuid()) {
  return joinPath(addressBook.containerUrl, GROUP_CONTAINER, id, INDEX_FILE);
}

/**
 * Note that you need to refresh the cache of group index after this, e.g. mutate SWR cache
 * You also need to refresh the cache of the address book
 */
export async function saveGroup(addressBook, name, fetch) {
  // save the group resource itself
  const groupDatasetUrl = createGroupDatasetUrl(addressBook);
  const groupThingUrl = `${groupDatasetUrl}#this`;
  const groupDataset = await saveSolidDatasetAt(
    groupDatasetUrl,
    chain(
      createSolidDataset(),
      (d) => setThing(d, createGroupThing(name, { name: "this" })),
      (d) => setThing(d, createIndexThing(d, addressBook, groupThingUrl))
    ),
    { fetch }
  );
  // then link the group to the group index
  let updatedAddressBook = addressBook;
  let groupIndexUrl = getContactIndexUrl(addressBook, GROUP_CONTACT);
  if (!groupIndexUrl) {
    // add the index to the Address Book if it doesn't already exist
    updatedAddressBook = await addContactIndexToAddressBook(
      addressBook,
      GROUP_CONTACT,
      fetch
    );
    groupIndexUrl = getContactIndexUrl(updatedAddressBook, GROUP_CONTACT);
  }
  const indexDataset = await updateOrCreateDataset(
    groupIndexUrl,
    fetch,
    (d) => setThing(d, createGroupThing(name, { url: groupThingUrl })),
    (d) => setThing(d, createIndexThing(d, addressBook, groupThingUrl))
  );
  return {
    addressBook: updatedAddressBook,
    group: {
      dataset: groupDataset,
      thing: getThing(groupDataset, groupThingUrl),
    },
    groupIndex: {
      dataset: indexDataset,
      type: GROUP_CONTACT,
    },
  };
}

export async function getGroupAll(addressBook, fetch) {
  return getContactAll(addressBook, [GROUP_CONTACT], fetch);
}

/**
 * Note that you might need to refresh the cache of group index after this, e.g. mutate SWR cache
 */
export async function renameGroup(
  addressBook,
  group,
  name,
  fetch,
  optionalFields = {}
) {
  // update the group itself
  const updatedGroup = chain(
    group.thing,
    (t) => setStringNoLocale(t, vcard.fn, name),
    ...[
      (t) => removeStringNoLocale(t, vcard.note, getGroupDescription(group)),
      (t) =>
        optionalFields[vcard.note]
          ? addStringNoLocale(t, vcard.note, optionalFields[vcard.note])
          : t,
    ]
  );
  const savedDataset = await saveSolidDatasetAt(
    getSourceUrl(group.dataset),
    setThing(group.dataset, updatedGroup),
    { fetch }
  );
  // update the group index
  const groupIndexUrl = getContactIndexUrl(addressBook, GROUP_CONTACT);
  const groupIndexDataset = await getSolidDataset(groupIndexUrl, { fetch });
  const existingGroup = getThing(groupIndexDataset, asUrl(group.thing));
  const indexDataset = await saveSolidDatasetAt(
    groupIndexUrl,
    setThing(
      groupIndexDataset,
      setStringNoLocale(existingGroup, vcard.fn, name)
    ),
    { fetch }
  );
  return {
    group: {
      dataset: savedDataset,
      thing: getThing(savedDataset, asUrl(group.thing)),
      type: GROUP_CONTACT,
    },
    groupIndex: {
      dataset: indexDataset,
      type: GROUP_CONTACT,
    },
  };
}

export async function deleteGroup(addressBook, group, fetch) {
  // first remove the group from the group index
  const groupUrl = asUrl(group.thing);
  const groupIndexUrl = getContactIndexUrl(addressBook, GROUP_CONTACT);
  const groupIndexDataset = await getSolidDataset(groupIndexUrl, { fetch });
  const updatedGroupIndexDataset = await saveSolidDatasetAt(
    groupIndexUrl,
    chain(
      groupIndexDataset,
      (d) => removeThing(d, groupUrl), // remove the cached data about group
      (d) =>
        setThing(
          d,
          chain(
            getThing(groupIndexDataset, asUrl(addressBook.thing)),
            (t) => removeUrl(t, vcardExtras("includesGroup"), groupUrl) // remove the includesGroup reference to group
          )
        )
    ),
    { fetch }
  );
  // then remove the group itself
  await deleteFile(groupUrl, { fetch });
  // remove the container, if it's empty
  const groupContainerUrl = getContainerUrl(groupUrl);
  const groupContainerDataset = await getSolidDataset(groupContainerUrl, {
    fetch,
  });
  const groupContainerThing = getThing(
    groupContainerDataset,
    groupContainerUrl,
    { fetch }
  );
  const groupContainerHasChildren =
    getUrlAll(groupContainerThing, ldp.contains).length > 0;
  if (!groupContainerHasChildren) {
    await deleteContainer(groupContainerUrl, { fetch });
  }
  // then return the updated version of the group index
  return {
    dataset: updatedGroupIndexDataset,
    type: GROUP_CONTACT,
  };
}
