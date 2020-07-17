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
import * as litSolidFns from "@solid/lit-pod";
import {
  arrayContainsIri,
  Iri,
  iriAsString,
  stringAsIri,
} from "@solid/lit-pod";
import { RDF, DCTERMS, FOAF, VCARD, LDP } from "@solid/lit-vocab-common";
import { WS } from "@solid/lit-vocab-solid";
import * as litSolidHelpers from "./index";
import INRUPT_TEST_IRI from "../GENERATED/INRUPT_TEST_IRI";

const {
  displayPermissions,
  fetchFileWithAcl,
  fetchProfile,
  fetchResource,
  fetchResourceWithAcl,
  getIriPath,
  getThirdPartyPermissions,
  getUserPermissions,
  isUserOrMatch,
  normalizeDataset,
  normalizePermissions,
  parseStringAcl,
  permissionsFromWacAllowHeaders,
} = litSolidHelpers;

const {
  addIri,
  createLitDataset,
  createThing,
  setDatetime,
  setDecimal,
  setInteger,
  setThing,
} = litSolidFns;

const timestamp = new Date(Date.UTC(2020, 5, 2, 15, 59, 21));

function createResource(
  iri: Iri,
  type: Iri = LDP.BasicContainer
): litSolidFns.LitDataset {
  let publicContainer = createThing({ url: iri });

  publicContainer = addIri(publicContainer, RDF.type, type);

  publicContainer = addIri(publicContainer, RDF.type, LDP.Container);

  publicContainer = setDatetime(publicContainer, DCTERMS.modified, timestamp);

  publicContainer = addIri(
    publicContainer,
    LDP.contains,
    stringAsIri("https://user.dev.inrupt.net/public/games/")
  );

  publicContainer = setDecimal(
    publicContainer,
    stringAsIri("http://www.w3.org/ns/posix/stat#mtime"),
    1591131561.195
  );

  publicContainer = setInteger(
    publicContainer,
    stringAsIri("http://www.w3.org/ns/posix/stat#size"),
    4096
  );

  return setThing(createLitDataset(), publicContainer);
}

describe("normalizeDataset", () => {
  test("it returns a normalized dataset", () => {
    const containerIri = stringAsIri("https://user.dev.inrupt.net/public/");
    const litDataset = createResource(containerIri);
    const { iri, types, mtime, modified, size, contains } = normalizeDataset(
      litDataset,
      containerIri
    );
    expect(iri).toEqual(containerIri);
    expect(types).toContain("Basic container");
    expect(types).toContain("Container");
    expect(mtime).toEqual(1591131561.195);
    expect(modified).toEqual(new Date(Date.UTC(2020, 5, 2, 15, 59, 21)));
    expect(size).toEqual(4096);
    expect(
      arrayContainsIri(
        contains,
        stringAsIri("https://user.dev.inrupt.net/public/games/")
      )
    ).toBeTruthy();
  });

  test("it uses full type if no human-friendly name found", () => {
    const containerIri = stringAsIri("https://user.dev.inrupt.net/public/");
    const litDataset = createResource(
      containerIri,
      stringAsIri("http://www.w3.org/ns/ldp#UnknownType")
    );
    const { types } = normalizeDataset(litDataset, containerIri);

    expect(types).toContain("http://www.w3.org/ns/ldp#UnknownType");
    expect(types).toContain("Container");
  });
});

describe("displayPermissions", () => {
  test("it returns 'Full Control' when all options are true", () => {
    const perms = displayPermissions({
      read: true,
      write: true,
      append: true,
      control: true,
    });

    expect(perms).toEqual("Full Control");
  });

  test("it returns 'No Access' when all options are false", () => {
    const perms = displayPermissions({
      read: false,
      write: false,
      append: false,
      control: false,
    });

    expect(perms).toEqual("No Access");
  });

  test("it returns 'Can Edit' when write permissions are true", () => {
    const perms = displayPermissions({
      read: true,
      write: true,
      append: true,
      control: false,
    });

    expect(perms).toEqual("Can Edit");
  });

  test("it returns 'Can View' when read permissions are true", () => {
    const perms = displayPermissions({
      read: true,
      write: false,
      append: false,
      control: false,
    });

    expect(perms).toEqual("Can View");
  });
});

describe("normalizePermissions", () => {
  test("it returns the webId and the human-friendly permission name", async () => {
    const acl = {
      acl1: { read: true, write: false, control: false, append: false },
      acl2: { read: true, write: true, control: true, append: true },
      acl3: { read: true, write: true, control: false, append: true },
      acl4: { read: false, write: false, control: false, append: false },
    };

    const expectedProfile = {
      avatar: stringAsIri("http://example.com/avatar.png"),
      name: "string",
      nickname: "string",
    };

    const fetchProfileFn = jest.fn().mockResolvedValue(expectedProfile);

    const [perms1, perms2, perms3, perms4] = await normalizePermissions(
      acl,
      fetchProfileFn
    );

    expect(perms1.webId).toEqual(stringAsIri("acl1"));
    expect(perms1.alias).toEqual("Can View");
    expect(perms1.acl).toMatchObject(acl.acl1);
    expect(perms1.profile).toMatchObject(expectedProfile);

    expect(perms2.webId).toEqual(stringAsIri("acl2"));
    expect(perms2.alias).toEqual("Full Control");
    expect(perms2.acl).toMatchObject(acl.acl2);
    expect(perms2.profile).toMatchObject(expectedProfile);

    expect(perms3.webId).toEqual(stringAsIri("acl3"));
    expect(perms3.alias).toEqual("Can Edit");
    expect(perms3.acl).toMatchObject(acl.acl3);
    expect(perms3.profile).toMatchObject(expectedProfile);

    expect(perms4.webId).toEqual(stringAsIri("acl4"));
    expect(perms4.alias).toEqual("No Access");
    expect(perms4.acl).toMatchObject(acl.acl4);
    expect(perms4.profile).toMatchObject(expectedProfile);
  });
});

describe("getIriPath", () => {
  test("it extracts the pathname from the iri", () => {
    const path1 = getIriPath(
      stringAsIri("https://user.dev.inrupt.net/public/")
    );
    const path2 = getIriPath(
      stringAsIri("https://user.dev.inrupt.net/public/games/tictactoe/data.ttl")
    );

    expect(path1).toEqual("/public");
    expect(path2).toEqual("/public/games/tictactoe/data.ttl");
  });
});

describe("fetchResourceWithAcl", () => {
  test("it returns a normalized dataset", async () => {
    const perms = {
      owner: { read: true, write: true, append: true, control: true },
      collaborator: {
        read: true,
        write: false,
        append: true,
        control: false,
      },
    };

    const expectedIri = stringAsIri("https://user.dev.inrupt.net/public/");

    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessAll")
      .mockImplementationOnce(async () => {
        return Promise.resolve(perms);
      });

    const normalizePermissionsFn = jest.fn().mockResolvedValue([
      {
        webId: Object.keys(perms)[0],
        alias: displayPermissions(Object.values(perms)[0]),
        acl: Object.values(perms)[0],
      },
      {
        webId: Object.keys(perms)[1],
        alias: displayPermissions(Object.values(perms)[1]),
        acl: Object.values(perms)[1],
      },
    ]);

    const normalizedResource = await fetchResourceWithAcl(
      expectedIri,
      normalizePermissionsFn
    );
    const {
      iri,
      contains,
      modified,
      mtime,
      size,
      types,
      permissions,
    } = normalizedResource;
    const ownerPerms = permissions[0];
    const collaboratorPerms = permissions[1];

    expect(iri).toEqual(expectedIri);
    expect(contains).toBeInstanceOf(Array);
    expect(modified).toEqual(timestamp);
    expect(mtime).toEqual(1591131561.195);
    expect(size).toEqual(4096);

    expect(types).toContain("Basic container");
    expect(types).toContain("Container");

    expect(ownerPerms.webId).toEqual("owner");
    expect(ownerPerms.alias).toEqual("Full Control");
    expect(ownerPerms.acl).toMatchObject(perms.owner);

    expect(collaboratorPerms.webId).toEqual("collaborator");
    expect(collaboratorPerms.alias).toEqual("Can View");
    expect(collaboratorPerms.acl).toMatchObject(perms.collaborator);
  });

  test("it returns no permissions when acl is not returned", async () => {
    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessAll")
      .mockImplementationOnce(async () => {
        return Promise.resolve(undefined);
      });

    const { permissions, acl } = await fetchResourceWithAcl(
      "https://user.dev.inrupt.net/public/"
    );

    expect(permissions).toBeUndefined();
    expect(acl).toBeUndefined();
  });
});

describe("getUserPermissions", () => {
  test("it returns the permissions for the given webId", async () => {
    const acl = {
      acl1: { read: true, write: false, control: false, append: false },
      acl2: { read: true, write: true, control: true, append: true },
      acl3: { read: true, write: true, control: false, append: true },
      acl4: { read: false, write: false, control: false, append: false },
    };

    const normalizedPermissions = await normalizePermissions(
      acl,
      jest.fn().mockResolvedValue(null)
    );
    const permissions = getUserPermissions(
      stringAsIri("acl1"),
      normalizedPermissions
    );

    expect(permissions?.webId).toEqual(stringAsIri("acl1"));
    expect(permissions?.alias).toEqual("Can View");
    expect(permissions?.acl).toMatchObject(acl.acl1);
  });

  test("it returns null if given no permissions", () => {
    expect(getUserPermissions("webId")).toBeNull();
  });

  test("it returns null if it can't find a permission matching the web id", () => {
    const permissions = [
      {
        webId: stringAsIri("test"),
        alias: "Can View",
        acl: { read: true, write: false, control: false, append: false },
        profile: { webId: stringAsIri("test") },
      },
    ];

    const userPermissions = getUserPermissions(
      stringAsIri("acl1"),
      permissions
    );

    expect(userPermissions).toBeNull();
  });
});

describe("getThirdPartyPermissions", () => {
  test("it returns the permissions that don't belong to the given webId", async () => {
    const acl = {
      acl1: { read: true, write: false, control: false, append: false },
      acl2: { read: true, write: true, control: true, append: true },
      acl3: { read: true, write: true, control: false, append: true },
      acl4: { read: false, write: false, control: false, append: false },
    };

    const normalizedPermissions = await normalizePermissions(
      acl,
      jest.fn().mockResolvedValue(null)
    );
    const thirdPartyPermissions = getThirdPartyPermissions(
      stringAsIri("acl1"),
      normalizedPermissions
    );
    const [perms2, perms3, perms4] = thirdPartyPermissions;

    expect(
      thirdPartyPermissions.map(({ webId }) => iriAsString(webId))
    ).not.toContain("acl1");

    expect(perms2.webId).toEqual(stringAsIri("acl2"));
    expect(perms2.alias).toEqual("Full Control");
    expect(perms2.acl).toMatchObject(acl.acl2);

    expect(perms3.webId).toEqual(stringAsIri("acl3"));
    expect(perms3.alias).toEqual("Can Edit");
    expect(perms3.acl).toMatchObject(acl.acl3);

    expect(perms4.webId).toEqual(stringAsIri("acl4"));
    expect(perms4.alias).toEqual("No Access");
    expect(perms4.acl).toMatchObject(acl.acl4);
  });

  test("it returns an empty Array if given no permissions", () => {
    expect(
      getThirdPartyPermissions(INRUPT_TEST_IRI.somePodWebId)
    ).toBeInstanceOf(Array);
    expect(getThirdPartyPermissions(INRUPT_TEST_IRI.somePodWebId)).toHaveLength(
      0
    );
  });
});

describe("isUserOrMatch", () => {
  test("it returns true when given two matching ids", () => {
    expect(
      isUserOrMatch(INRUPT_TEST_IRI.somePodWebId, INRUPT_TEST_IRI.somePodWebId)
    ).toBe(true);
  });

  test("it returns false when given two unique ids", () => {
    expect(
      isUserOrMatch(
        INRUPT_TEST_IRI.somePodWebId,
        INRUPT_TEST_IRI.someOtherPodWebId
      )
    ).toBe(false);
  });

  test("it returns true when given the string 'user'", () => {
    expect(isUserOrMatch(stringAsIri("user"), stringAsIri("anything"))).toBe(
      true
    );
  });
});

describe("parseStringAcl", () => {
  test("it parses a list of string permissions into an unstable_Access", () => {
    const fullControl = parseStringAcl("read write append control");

    expect(fullControl.read).toBe(true);
    expect(fullControl.write).toBe(true);
    expect(fullControl.append).toBe(true);
    expect(fullControl.control).toBe(true);

    const readWrite = parseStringAcl("read write");

    expect(readWrite.read).toBe(true);
    expect(readWrite.write).toBe(true);
    expect(readWrite.append).toBe(false);
    expect(readWrite.control).toBe(false);

    const noAccess = parseStringAcl("");

    expect(noAccess.read).toBe(false);
    expect(noAccess.write).toBe(false);
    expect(noAccess.append).toBe(false);
    expect(noAccess.control).toBe(false);
  });
});

describe("permissionsFromWacAllowHeaders", () => {
  test("it parses wac-allow headers into NormalizedPermissions", () => {
    const wacAllow = 'user="read write append control",public="read"';
    const [user, publicPerms] = permissionsFromWacAllowHeaders(wacAllow);

    expect(user.webId).toEqual(stringAsIri("user"));
    expect(user.alias).toEqual("Full Control");
    expect(user.acl).toMatchObject({
      read: true,
      write: true,
      append: true,
      control: true,
    });
    expect(user.profile.name).toEqual("user");

    expect(publicPerms.webId).toEqual(stringAsIri("public"));
    expect(publicPerms.alias).toEqual("Can View");
    expect(publicPerms.acl).toMatchObject({
      read: true,
      write: false,
      append: false,
      control: false,
    });
    expect(publicPerms.profile.name).toEqual("public");
  });

  test("it returns an emtpy array when given no string", () => {
    expect(permissionsFromWacAllowHeaders()).toBeInstanceOf(Array);
    expect(permissionsFromWacAllowHeaders()).toHaveLength(0);
  });
});

describe("fetchFileWithAcl", () => {
  test("it fetches a file and parses the wac-allow header", async () => {
    jest.spyOn(litSolidFns, "unstable_fetchFile").mockResolvedValue({
      text: "file contents",
      resourceInfo: {
        contentType: "type",
        unstable_permissions: {
          user: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          public: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      },
    });

    const fileIri = stringAsIri("some iri");
    const { iri, permissions, types } = await fetchFileWithAcl(fileIri);

    expect(iri).toEqual(fileIri);
    expect(types).toContain("type");
    expect(permissions).toHaveLength(2);
  });

  test("it defaults to empty permissions if none are returned", async () => {
    jest.spyOn(litSolidFns, "unstable_fetchFile").mockResolvedValue({
      text: "file contents",
      resourceInfo: {
        contentType: "type",
      },
    });

    const { permissions } = await fetchFileWithAcl(stringAsIri("some iri"));

    expect(permissions).toHaveLength(0);
  });

  test("it defaults to an empty array if there is no type", async () => {
    jest.spyOn(litSolidFns, "unstable_fetchFile").mockResolvedValue({
      text: "file contents",
      resourceInfo: {},
    });

    const { types } = await fetchFileWithAcl(stringAsIri("some iri"));

    expect(types).toHaveLength(0);
  });
});

describe("fetchResource", () => {
  test("it returns a normalized dataset, without permissions", async () => {
    jest
      .spyOn(litSolidFns, "fetchLitDataset")
      .mockImplementationOnce(async () => Promise.resolve());

    const normalizeDatasetFn = jest.fn().mockResolvedValue(null);

    const expectedIri = stringAsIri("https://user.dev.inrupt.net/public/");
    await fetchResource(expectedIri, normalizeDatasetFn);

    expect(normalizeDatasetFn).toHaveBeenCalled();
  });

  test("it returns no permissions when acl is not returned", async () => {
    jest
      .spyOn(litSolidFns, "fetchLitDataset")
      .mockImplementationOnce(async () => Promise.resolve());

    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessAll")
      .mockImplementationOnce(async () => {
        return Promise.resolve(undefined);
      });

    const { permissions, acl } = await fetchResourceWithAcl(
      stringAsIri("https://user.dev.inrupt.net/public/")
    );

    expect(permissions).toBeUndefined();
    expect(acl).toBeUndefined();
  });
});

describe("fetchProfile", () => {
  it("fetches a profile and its information", async () => {
    const profileWebId = stringAsIri(
      "https://mypod.myhost.com/profile/card#me"
    );
    const profileDataset = {};

    jest
      .spyOn(litSolidFns, "fetchLitDataset")
      .mockResolvedValue(profileDataset);

    jest.spyOn(litSolidFns, "getThingOne").mockReturnValue(profileDataset);

    jest
      .spyOn(litSolidFns, "getStringUnlocalizedOne")
      .mockImplementationOnce(() => null);

    jest
      .spyOn(litSolidFns, "getStringUnlocalizedOne")
      .mockImplementationOnce(() => null);

    jest.spyOn(litSolidFns, "getIriOne").mockImplementationOnce(() => null);

    jest.spyOn(litSolidFns, "getIriAll").mockImplementationOnce(() => null);

    const profile = await fetchProfile(profileWebId);

    expect(litSolidFns.fetchLitDataset).toHaveBeenCalledWith(profileWebId);
    expect(litSolidFns.getStringUnlocalizedOne).toHaveBeenCalledWith(
      profileDataset,
      FOAF.nick
    );
    expect(litSolidFns.getStringUnlocalizedOne).toHaveBeenCalledWith(
      profileDataset,
      FOAF.name
    );
    expect(litSolidFns.getIriOne).toHaveBeenCalledWith(
      profileDataset,
      VCARD.hasPhoto
    );
    expect(litSolidFns.getIriAll).toHaveBeenCalledWith(
      profileDataset,
      WS.storage
    );
    expect(Object.keys(profile)).toEqual([
      "webId",
      "nickname",
      "name",
      "avatar",
      "pods",
    ]);
  });
});
