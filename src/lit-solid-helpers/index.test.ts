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
import { ldp, space } from "rdf-namespaces";
import * as litSolidFns from "@solid/lit-pod";
import {
  displayPermissions,
  displayTypes,
  fetchFileWithAcl,
  fetchProfile,
  fetchResource,
  fetchResourceWithAcl,
  getIriPath,
  getThirdPartyPermissions,
  getTypeName,
  getUserPermissions,
  isUserOrMatch,
  namespace,
  normalizeDataset,
  normalizePermissions,
  parseStringAcl,
  permissionsFromWacAllowHeaders,
} from "./index";

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
  iri: string,
  type = "http://www.w3.org/ns/ldp#BasicContainer"
): litSolidFns.LitDataset {
  let publicContainer = createThing({ iri });

  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    type
  );

  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "http://www.w3.org/ns/ldp#Container"
  );

  publicContainer = setDatetime(
    publicContainer,
    "http://purl.org/dc/terms/modified",
    timestamp
  );

  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/ns/ldp#contains",
    "https://user.dev.inrupt.net/public/games/"
  );

  publicContainer = setDecimal(
    publicContainer,
    "http://www.w3.org/ns/posix/stat#mtime",
    1591131561.195
  );

  publicContainer = setInteger(
    publicContainer,
    "http://www.w3.org/ns/posix/stat#size",
    4096
  );

  return setThing(createLitDataset(), publicContainer);
}

describe("namespace", () => {
  test("it reflects all the keys and values", () => {
    Object.keys(namespace).forEach((key) => {
      const value = namespace[key];
      expect(value).not.toBeUndefined();
      expect(namespace[value]).toEqual(key);
    });
  });

  test("it contains all the definitions in ldp", () => {
    const ldpWithType: Record<string, string> = ldp;
    Object.keys(ldpWithType).forEach((key) => {
      const value = namespace[key];
      const expectedValue = ldpWithType[key];

      expect(value).toEqual(expectedValue);
    });
  });
});

describe("getTypeName", () => {
  test("it returns the type display name", () => {
    const ldpWithType: Record<string, string> = ldp;

    Object.keys(ldpWithType).forEach((key: string): void => {
      expect(getTypeName(ldpWithType[key])).toEqual(key);
    });
  });

  test("it returns the raw type when given an invalid type", () => {
    expect(getTypeName("invalid")).toEqual("invalid");
  });

  test("it returns an empty string if given a falsey value", () => {
    expect(getTypeName(undefined)).toEqual("");
  });
});

describe("normalizeDataset", () => {
  test("it returns a normalized dataset", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    const litDataset = createResource(containerIri);
    const { iri, types, mtime, modified, size, contains } = normalizeDataset(
      litDataset,
      containerIri
    );
    expect(iri).toEqual(containerIri);
    expect(types).toContain("BasicContainer");
    expect(types).toContain("Container");
    expect(mtime).toEqual(1591131561.195);
    expect(modified).toEqual(new Date(Date.UTC(2020, 5, 2, 15, 59, 21)));
    expect(size).toEqual(4096);
    expect(contains).toContain("https://user.dev.inrupt.net/public/games/");
  });

  test("it uses full type if no human-friendly name found", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    const litDataset = createResource(
      containerIri,
      "http://www.w3.org/ns/ldp#UnknownType"
    );
    const { types } = normalizeDataset(litDataset, containerIri);

    expect(types).toContain("http://www.w3.org/ns/ldp#UnknownType");
    expect(types).toContain("Container");
  });
});

describe("displayTypes", () => {
  test("it returns a list of the human-friendly type names", () => {
    const types = displayTypes([
      "http://www.w3.org/ns/ldp#BasicContainer",
      "http://www.w3.org/ns/ldp#Container",
    ]);

    expect(types).toContain("BasicContainer");
    expect(types).toContain("Container");
  });

  test("it returns an empty Array if types are empty", () => {
    const types = displayTypes([]);
    expect(types).toHaveLength(0);
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
      avatar: "http://example.com/avatar.png",
      name: "string",
      nickname: "string",
    };

    const fetchProfileFn = jest.fn().mockResolvedValue(expectedProfile);

    const [perms1, perms2, perms3, perms4] = await normalizePermissions(
      acl,
      fetchProfileFn
    );

    expect(perms1.webId).toEqual("acl1");
    expect(perms1.alias).toEqual("Can View");
    expect(perms1.acl).toMatchObject(acl.acl1);
    expect(perms1.profile).toMatchObject(expectedProfile);

    expect(perms2.webId).toEqual("acl2");
    expect(perms2.alias).toEqual("Full Control");
    expect(perms2.acl).toMatchObject(acl.acl2);
    expect(perms2.profile).toMatchObject(expectedProfile);

    expect(perms3.webId).toEqual("acl3");
    expect(perms3.alias).toEqual("Can Edit");
    expect(perms3.acl).toMatchObject(acl.acl3);
    expect(perms3.profile).toMatchObject(expectedProfile);

    expect(perms4.webId).toEqual("acl4");
    expect(perms4.alias).toEqual("No Access");
    expect(perms4.acl).toMatchObject(acl.acl4);
    expect(perms4.profile).toMatchObject(expectedProfile);
  });
});

describe("getIriPath", () => {
  test("it extracts the pathname from the iri", () => {
    const path1 = getIriPath("https://user.dev.inrupt.net/public/");
    const path2 = getIriPath(
      "https://user.dev.inrupt.net/public/games/tictactoe/data.ttl"
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

    const expectedIri = "https://user.dev.inrupt.net/public/";

    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessModesAll")
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
    expect(types).toContain("Container");
    expect(types).toContain("BasicContainer");

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
      .spyOn(litSolidFns, "unstable_getAgentAccessModesAll")
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
    const permissions = getUserPermissions("acl1", normalizedPermissions);

    expect(permissions.webId).toEqual("acl1");
    expect(permissions.alias).toEqual("Can View");
    expect(permissions.acl).toMatchObject(acl.acl1);
  });

  test("it returns null if given no permissions", () => {
    expect(getUserPermissions("webId")).toBeNull();
  });

  test("it returns null if it can't find a permission matching the web id", () => {
    const permissions = [
      {
        webId: "test",
        alias: "Can View",
        acl: { read: true, write: false, control: false, append: false },
        profile: { webId: "test" },
      },
    ];

    const userPermissions = getUserPermissions("acl1", permissions);

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
      "acl1",
      normalizedPermissions
    );
    const [perms2, perms3, perms4] = thirdPartyPermissions;

    expect(thirdPartyPermissions.map(({ webId }) => webId)).not.toContain(
      "acl1"
    );

    expect(perms2.webId).toEqual("acl2");
    expect(perms2.alias).toEqual("Full Control");
    expect(perms2.acl).toMatchObject(acl.acl2);

    expect(perms3.webId).toEqual("acl3");
    expect(perms3.alias).toEqual("Can Edit");
    expect(perms3.acl).toMatchObject(acl.acl3);

    expect(perms4.webId).toEqual("acl4");
    expect(perms4.alias).toEqual("No Access");
    expect(perms4.acl).toMatchObject(acl.acl4);
  });

  test("it returns an empty Array if given no permissions", () => {
    expect(getThirdPartyPermissions("webId")).toBeInstanceOf(Array);
    expect(getThirdPartyPermissions("webId")).toHaveLength(0);
  });
});

describe("isUserOrMatch", () => {
  test("it returns true when given two matching ids", () => {
    expect(isUserOrMatch("webId", "webId")).toBe(true);
  });

  test("it returns false when given two unique ids", () => {
    expect(isUserOrMatch("webId", "otherId")).toBe(false);
  });

  test("it returns true when given the string 'user'", () => {
    expect(isUserOrMatch("user", "anything")).toBe(true);
  });
});

describe("parseStringAcl", () => {
  test("it parses a list of string permissions into an unstable_AccessModes", () => {
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

    expect(user.webId).toEqual("user");
    expect(user.alias).toEqual("Full Control");
    expect(user.acl).toMatchObject({
      read: true,
      write: true,
      append: true,
      control: true,
    });
    expect(user.profile.name).toEqual("user");

    expect(publicPerms.webId).toEqual("public");
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
    const headers = new Headers();
    const blob = jest.fn().mockImplementationOnce(() => "file contents");

    headers.append("content-type", "image/vnd.microsoft.icon");
    headers.append(
      "wac-allow",
      'user="read write append control",public="read"'
    );

    jest
      .spyOn(litSolidFns, "unstable_fetchFile")
      .mockImplementationOnce(async () => {
        return Promise.resolve({
          blob,
          headers,
        });
      });

    const { iri, permissions, types, file } = await fetchFileWithAcl(
      "some iri"
    );

    expect(blob).toHaveBeenCalled();
    expect(iri).toEqual("some iri");
    expect(types).toContain("image/vnd.microsoft.icon");
    expect(file).toEqual("file contents");
    expect(permissions).toHaveLength(2);
  });
});

describe("fetchResource", () => {
  test("it returns a normalized dataset, without permissions", async () => {
    jest
      .spyOn(litSolidFns, "fetchLitDataset")
      .mockImplementationOnce(async () => Promise.resolve());

    const normalizeDatasetFn = jest.fn().mockResolvedValue(null);

    const expectedIri = "https://user.dev.inrupt.net/public/";
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
      .spyOn(litSolidFns, "unstable_getAgentAccessModesAll")
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

describe("fetchProfile", () => {
  it("fetches a profile and its information", async () => {
    const profileWebId = "https://mypod.myhost.com/profile/card#me";
    const profileDataset = {};

    jest
      .spyOn(litSolidFns, "fetchLitDataset")
      .mockResolvedValue(profileDataset);

    jest.spyOn(litSolidFns, "getThingOne").mockReturnValue(profileDataset);

    jest
      .spyOn(litSolidFns, "getStringUnlocalizedOne")
      .mockImplementationOnce(async () => Promise.resolve());

    jest
      .spyOn(litSolidFns, "getStringUnlocalizedOne")
      .mockImplementationOnce(async () => Promise.resolve());

    jest
      .spyOn(litSolidFns, "getIriOne")
      .mockImplementationOnce(async () => Promise.resolve());

    jest
      .spyOn(litSolidFns, "getIriAll")
      .mockImplementationOnce(async () => Promise.resolve());

    const profile = await fetchProfile(profileWebId);

    expect(litSolidFns.fetchLitDataset).toHaveBeenCalledWith(profileWebId);
    expect(litSolidFns.getStringUnlocalizedOne).toHaveBeenCalledWith(
      profileDataset,
      namespace.nickname
    );
    expect(litSolidFns.getStringUnlocalizedOne).toHaveBeenCalledWith(
      profileDataset,
      namespace.name
    );
    expect(litSolidFns.getIriOne).toHaveBeenCalledWith(
      profileDataset,
      namespace.hasPhoto
    );
    expect(litSolidFns.getIriAll).toHaveBeenCalledWith(
      profileDataset,
      space.storage
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
