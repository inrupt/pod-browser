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

import { v4 as uuid } from "uuid";
import * as solidClientFns from "@inrupt/solid-client";
import {
  getSourceUrl,
  getThing,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces/dist/index";
import {
  aliceAlternativeWebIdUrl,
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockWebIdNode,
} from "../../../../__testUtils/mockPersonResource";
import {
  PERSON_CONTACT,
  createPersonDatasetUrl,
  findPersonContactInAddressBook,
  getPersonAll,
  savePersonWithSchema,
  getPersonAvatarProps,
  getProfileForContactThing,
} from "./index";
import * as contactModel from "..";
import * as profileModel from "../../profile";

import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import { chain } from "../../../solidClientHelpers/utils";
import { addIndexToMockedAddressBook } from "../../../../__testUtils/mockContact";
import mockPersonContact, {
  addPersonToMockedIndexDataset,
} from "../../../../__testUtils/mockPersonContact";
import { getContactIndexDefaultUrl } from "../collection";
import { getWebIdUrl } from "../../profile";
import { getBaseUrl } from "../../../solidClientHelpers/resource";
import { EXTERNAL_CONTACT } from "../external";

jest.mock("uuid");
const mockedUuid = uuid;

const containerUrl = "https://example.com/contacts/";
const emptyAddressBook = mockAddressBook({ containerUrl });
const peopleIndexDatasetUrl = "https://example.com/contacts/people.ttl";
const fetch = jest.fn();

const person1DatasetUrl = "https://example.com/contacts/Person/1234/index.ttl";
const person1Url = `${person1DatasetUrl}#this`;
const person1Name = "Person 1";
const person1OriginalUrl = aliceWebIdUrl;
const person1OriginalDatasetUrl = getBaseUrl(aliceWebIdUrl);

const person2DatasetUrl = "https://example.com/contacts/Person/5678/index.ttl";
const person2Url = `${person2DatasetUrl}#this`;

const personIndexWithPerson1Dataset = chain(
  mockSolidDatasetFrom(peopleIndexDatasetUrl),
  (d) =>
    addPersonToMockedIndexDataset(d, emptyAddressBook, person1Name, person1Url)
);
const addressBookWithPeopleIndex = addIndexToMockedAddressBook(
  emptyAddressBook,
  PERSON_CONTACT,
  { indexUrl: peopleIndexDatasetUrl }
);
const person1 = mockPersonContact(emptyAddressBook, person1Url, person1Name, {
  originalUrl: person1OriginalUrl,
});

describe("PERSON_CONTACT", () => {
  describe("isOfType", () => {
    it("returns true if contact is a group", () => {
      expect(PERSON_CONTACT.isOfType(person1.thing)).toBe(true);
    });
  });

  describe("getOriginalUrl", () => {
    it("returns original URL for person", () => {
      expect(PERSON_CONTACT.getOriginalUrl(person1)).toEqual(
        person1OriginalUrl
      );
    });
  });

  describe("getName", () => {
    it("returns name", () => {
      expect(PERSON_CONTACT.getName(person1)).toEqual(person1Name);
    });
  });

  describe("getAvatarProps", () => {
    it("returns props for Avatar component", () => {
      expect(PERSON_CONTACT.getAvatarProps(person1)).toEqual(
        getPersonAvatarProps(person1)
      );
    });
  });
});

describe("getPersonAvatarProps", () => {
  it("returns props for Avatar component", () => {
    expect(getPersonAvatarProps(person1)).toEqual({
      icon: "user",
      src: null,
    });
  });
});

describe("createPersonDatasetUrl", () => {
  it("creates a unique person URL", () => {
    mockedUuid.mockReturnValueOnce("1234").mockReturnValueOnce("5678");
    expect(createPersonDatasetUrl(emptyAddressBook)).toEqual(person1DatasetUrl);
    expect(createPersonDatasetUrl(emptyAddressBook)).toEqual(person2DatasetUrl);
  });

  it("allows specifying ID", () => {
    expect(createPersonDatasetUrl(emptyAddressBook, "unique")).toEqual(
      "https://example.com/contacts/Person/unique/index.ttl"
    );
  });
});

describe("getPersonAll", () => {
  it("lists all people", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(personIndexWithPerson1Dataset);
    await expect(
      getPersonAll(addressBookWithPeopleIndex, fetch)
    ).resolves.toEqual([person1]);
  });

  it("lists no people for address book with no people index", async () => {
    await expect(getPersonAll(emptyAddressBook, fetch)).resolves.toEqual([]);
  });

  it("lists no people when people index is empty", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockSolidDatasetFrom(peopleIndexDatasetUrl));
    await expect(
      getPersonAll(addressBookWithPeopleIndex, fetch)
    ).resolves.toEqual([]);
  });
});

describe("getWebIdUrl", () => {
  const webIdUrl = "http://example.com/alice#me";

  it("returns the webId for a given person dataset with a webIdNode", () => {
    const { webIdNode } = mockWebIdNode(webIdUrl, aliceAlternativeWebIdUrl);
    const dataset = mockPersonDatasetAlice();
    const thing = setUrl(
      getThing(dataset, aliceWebIdUrl),
      vcard.url,
      webIdNode
    );
    const personDataset = chain(
      mockSolidDatasetFrom("http://example.com/alice"),
      (d) => setThing(d, thing),
      (d) => setThing(d, webIdNode)
    );
    const person = {
      dataset: personDataset,
      thing,
      type: PERSON_CONTACT,
    };

    expect(getWebIdUrl(person)).toEqual(webIdUrl);
  });
});

describe("savePersonWithSchema", () => {
  const contactSchema = {
    webId: "https://example.org/profile/card#me",
    fn: "Example",
  };
  const contactSchemaWithName = {
    webId: "https://example.org/profile/card#me",
    name: "Example",
  };
  const mockedPerson = mockPersonContact(
    emptyAddressBook,
    person1Url,
    "Example",
    { originalUrl: null }
  );

  let mockedSaveSolidDatasetAt;

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockImplementation((url) => mockSolidDatasetFrom(url));
    mockedUuid.mockReturnValue("1234");
    mockedSaveSolidDatasetAt = jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockImplementation((url) => mockSolidDatasetFrom(url));
  });

  it("creates a person and adds it to the index", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(mockedPerson.dataset)
      .mockResolvedValueOnce({
        dataset: mockSolidDatasetFrom(peopleIndexDatasetUrl),
        type: PERSON_CONTACT,
      });

    const { addressBook, person } = await savePersonWithSchema(
      addressBookWithPeopleIndex,
      contactSchema,
      fetch
    );
    expect(person).toEqual(mockedPerson);
    expect(addressBook).toBe(addressBookWithPeopleIndex);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledTimes(2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      person1DatasetUrl,
      expect.any(Object),
      { fetch }
    );
  });

  it("creates a person if passed schema has name instead of fn", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(mockedPerson.dataset)
      .mockResolvedValueOnce(mockSolidDatasetFrom(peopleIndexDatasetUrl));

    const { addressBook, person } = await savePersonWithSchema(
      addressBookWithPeopleIndex,
      contactSchemaWithName,
      fetch
    );
    expect(person).toEqual(mockedPerson);
    expect(addressBook).toBe(addressBookWithPeopleIndex);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledTimes(2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      person1DatasetUrl,
      expect.any(Object),
      { fetch }
    );
  });

  it("will create the corresponding index and link it to the addressBook", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(mockedPerson.dataset)
      .mockResolvedValueOnce(addressBookWithPeopleIndex);

    const { addressBook, person } = await savePersonWithSchema(
      addressBookWithPeopleIndex,
      contactSchema,
      fetch
    );
    expect(addressBook).toEqual(addressBookWithPeopleIndex);
    expect(person).toEqual(mockedPerson);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledTimes(2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      person1DatasetUrl,
      expect.any(Object),
      { fetch }
    );

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      peopleIndexDatasetUrl,
      expect.any(Object),
      { fetch }
    );
    const updatedDataset = mockedSaveSolidDatasetAt.mock.calls[1][1];
    expect(getSourceUrl(updatedDataset)).toEqual(
      getContactIndexDefaultUrl(containerUrl, PERSON_CONTACT)
    );
  });
});

describe("findPersonContactInAddressBook", () => {
  const addressBook = mockAddressBook();
  const webId1Url = aliceWebIdUrl;
  const webId2Url = bobWebIdUrl;
  const webId1 = mockPersonDatasetAlice();
  const person1Thing = mockPersonContact(addressBook, person1Url);
  const webId2 = mockPersonDatasetBob();
  const person2Thing = mockPersonContact(addressBook, person2Url);
  const people = [
    { dataset: webId1, thing: person1Thing },
    { dataset: webId2, thing: person2Thing },
  ];
  const profiles = [
    { webId: webId1Url, avatar: null, name: "Alice" },
    { webId: webId2Url, avatar: null, name: "Bob" },
  ];

  beforeEach(() => {
    jest.spyOn(contactModel, "getContactAll").mockResolvedValue(people);
    jest
      .spyOn(profileModel, "getProfilesForPersonContactsOld")
      .mockResolvedValue(profiles);
  });

  it("finds a given WebId from a list of profiles fetched from a list of datasets about people", async () => {
    const [profile1] = await findPersonContactInAddressBook(
      addressBook,
      webId1Url,
      fetch
    );
    expect(profile1.webId).toEqual(webId1Url);
  });

  it("returns an empty list if no profile is found", async () => {
    await expect(
      findPersonContactInAddressBook(addressBook, webId2, fetch)
    ).resolves.toEqual([]);
  });
});

describe("getProfileForContactThing", () => {
  it("loads the original (probably external) profile", async () => {
    const externalProfileDataset = mockPersonDatasetAlice();
    const externalProfileThing = getThing(
      externalProfileDataset,
      person1OriginalUrl
    );
    const mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(person1.dataset)
      .mockResolvedValueOnce(externalProfileDataset);
    await expect(
      getProfileForContactThing(person1.thing, fetch)
    ).resolves.toEqual({
      dataset: externalProfileDataset,
      thing: externalProfileThing,
      type: EXTERNAL_CONTACT,
    });
  });
});
