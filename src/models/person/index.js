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
  deleteFile,
  getSourceUrl,
  getThingAll,
  removeThing,
  setThing,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { foaf, rdf, vcard } from "rdf-namespaces";
import { saveResource } from "../../solidClientHelpers/resource";
import {
  getAddressBookIndexUrl,
  INDEX_FILE,
  TYPE_MAP,
  vcardExtras,
} from "../addressBook";
import { joinPath } from "../../stringHelpers";
import { getSchemaOperations, mapSchema } from "../../addressBook";
import {
  createResponder,
  defineDataset,
  defineThing,
} from "../../solidClientHelpers/utils";
import {
  createContactTypeNotFoundError,
  createWebIdNode,
  getContactsIndex,
} from "../contact";

export function createPerson(addressBook, contactSchema, types) {
  // Find the first matching container mapping.
  const containerMap = TYPE_MAP[types.find((type) => TYPE_MAP[type])];

  if (!containerMap) {
    throw createContactTypeNotFoundError(contactSchema);
  }

  const { container } = containerMap;

  const normalizedContact = {
    emails: [],
    addresses: [],
    telephones: [],
    ...contactSchema,
  };

  const id = uuid();
  const iri = joinPath(addressBook.containerIri, container, id, INDEX_FILE);
  const webIdNode = createWebIdNode(contactSchema.webId);
  const rootAttributeFns = getSchemaOperations(
    contactSchema,
    asUrl(webIdNode, iri)
  );
  const emails = normalizedContact.emails.map(mapSchema("email"));
  const addresses = normalizedContact.addresses.map(mapSchema("address"));
  const telephones = normalizedContact.telephones.map(mapSchema("telephone"));

  const personDataset = defineDataset(
    { name: "this" },
    ...[(t) => addUrl(t, rdf.type, vcard.Individual), ...rootAttributeFns],
    ...emails.map(({ name }) => {
      return (t) => addUrl(t, vcard.hasEmail, [iri, name].join("#"));
    }),
    ...addresses.map(({ name }) => {
      return (t) => addUrl(t, vcard.hasAddress, [iri, name].join("#"));
    }),
    ...telephones.map(({ name }) => {
      return (t) => addUrl(t, vcard.hasTelephone, [iri, name].join("#"));
    })
  );
  const dataset = [...emails, ...addresses, ...telephones].reduce(
    (acc, { thing }) => {
      return setThing(acc, thing);
    },
    personDataset
  );

  return {
    iri,
    dataset: setThing(dataset, webIdNode),
  };
}

export async function savePerson(addressBook, contactSchema, types, fetch) {
  const { respond, error } = createResponder();
  const newContact = createPerson(
    addressBook,
    contactSchema,
    types,
    createWebIdNodeFn
  );
  const { iri } = newContact;

  const indexIri = getAddressBookIndexUrl(addressBook);

  const {
    response: contactDataset,
    error: saveContactError,
  } = await saveResource(newContact, fetch);

  if (saveContactError) return error(saveContactError);

  const contactThing = defineThing(
    {
      url: `${getSourceUrl(contactDataset)}#this`,
    },
    (t) =>
      addStringNoLocale(t, vcard.fn, contactSchema.fn || contactSchema.name),
    (t) => addUrl(t, vcardExtras("inAddressBook"), indexIri)
  );

  const contactIndex = await getContactsIndex(addressBook, foaf.Person, fetch);
  const { error: saveContactsError } = await saveResource(
    {
      dataset: setThing(contactIndex.dataset, contactThing),
      iri: contactIndex.iri,
    },
    fetch
  );

  if (saveContactsError) return error(saveContactsError);
  return respond({ iri, dataset: contactDataset });
}

export async function deletePerson(addressBook, contact, type, fetch) {
  const { dataset, iri } = await getContactsIndex(addressBook, type, fetch);

  const contactsIndexThings = getThingAll(dataset);

  const contactsIndexEntryToRemove = contactsIndexThings.find((thing) =>
    asUrl(thing).includes(contact.iri)
  );
  const updatedContactsIndex = removeThing(dataset, contactsIndexEntryToRemove);
  const updatedContactsIndexResponse = await saveResource(
    { dataset: updatedContactsIndex, iri },
    fetch
  );

  const contactContainerIri = contact.iri.substring(
    0,
    contact.iri.lastIndexOf("/") + 1
  );

  await deleteFile(contact.iri, { fetch });
  await deleteFile(contactContainerIri, { fetch });

  const { error: saveContactsError } = updatedContactsIndexResponse;

  if (saveContactsError) {
    throw saveContactsError;
  }
}
