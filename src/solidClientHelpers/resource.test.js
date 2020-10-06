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
import * as SolidClientFns from "@inrupt/solid-client";
import createContainer, { TIMESTAMP } from "../../__testUtils/createContainer";
import * as permissionFns from "./permissions";
import {
  fetchFileWithAcl,
  fetchResourceWithAcl,
  getResource,
  getResourceName,
  getResourceWithPermissions,
  labelOrUrl,
  normalizePermissions,
  saveResource,
} from "./resource";
import { createAccessMap } from "./permissions";

const { displayPermissions, ACL } = permissionFns;

describe("fetchFileWithAcl", () => {
  test("it fetches a file and parses the wac-allow header", async () => {
    jest.spyOn(SolidClientFns, "getFile").mockResolvedValue({
      text: "file contents",
      internal_resourceInfo: {
        contentType: "type",
        permissions: {
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

    const fetch = jest.fn();
    const { iri, permissions, types } = await fetchFileWithAcl(
      "some iri",
      fetch
    );

    // TODO fix this broken shit
    expect(iri).toEqual("some iri");
    expect(types).toContain("type");
    expect(permissions).toHaveLength(2);
  });

  test("it defaults to empty permissions if none are returned", async () => {
    jest.spyOn(SolidClientFns, "getFile").mockResolvedValue({
      text: "file contents",
      internal_resourceInfo: {
        contentType: "type",
      },
    });

    const { permissions } = await fetchFileWithAcl("some iri");

    expect(permissions).toHaveLength(0);
  });

  test("it defaults to an empty array if there is no type", async () => {
    jest.spyOn(SolidClientFns, "getFile").mockResolvedValue({
      text: "file contents",
      internal_resourceInfo: {},
    });

    const { types } = await fetchFileWithAcl("some iri");

    expect(types).toHaveLength(0);
  });
});

describe("fetchResourceWithAcl", () => {
  test("it returns a normalized dataset", async () => {
    const perms = {
      owner: createAccessMap(true, true, true, true),
      collaborator: createAccessMap(true, false, true, false),
    };

    const expectedIri = "https://user.dev.inrupt.net/public/";

    jest
      .spyOn(SolidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(createContainer());
    jest
      .spyOn(SolidClientFns, "getAgentAccessAll")
      .mockResolvedValueOnce(perms);

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
      jest.fn(),
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
    expect(modified).toEqual(TIMESTAMP);
    expect(mtime).toEqual(1591131561.195);
    expect(size).toEqual(4096);
    expect(types).toContain("Container");
    expect(types).toContain("BasicContainer");

    expect(ownerPerms.webId).toEqual("owner");
    expect(ownerPerms.alias).toEqual(ACL.CONTROL.alias);
    expect(ownerPerms.acl).toMatchObject(perms.owner);

    expect(collaboratorPerms.webId).toEqual("collaborator");
    expect(collaboratorPerms.alias).toEqual("Append");
    expect(collaboratorPerms.acl).toMatchObject(perms.collaborator);
  });

  test("it returns no permissions when acl is not returned", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(createContainer());

    jest
      .spyOn(SolidClientFns, "getAgentAccessAll")
      .mockResolvedValueOnce(undefined);

    const { permissions, acl: access } = await fetchResourceWithAcl(
      "https://user.dev.inrupt.net/public/"
    );

    expect(permissions).toMatchObject([]);
    expect(access).toBeUndefined();
  });
});

describe("getResource", () => {
  test("it returns a dataset and an iri", async () => {
    const dataset = createContainer();
    jest
      .spyOn(SolidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(dataset);
    const iri = "https://user.example.com";
    const { response } = await getResource(iri, jest.fn());

    expect(response.iri).toEqual(iri);
    expect(response.dataset).toEqual(dataset);
  });

  test("it returns an error message when it throws an error", async () => {
    jest.spyOn(SolidClientFns, "getSolidDataset").mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const iri = "https://user.example.com";
    const { error } = await getResource(iri, jest.fn());

    expect(error).toEqual("boom");
  });
});

describe("getResourceName", () => {
  test("it returns the resource name string when given a resource pathname", () => {
    const resourceName = getResourceName("/public/games/tictactoe/data.ttl");

    expect(resourceName).toEqual("data.ttl");
  });
  test("it returns the resource name string when given a container pathname", () => {
    const resourceName = getResourceName("/public/games/tictactoe/");

    expect(resourceName).toEqual("tictactoe");
  });

  test("it returns the decoded resource name when spaces and special characters have been URI encoded", () => {
    const resourceName = getResourceName(
      "public/notes/Hello%20World%3AHello%40World%3BHello.txt"
    );
    expect(resourceName).toEqual("Hello World:Hello@World;Hello.txt");
  });
});

describe("getResourceWithPermissions", () => {
  test("it returns a dataset, an iri, and permissions", async () => {
    const iri = "https://user.example.com";
    const dataset = createContainer(iri);
    const fetch = jest.fn();
    const access = { [iri]: ACL.CONTROL.acl };
    jest
      .spyOn(SolidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(SolidClientFns, "getAgentAccessAll").mockReturnValueOnce(access);

    const { response } = await getResourceWithPermissions(iri, fetch);

    expect(response.iri).toEqual(iri);
    expect(response.dataset).toEqual(dataset);
    expect(response.permissions).toMatchObject([
      {
        acl: ACL.CONTROL.acl,
        alias: ACL.CONTROL.alias,
        webId: iri,
      },
    ]);
  });

  test("it returns an error message when it throws an error", async () => {
    jest
      .spyOn(SolidClientFns, "getSolidDatasetWithAcl")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });
    const iri = "https://user.example.com";
    const { error } = await getResourceWithPermissions(iri, jest.fn());

    expect(error).toEqual("boom");
  });
});

describe("normalizePermissions", () => {
  test("returns a normalized version of the permissions", () => {
    const webId = "https://user.example.com/card#me";
    const permissions = { [webId]: ACL.CONTROL.acl };
    const [normalized] = normalizePermissions(permissions);

    expect(normalized.webId).toEqual(webId);
    expect(normalized.acl).toMatchObject(ACL.CONTROL.acl);
    expect(normalized.alias).toEqual(ACL.CONTROL.alias);
  });

  test("it returns an empty array when given nothing", () => {
    const normalized = normalizePermissions();

    expect(normalized).toHaveLength(0);
  });
});

describe("labelOrUrl", () => {
  test("it returns the hash if it exists", () => {
    const label = labelOrUrl("https://namespace.com/test#attribute");
    expect(label).toEqual("attribute");
  });

  test("it returns the complete url if no hash exists", () => {
    const url = labelOrUrl("https://namespace.com/test");
    expect(url).toEqual("https://namespace.com/test");
  });

  test("when the hash is 'this', it is translated to 'root'", () => {
    const label = labelOrUrl("https://namespace.com/test#this");
    expect(label).toEqual("root");
  });
});

describe("saveResource", () => {
  test("it saves the given resource", async () => {
    const fetch = jest.fn();
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValueOnce("resource");

    const { response } = await saveResource(
      { dataset: "dataset", iri: "iri" },
      fetch
    );

    expect(SolidClientFns.saveSolidDatasetAt).toHaveBeenCalledWith(
      "iri",
      "dataset",
      { fetch }
    );
    expect(response).toEqual("resource");
  });

  test("it returns an error response if the save fails", async () => {
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResource(
      { dataset: "dataset", iri: "iri" },
      jest.fn()
    );

    expect(error).toEqual("boom");
  });
});
