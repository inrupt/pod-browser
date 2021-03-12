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

/* eslint no-use-before-define:off */

import { v4 as uuid } from "uuid";
import { rdf, vcard } from "rdf-namespaces";
import {
  addStringNoLocale,
  addUrl,
  asUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getSourceUrl,
  getThing,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import React from "react";
import {
  getSchemaOperations,
  mapSchema,
  vcardExtras,
} from "../../../addressBook";
import { joinPath } from "../../../stringHelpers";
import { getContactAll } from "../index";
import {
  getPersonName,
  getPersonPhotoUrl,
  getProfilesForPersonContactsOld,
  getWebIdUrl,
} from "../../profile";
import { chain, defineThing } from "../../../solidClientHelpers/utils";
import { updateOrCreateDataset } from "../../dataset";
import {
  addContactIndexToAddressBook,
  getContactIndexUrl,
} from "../collection";
import { getBaseUrl } from "../../../solidClientHelpers/resource";
import { EXTERNAL_CONTACT } from "../external";

/**
 * Person contacts represent the agents of type vcard:Individual, foaf:Person, schema:Person
 * Their location are usually at /contacts/Person/<unique-id>/index.ttl#this
 */

/* Model constants */
export const PEOPLE_INDEX_FILE = "people.ttl";
export const PERSON_CONTAINER = "Person";
export const INDEX_FILE = "index.ttl";
export const NAME_EMAIL_INDEX_PREDICATE = vcardExtras("nameEmailIndex");
export const PERSON_CONTACT = {
  container: PERSON_CONTAINER,
  indexFile: PEOPLE_INDEX_FILE,
  indexFilePredicate: NAME_EMAIL_INDEX_PREDICATE,
  contactTypeUrl: vcard.Individual,
  isOfType: (thing) =>
    !!getUrl(thing, vcardExtras("inAddressBook")) ||
    getUrlAll(thing, rdf.type).includes(vcard.Individual),
  searchNoResult: "No people found",
  getOriginalUrl: (contact) => getWebIdUrl(contact),
  getName: (contact) => getPersonName(contact),
  getAvatarProps: (contact) => getPersonAvatarProps(contact),
};

/* Model functions */
export function getPersonAvatarProps(contact) {
  return {
    icon: "user",
    src: getPersonPhotoUrl(contact),
  };
}

export function createPersonDatasetUrl(addressBook, id = uuid()) {
  return joinPath(addressBook.containerUrl, PERSON_CONTAINER, id, INDEX_FILE);
}

export async function getPersonAll(addressBook, fetch) {
  return getContactAll(addressBook, [PERSON_CONTACT], fetch);
}

export function createWebIdNode(webId, iri) {
  const webIdNode = chain(
    createThing(),
    (t) => addUrl(t, rdf.type, vcardExtras("WebId")),
    (t) => addUrl(t, vcard.value, webId)
  );
  const webIdNodeUrl = asUrl(webIdNode, iri);
  return { webIdNode, webIdNodeUrl };
}

// Deprecated
// TODO: We want to write out the uses of schema - avoid this if you can
function createPersonContactWithSchema(addressBook, contactSchema) {
  const { containerUrl: addressBookContainerUrl } = addressBook;

  const normalizedContact = {
    emails: [],
    addresses: [],
    telephones: [],
    ...contactSchema,
  };

  const id = uuid();
  const iri = joinPath(
    addressBookContainerUrl,
    PERSON_CONTAINER,
    id,
    INDEX_FILE
  );
  const { webIdNode, webIdNodeUrl } = createWebIdNode(contactSchema.webId, iri);
  const rootAttributeFns = getSchemaOperations(contactSchema, webIdNodeUrl);
  const emails = normalizedContact.emails.map(mapSchema("email"));
  const addresses = normalizedContact.addresses.map(mapSchema("address"));
  const telephones = normalizedContact.telephones.map(mapSchema("telephone"));

  const person = defineThing(
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
  const dataset = chain(
    createSolidDataset(),
    (d) => setThing(d, person),
    (d) => setThing(d, webIdNode),
    ...emails
      .concat(addresses)
      .concat(telephones)
      .map(({ thing }) => (d) => setThing(d, thing))
  );
  return {
    iri,
    dataset,
  };
}

// Deprecated
// TODO: We want to write out the uses of schema - avoid this if you can
export async function savePersonWithSchema(addressBook, contactSchema, fetch) {
  const indexIri = asUrl(addressBook.thing);
  const newContact = createPersonContactWithSchema(addressBook, contactSchema);
  const { iri, dataset } = newContact;
  const personDataset = await saveSolidDatasetAt(iri, dataset, { fetch });
  const personThing = defineThing(
    {
      url: `${getSourceUrl(personDataset)}#this`,
    },
    (t) =>
      addStringNoLocale(t, vcard.fn, contactSchema.fn || contactSchema.name),
    (t) => addUrl(t, vcardExtras("inAddressBook"), indexIri)
  );

  let updatedAddressBook = addressBook;
  let personIndexUrl = getContactIndexUrl(addressBook, PERSON_CONTACT);
  if (!personIndexUrl) {
    updatedAddressBook = await addContactIndexToAddressBook(
      addressBook,
      PERSON_CONTACT,
      fetch
    );
    personIndexUrl = getContactIndexUrl(updatedAddressBook, PERSON_CONTACT);
  }

  const indexDataset = await updateOrCreateDataset(personIndexUrl, fetch, (d) =>
    setThing(d, personThing)
  );

  return {
    addressBook: updatedAddressBook,
    person: {
      dataset: personDataset,
      thing: personThing,
      type: PERSON_CONTACT,
    },
    personIndex: indexDataset,
  };
}

export async function findPersonContactInAddressBook(
  addressBook,
  webId,
  fetch
) {
  const people = await getPersonAll(addressBook, fetch);
  const profiles = await getProfilesForPersonContactsOld(people, fetch);
  return profiles.filter((profile) => profile.webId === webId);
}

export async function getProfileForContactThing(contactThing, fetch) {
  const localProfileUrl = asUrl(contactThing);
  const localProfileDatasetUrl = getBaseUrl(localProfileUrl);
  const localProfileDataset = await getSolidDataset(localProfileDatasetUrl, {
    fetch,
  });
  const localProfileThing = getThing(localProfileDataset, localProfileUrl);
  const webIdUrl = getWebIdUrl({
    dataset: localProfileDataset,
    thing: localProfileThing,
  });
  const dataset = await getSolidDataset(webIdUrl, { fetch });
  const thing = getThing(dataset, webIdUrl);
  return {
    dataset,
    thing,
    type: EXTERNAL_CONTACT,
  };
}
