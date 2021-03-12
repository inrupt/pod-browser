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
  mockThingFrom,
  setUrl,
} from "@inrupt/solid-client";
import { vcard, foaf, rdf, space } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { packageProfile } from "../src/solidClientHelpers/profile";
import { vcardExtras } from "../src/addressBook";

const VCARD_WEBID_PREDICATE = vcardExtras("WebId");

export function mockWebIdNode(
  webId,
  nodeUrl = "https://example.org/contacts/Person/1234/index.ttl#4567"
) {
  const webIdNode = chain(
    mockThingFrom(nodeUrl),
    (t) => addUrl(t, rdf.type, VCARD_WEBID_PREDICATE),
    (t) => addUrl(t, vcard.value, webId)
  );
  const url = asUrl(webIdNode);
  return { webIdNode, webIdNodeUrl: url };
}

export const aliceProfileUrl = "http://alice.example.com/alice";
export const aliceWebIdUrl = "http://alice.example.com/alice#me";
export const aliceName = "Alice";
export const aliceNick = "A";
export const alicePhoto = "http://alice.example.com/alice.jpg";
export const alicePodRoot = "http://alice.example.com/";
export const aliceAlternativeProfileUrl = "https://alice2.example.org/card";
export const aliceAlternativeWebIdUrl = "https://alice2.example.org/card#me";

export function mockPersonDatasetAlice(...operations) {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => setUrl(t, rdf.type, vcard.Individual),
    (t) => addStringNoLocale(t, vcard.fn, aliceName),
    (t) => addStringNoLocale(t, vcard.nickname, aliceNick),
    (t) => addUrl(t, vcard.hasPhoto, alicePhoto),
    (t) => addUrl(t, rdf.type, foaf.Person),
    (t) => addUrl(t, vcard.url, aliceAlternativeWebIdUrl),
    (t) => addUrl(t, space.storage, alicePodRoot),
    ...operations
  );
}

export function mockProfileAlice(...operations) {
  return packageProfile(aliceWebIdUrl, mockPersonDatasetAlice(...operations));
}

export const bobProfileUrl = "http://bob.example.com/bob";
export const bobWebIdUrl = "http://bob.example.com/bob#me";
export const bobName = "Bob";
export const bobNick = "B";
export const bobPodRoot = "http://bob.example.com/";
export const bobAlternateProfileUrl = "https://bob2.example.org/card";
export const bobAlternateWebIdUrl = "https://bob2.example.org/card#me";

export function mockPersonDatasetBob() {
  return chain(
    mockThingFrom(bobWebIdUrl),
    (t) => setUrl(t, rdf.type, vcard.Individual),
    (t) => addStringNoLocale(t, foaf.name, bobName),
    (t) => addStringNoLocale(t, foaf.nick, bobNick),
    (t) => addUrl(t, rdf.type, foaf.Person),
    (t) => addUrl(t, foaf.openid, bobAlternateWebIdUrl),
    (t) => addUrl(t, space.storage, bobPodRoot)
  );
}

export function mockProfileBob() {
  return packageProfile(bobWebIdUrl, mockPersonDatasetBob());
}
