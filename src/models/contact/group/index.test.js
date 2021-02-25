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

import * as solidClientFns from "@inrupt/solid-client";
import {
  getSourceUrl,
  getStringNoLocale,
  getThingAll,
  getUrl,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { rdf, vcard } from "rdf-namespaces/dist/index";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import {
  saveGroup,
  createGroupDatasetUrl,
  NAME_GROUP_INDEX_PREDICATE,
  renameGroup,
  GROUP_CONTACT,
  getGroupAll,
} from "./index";
import mockGroupContact, {
  addGroupToMockedIndexDataset,
} from "../../../../__testUtils/mockGroupContact";
import { chain } from "../../../solidClientHelpers/utils";
import { vcardExtras } from "../../../addressBook";
import { getContactIndexDefaultUrl, getContactIndexUrl } from "../collection";
import { addIndexToMockedAddressBook } from "../../../../__testUtils/mockContact";
import mockGroup from "../../../../__testUtils/mockGroup";

jest.mock("uuid");
const mockedUuid = uuid;

const containerUrl = "https://example.com/contacts/";
const emptyAddressBook = mockAddressBook({ containerUrl });
const groupsDatasetUrl = "https://example.com/groups.ttl";
const fetch = jest.fn();

const group1Name = "Group 1";
const mockedGroup1 = mockGroupContact(emptyAddressBook, group1Name, {
  id: "1234",
});
const group1DatasetUrl = "https://example.com/contacts/Group/1234/index.ttl";
const group1Url = `${group1DatasetUrl}#this`;

const group2DatasetUrl = "https://example.com/contacts/Group/5678/index.ttl";

const groupIndexWithGroup1Dataset = chain(
  mockSolidDatasetFrom(groupsDatasetUrl),
  (d) =>
    addGroupToMockedIndexDataset(d, emptyAddressBook, group1Name, group1Url)
);
const addressBookWithGroupIndex = addIndexToMockedAddressBook(
  emptyAddressBook,
  GROUP_CONTACT,
  { indexUrl: groupsDatasetUrl }
);

let mockedSaveSolidDatasetAt;

beforeEach(() => {
  mockedUuid.mockReturnValue("1234");
  mockedSaveSolidDatasetAt = jest
    .spyOn(solidClientFns, "saveSolidDatasetAt")
    .mockImplementation((url) => mockSolidDatasetFrom(url));
});

describe("isOfType", () => {
  it("returns true if contact is a group", () => {
    const { thing: mockGroupThing } = mockGroup(group1Name, group1Url);
    expect(GROUP_CONTACT.isOfType(mockGroupThing)).toBe(true);
  });
});

describe("createGroupDatasetUrl", () => {
  it("creates a unique group URL", () => {
    mockedUuid.mockReturnValueOnce("1234").mockReturnValueOnce("5678");
    expect(createGroupDatasetUrl(emptyAddressBook)).toEqual(group1DatasetUrl);
    expect(createGroupDatasetUrl(emptyAddressBook)).toEqual(group2DatasetUrl);
  });

  it("allows specifying ID", () => {
    expect(createGroupDatasetUrl(emptyAddressBook, "unique")).toEqual(
      "https://example.com/contacts/Group/unique/index.ttl"
    );
  });
});

describe("saveGroup", () => {
  const groupName = "test";
  const newGroup = mockGroup(groupName, group1Url);

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockImplementation((url) => mockSolidDatasetFrom(url));
  });

  it("creates a group and adds it to the index", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(newGroup.dataset)
      .mockResolvedValueOnce(groupIndexWithGroup1Dataset);

    const { addressBook, group, groupIndex } = await saveGroup(
      addressBookWithGroupIndex,
      "test",
      fetch
    );
    expect(group).toEqual(newGroup);
    expect(addressBook).toBe(addressBookWithGroupIndex);
    expect(groupIndex).toBe(groupIndexWithGroup1Dataset);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledTimes(2);

    // first save request is the group itself
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group1DatasetUrl,
      expect.any(Object),
      { fetch }
    );
    const groupDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[0][1]
    ); // TODO: Remove when we have support for getThingLocal
    const groupThing = groupDatasetThings[0];
    expect(getUrl(groupThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(groupThing, vcard.fn)).toEqual("test");
    const groupIncludesTriple = groupDatasetThings[1];
    expect(getUrl(groupIncludesTriple, vcardExtras("includesGroup"))).toEqual(
      group1Url
    );

    // second save request is the group index
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getContactIndexUrl(addressBookWithGroupIndex, GROUP_CONTACT),
      expect.any(Object),
      { fetch }
    );
    const indexDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[1][1]
    ); // TODO: Remove when we have support for getThingLocal
    const indexThing = indexDatasetThings[0];
    expect(getUrl(indexThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual("test");
    const indexIncludesTriple = indexDatasetThings[1];
    expect(getUrl(indexIncludesTriple, vcardExtras("includesGroup"))).toEqual(
      group1Url
    );
  });

  it("will create the corresponding index on the fly and link it to the addressBook", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(newGroup.dataset)
      .mockResolvedValueOnce(addressBookWithGroupIndex.dataset)
      .mockResolvedValueOnce(groupIndexWithGroup1Dataset);

    const { addressBook, group, groupIndex } = await saveGroup(
      emptyAddressBook,
      groupName,
      fetch
    );
    expect(addressBook).toEqual(addressBookWithGroupIndex);
    expect(group).toEqual(newGroup);
    expect(groupIndex).toEqual(groupIndexWithGroup1Dataset);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledTimes(3);

    // the extra request made
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getSourceUrl(emptyAddressBook.dataset),
      expect.any(Object),
      { fetch }
    );
    const updatedDataset = mockedSaveSolidDatasetAt.mock.calls[1][1];
    const [mainIndex] = getThingAll(updatedDataset);
    expect(getUrl(mainIndex, NAME_GROUP_INDEX_PREDICATE)).toEqual(
      getContactIndexDefaultUrl(containerUrl, GROUP_CONTACT)
    );
  });
});

describe("getGroupAll", () => {
  it("lists all groups", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(groupIndexWithGroup1Dataset);
    await expect(
      getGroupAll(addressBookWithGroupIndex, fetch)
    ).resolves.toEqual([mockedGroup1]);
  });

  it("lists no groups for address book with no group index", async () => {
    await expect(getGroupAll(emptyAddressBook, fetch)).resolves.toEqual([]);
  });

  it("lists no groups when group index is empty", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockSolidDatasetFrom(groupsDatasetUrl));
    await expect(
      getGroupAll(addressBookWithGroupIndex, fetch)
    ).resolves.toEqual([]);
  });
});

describe("renameGroup", () => {
  const newName = "New name";
  const mockUpdatedGroup = mockGroupContact(emptyAddressBook, newName, {
    id: "1234",
  });

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(groupIndexWithGroup1Dataset);
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(mockUpdatedGroup.dataset)
      .mockResolvedValueOnce(groupIndexWithGroup1Dataset);
  });

  it("updates the group itself and the index", async () => {
    const { group, groupIndex } = await renameGroup(
      addressBookWithGroupIndex,
      mockedGroup1,
      newName,
      fetch
    );
    expect(group).toEqual(mockUpdatedGroup);
    expect(groupIndex).toBe(groupIndexWithGroup1Dataset);

    // first save request is the group itself
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group1DatasetUrl,
      expect.any(Object),
      { fetch }
    );
    const groupDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[0][1]
    ); // TODO: Remove when we have support for getThingLocal
    const groupThing = groupDatasetThings[1];
    expect(getStringNoLocale(groupThing, vcard.fn)).toEqual(newName);

    // second save request is the group index
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getContactIndexUrl(addressBookWithGroupIndex, GROUP_CONTACT),
      expect.any(Object),
      { fetch }
    );
    const indexDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[1][1]
    ); // TODO: Remove when we have support for getThingLocal
    const indexThing = indexDatasetThings[1];
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual(newName);
  });
});
