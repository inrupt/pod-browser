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
  mockSolidDatasetFrom,
  mockThingFrom,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { vcardExtras } from "../src/addressBook";
import { getBaseUrl } from "../src/solidClientHelpers/resource";
import { PERSON_CONTACT } from "../src/models/contact/person";
import { aliceWebIdUrl } from "./mockPersonResource";

function mockContactPersonThing(
  addressBook,
  personThingUrl,
  name,
  originalUrl = aliceWebIdUrl
) {
  return chain(
    mockThingFrom(personThingUrl),
    (t) => setStringNoLocale(t, vcard.fn, name),
    (t) => setUrl(t, vcardExtras("inAddressBook"), asUrl(addressBook.thing)),
    ...(originalUrl ? [(t) => setUrl(t, foaf.openid, originalUrl)] : [])
  );
}

// eslint-disable-next-line import/prefer-default-export
export function addPersonToMockedIndexDataset(
  dataset,
  addressBook,
  name,
  personThingUrl,
  options = {}
) {
  return chain(dataset, (d) =>
    setThing(
      d,
      mockContactPersonThing(
        addressBook,
        personThingUrl,
        name,
        options.originalUrl
      )
    )
  );
}

export default function mockPersonContact(
  addressBook,
  personThingUrl,
  name,
  options = {}
) {
  const thing = mockContactPersonThing(
    addressBook,
    personThingUrl,
    name,
    options.originalUrl
  );
  const dataset = setThing(
    mockSolidDatasetFrom(getBaseUrl(personThingUrl)),
    thing
  );
  return { dataset, thing, type: PERSON_CONTACT };
}
