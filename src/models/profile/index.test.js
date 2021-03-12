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
import { foaf, rdf } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import {
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import * as resourceFns from "../../solidClientHelpers/resource";
import * as profileFns from "../../solidClientHelpers/profile";
import {
  aliceAlternativeWebIdUrl,
  aliceProfileUrl,
  aliceWebIdUrl,
  bobAlternateWebIdUrl,
  bobProfileUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockProfileAlice,
} from "../../../__testUtils/mockPersonResource";
import mockPersonContactThing from "../../../__testUtils/mockPersonContactThing";
import { chain } from "../../solidClientHelpers/utils";
import {
  getProfileForContactOld,
  getProfilesForPersonContactsOld,
} from "./index";
import { fetchProfile } from "../../solidClientHelpers/profile";

jest.mock("../../solidClientHelpers/profile");
const mockedFetchProfile = fetchProfile;

describe("getProfilesForPersonContacts", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it fetches the profiles of the given people contacts", async () => {
    const fetch = jest.fn();
    const person1Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person2Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person1 = {
      dataset: chain(mockSolidDatasetFrom(person1Iri), (d) =>
        setThing(
          d,
          chain(mockThingFrom(person1Iri), (t) =>
            setUrl(t, rdf.type, foaf.Person)
          )
        )
      ),
      thing: mockThingFrom(person1Iri),
    };
    const person2 = {
      dataset: chain(mockSolidDatasetFrom(person2Iri), (d) =>
        setThing(
          d,
          chain(mockThingFrom(person2Iri), (t) =>
            setUrl(t, rdf.type, foaf.Person)
          )
        )
      ),
      thing: mockThingFrom(person2Iri),
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: mockPersonContactThing(aliceAlternativeWebIdUrl),
          iri: aliceAlternativeWebIdUrl,
        },
      })
      .mockResolvedValueOnce({
        response: {
          dataset: mockPersonContactThing(bobAlternateWebIdUrl),
          iri: bobAlternateWebIdUrl,
        },
      });

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: setThing(
            solidClientFns.mockSolidDatasetFrom(aliceProfileUrl),
            mockPersonDatasetAlice()
          ),
          iri: aliceWebIdUrl,
        },
      })
      .mockResolvedValueOnce({
        response: {
          dataset: setThing(
            solidClientFns.mockSolidDatasetFrom(bobProfileUrl),
            mockPersonDatasetBob()
          ),
          iri: bobWebIdUrl,
        },
      });

    mockedFetchProfile
      .mockResolvedValueOnce({
        webId: aliceWebIdUrl,
        avatar: null,
        name: "Moo",
      })
      .mockResolvedValueOnce({
        webId: bobWebIdUrl,
        avatar: null,
        name: "Bob",
      });

    const [profile1, profile2] = await getProfilesForPersonContactsOld(
      [person1, person2],
      fetch
    );

    expect(profile1.webId).toEqual(aliceWebIdUrl);
    expect(profile2.webId).toEqual(bobWebIdUrl);
  });

  test("it filters out people for which the resource couldn't be fetched", async () => {
    const fetch = jest.fn();
    const person1Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person2Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person1 = {
      dataset: chain(mockSolidDatasetFrom(person1Iri), (d) =>
        setThing(
          d,
          chain(mockThingFrom(person1Iri), (t) =>
            setUrl(t, rdf.type, foaf.Person)
          )
        )
      ),
      thing: mockThingFrom(person1Iri),
    };
    const person2 = {
      dataset: chain(mockSolidDatasetFrom(person2Iri), (d) =>
        setThing(
          d,
          chain(mockThingFrom(person2Iri), (t) =>
            setUrl(t, rdf.type, foaf.Person)
          )
        )
      ),
      thing: mockThingFrom(person2Iri),
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: mockPersonContactThing(aliceAlternativeWebIdUrl),
          iri: aliceAlternativeWebIdUrl,
        },
      })
      .mockResolvedValueOnce({
        response: {
          dataset: mockPersonContactThing(bobAlternateWebIdUrl),
          iri: bobAlternateWebIdUrl,
        },
      });

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: setThing(
            solidClientFns.mockSolidDatasetFrom(aliceProfileUrl),
            mockPersonDatasetAlice()
          ),
          iri: aliceWebIdUrl,
        },
      })
      .mockResolvedValueOnce({
        error: "There was an error",
      });

    mockedFetchProfile.mockResolvedValueOnce({
      webId: aliceWebIdUrl,
      avatar: null,
      name: "Alice",
    });

    const profiles = await getProfilesForPersonContactsOld(
      [person1, person2],
      fetch
    );

    expect(profiles).toHaveLength(1);
  });
});

describe("getProfileForContactOld", () => {
  beforeEach(() => {
    jest.spyOn(resourceFns, "getResource").mockResolvedValue({
      response: { dataset: mockPersonDatasetAlice(), iri: aliceWebIdUrl },
    });
    jest
      .spyOn(profileFns, "fetchProfile")
      .mockResolvedValue(mockProfileAlice());
  });
  const person1Iri = "https://user.example.com/contacts/Person/1234/index.ttl";
  it("returns a profile for a person contact url", async () => {
    expect(await getProfileForContactOld(person1Iri)).toEqual(
      mockProfileAlice()
    );
  });
});
