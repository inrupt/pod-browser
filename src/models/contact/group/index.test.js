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
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { ldp, rdf, vcard } from "rdf-namespaces";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import {
  saveGroup,
  createGroupDatasetUrl,
  NAME_GROUP_INDEX_PREDICATE,
  renameGroup,
  GROUP_CONTACT,
  getGroupAll,
  deleteGroup,
} from "./index";
import mockGroupContact, {
  addGroupToMockedIndexDataset,
} from "../../../../__testUtils/mockGroupContact";
import { chain } from "../../../solidClientHelpers/utils";
import { vcardExtras } from "../../../addressBook";
import { getContactIndexDefaultUrl, getContactIndexUrl } from "../collection";
import { addIndexToMockedAddressBook } from "../../../../__testUtils/mockContact";
import mockGroup from "../../../../__testUtils/mockGroup";
import { getAddressBookThingUrl } from "../../addressBook";
import { getContainerUrl } from "../../../stringHelpers";

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

const group2Name = "Group 2";
const group2DatasetUrl = "https://example.com/contacts/Group/5678/index.ttl";
const group2Url = `${group2DatasetUrl}#this`;

const groupIndexWithGroup1Dataset = chain(
  mockSolidDatasetFrom(groupsDatasetUrl),
  (d) =>
    addGroupToMockedIndexDataset(d, emptyAddressBook, group1Name, group1Url)
);
const groupIndexWithGroup2Dataset = chain(
  mockSolidDatasetFrom(groupsDatasetUrl),
  (d) =>
    addGroupToMockedIndexDataset(d, emptyAddressBook, group2Name, group2Url)
);
const addressBookWithGroupIndex = addIndexToMockedAddressBook(
  emptyAddressBook,
  GROUP_CONTACT,
  { indexUrl: groupsDatasetUrl }
);
const groupIndexWithGroup1And2Dataset = chain(
  groupIndexWithGroup1Dataset,
  (d) =>
    addGroupToMockedIndexDataset(
      d,
      addressBookWithGroupIndex,
      group2Name,
      group2Url
    )
);
const group1ContainerUrl = getContainerUrl(group1DatasetUrl);
const group1ContainerDataset = chain(
  mockSolidDatasetFrom(group1ContainerUrl),
  (d) =>
    setThing(
      d,
      chain(mockThingFrom(group1ContainerUrl), (t) =>
        setUrl(t, rdf.type, ldp.Container)
      )
    )
);
const group1ContainerWithChildrenDataset = chain(
  mockSolidDatasetFrom(group1ContainerUrl),
  (d) =>
    setThing(
      d,
      chain(mockThingFrom(group1ContainerUrl), (t) =>
        setUrl(t, ldp.contains, group2Url)
      )
    )
);

let mockedSaveSolidDatasetAt;

beforeEach(() => {
  mockedUuid.mockReturnValue("1234");
  mockedSaveSolidDatasetAt = jest
    .spyOn(solidClientFns, "saveSolidDatasetAt")
    .mockImplementation((url) => mockSolidDatasetFrom(url));
});

describe("GROUP_CONTACT", () => {
  describe("isOfType", () => {
    it("returns true if contact is a group", () => {
      expect(GROUP_CONTACT.isOfType(mockedGroup1.thing)).toBe(true);
    });
  });

  describe("getOriginalUrl", () => {
    it("returns original URL for group", () => {
      expect(GROUP_CONTACT.getOriginalUrl(mockedGroup1)).toEqual(group1Url);
    });
  });

  describe("getName", () => {
    it("returns name of group", () => {
      expect(GROUP_CONTACT.getName(mockedGroup1)).toEqual(group1Name);
    });
  });

  describe("getAvatarProps", () => {
    it("returns props for Avatar component", () => {
      expect(GROUP_CONTACT.getAvatarProps(mockedGroup1)).toEqual({
        icon: "users",
      });
    });
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

  beforeEach(() => {});

  it("creates a group and adds it to the index", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockImplementation(() => groupIndexWithGroup2Dataset);
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(newGroup.dataset)
      .mockResolvedValueOnce(groupIndexWithGroup1And2Dataset);

    const { addressBook, group, groupIndex } = await saveGroup(
      addressBookWithGroupIndex,
      "test",
      fetch
    );
    expect(group).toEqual(newGroup);
    expect(addressBook).toBe(addressBookWithGroupIndex);
    expect(groupIndex).toEqual({
      dataset: groupIndexWithGroup1And2Dataset,
      type: GROUP_CONTACT,
    });

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
    expect(
      getUrlAll(groupIncludesTriple, vcardExtras("includesGroup"))
    ).toEqual([group1Url]);

    // second save request is the group index
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getContactIndexUrl(addressBookWithGroupIndex, GROUP_CONTACT),
      expect.any(Object),
      { fetch }
    );
    const indexDataset = mockedSaveSolidDatasetAt.mock.calls[1][1];
    const indexThing = getThing(indexDataset, group1Url);
    expect(getUrl(indexThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual("test");
    const addressBookInIndex = getThing(
      indexDataset,
      getAddressBookThingUrl(addressBookWithGroupIndex)
    );
    expect(
      getUrlAll(addressBookInIndex, vcardExtras("includesGroup"))
    ).toEqual([group2Url, group1Url]);
  });

  it("will create the corresponding index on the fly and link it to the addressBook", async () => {
    jest.spyOn(solidClientFns, "getSolidDataset").mockRejectedValue("404");
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
    expect(groupIndex).toEqual({
      dataset: groupIndexWithGroup1Dataset,
      type: GROUP_CONTACT,
    });

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
  const newDescription = "Some description";
  const mockUpdatedGroup = mockGroupContact(emptyAddressBook, newName, {
    id: "1234",
  });
  const mockUpdatedGroupWithDescription = mockGroupContact(
    emptyAddressBook,
    newName,
    {
      id: "1234",
      description: newDescription,
    }
  );

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(groupIndexWithGroup1Dataset);
  });

  it("updates the group itself and the index", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(mockUpdatedGroup.dataset)
      .mockResolvedValueOnce(groupIndexWithGroup1Dataset);
    const { group, groupIndex } = await renameGroup(
      addressBookWithGroupIndex,
      mockedGroup1,
      newName,
      fetch
    );
    expect(group).toEqual(mockUpdatedGroup);
    expect(groupIndex).toEqual({
      dataset: groupIndexWithGroup1Dataset,
      type: GROUP_CONTACT,
    });

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
    expect(getStringNoLocale(groupThing, vcard.note)).toBeNull();

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
    expect(getStringNoLocale(indexThing, vcard.note)).toBeNull();
  });

  it("also allows updating the description", async () => {
    mockedSaveSolidDatasetAt
      .mockResolvedValueOnce(mockUpdatedGroupWithDescription.dataset)
      .mockResolvedValueOnce(groupIndexWithGroup1Dataset);
    const { group } = await renameGroup(
      addressBookWithGroupIndex,
      mockedGroup1,
      newName,
      fetch,
      {
        [vcard.note]: newDescription,
      }
    );
    expect(group).toEqual(mockUpdatedGroupWithDescription);

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
    expect(getStringNoLocale(groupThing, vcard.note)).toEqual(newDescription);
  });
});

describe("deleteGroup", () => {
  let mockedGetSolidDataset;
  let mockedDeleteFile;
  let mockedDeleteContainer;

  beforeEach(() => {
    mockedSaveSolidDatasetAt.mockResolvedValueOnce(
      groupIndexWithGroup2Dataset.dataset
    );
    mockedDeleteFile = jest
      .spyOn(solidClientFns, "deleteFile")
      .mockResolvedValue({});
    mockedDeleteContainer = jest
      .spyOn(solidClientFns, "deleteContainer")
      .mockResolvedValue({});
  });

  it("deletes the group and its entry in the group index", async () => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(groupIndexWithGroup1And2Dataset)
      .mockResolvedValueOnce(group1ContainerDataset);
    await expect(
      deleteGroup(addressBookWithGroupIndex, mockedGroup1, fetch)
    ).resolves.toEqual({
      dataset: groupIndexWithGroup2Dataset.dataset,
      type: GROUP_CONTACT,
    });
    expect(mockedGetSolidDataset).toHaveBeenCalledWith(groupsDatasetUrl, {
      fetch,
    });
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      groupsDatasetUrl,
      groupIndexWithGroup2Dataset,
      { fetch }
    );
    expect(mockedDeleteFile).toHaveBeenCalledWith(group1Url, { fetch });
    expect(mockedGetSolidDataset).toHaveBeenCalledWith(group1ContainerUrl, {
      fetch,
    });
    expect(mockedDeleteContainer).toHaveBeenCalledWith(group1ContainerUrl, {
      fetch,
    });
  });

  it("avoids deleting container if it still has children", async () => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(groupIndexWithGroup1And2Dataset)
      .mockResolvedValueOnce(group1ContainerWithChildrenDataset);
    await expect(
      deleteGroup(addressBookWithGroupIndex, mockedGroup1, fetch)
    ).resolves.toBeDefined();
    expect(mockedDeleteContainer).not.toHaveBeenCalled();
  });
});
