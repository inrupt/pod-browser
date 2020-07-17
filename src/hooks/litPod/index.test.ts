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

import {
  fetchLitDataset,
  getThingOne,
  getIriAll,
  unstable_fetchResourceInfoWithAcl,
  Iri,
} from "@solid/lit-pod";
import { namedNode } from "@rdfjs/data-model";
import useSWR from "swr";
import * as litSolidHelpers from "../../lit-solid-helpers";
import {
  fetchContainerResourceIris,
  fetchResourceDetails,
  fetchPodIrisFromWebId,
  useFetchContainerResourceIris,
  useFetchResourceDetails,
  useFetchResourceWithAcl,
  useFetchPodIrisFromWebId,
} from "./index";

// PMCB55: When we mock out all of a library, we mock out it's utility functions
// too - so for this test suite we use the 'namedNode()' function from RDF/JS to
// create IRIs from test strings.
jest.mock("@solid/lit-pod");
jest.mock("swr");

describe("fetchContainerResourceIris", () => {
  test("it fetches the container resource iris", async () => {
    const resources = [
      namedNode("https://myaccount.mypodserver.com/inbox"),
      namedNode("https://myaccount.mypodserver.com/private"),
      namedNode("https://myaccount.mypodserver.com/note.txt"),
    ];

    (getIriAll as jest.Mock).mockReturnValue(resources);

    const fetchedResources = await fetchContainerResourceIris("containerIri");
    expect(fetchedResources).toEqual(resources);
  });
});

describe("fetchResourceDetails", () => {
  test("it fetches the resource, adding a human-readable name", async () => {
    const iri = namedNode("https://dayton.dev.inrupt.net/public/");

    (unstable_fetchResourceInfoWithAcl as jest.Mock).mockResolvedValue({
      resourceInfo: {
        fetchedFrom: namedNode("https://dayton.dev.inrupt.net/public/"),
        contentType: "application/octet-stream; charset=utf-8",
        unstable_aclUrl: namedNode("https://dayton.dev.inrupt.net/public/.acl"),
        unstable_permissions: {
          user: {
            read: true,
            append: true,
            write: true,
            control: true,
          },
          public: {
            read: true,
            append: false,
            write: false,
            control: false,
          },
        },
      },
      acl: {
        fallbackAcl: {
          quads: {},
          resourceInfo: {
            fetchedFrom: namedNode("https://dayton.dev.inrupt.net/.acl"),
            contentType: "text/turtle",
            unstable_aclUrl: namedNode(
              "https://dayton.dev.inrupt.net/.acl.acl"
            ),
            unstable_permissions: {
              user: {
                read: true,
                append: true,
                write: true,
                control: true,
              },
              public: {
                read: false,
                append: false,
                write: false,
                control: false,
              },
            },
          },
          accessTo: namedNode("https://dayton.dev.inrupt.net/"),
        },
        resourceAcl: {
          quads: {},
          resourceInfo: {
            fetchedFrom: namedNode("https://dayton.dev.inrupt.net/public/.acl"),
            contentType: "text/turtle",
            unstable_aclUrl: namedNode(
              "https://dayton.dev.inrupt.net/public/.acl.acl"
            ),
            unstable_permissions: {
              user: {
                read: true,
                append: true,
                write: true,
                control: true,
              },
              public: {
                read: false,
                append: false,
                write: false,
                control: false,
              },
            },
          },
          accessTo: namedNode("https://dayton.dev.inrupt.net/public/"),
        },
      },
    });

    jest.spyOn(litSolidHelpers, "normalizePermissions").mockResolvedValue([
      {
        webId: namedNode("https://dayton.dev.inrupt.net/card/#me"),
        alias: "Full Control",
        acl: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
        profile: { webId: namedNode("https://dayton.dev.inrupt.net/card/#me") },
      },
    ]);

    const resourceDetails = await fetchResourceDetails(iri);

    expect(resourceDetails.name).toEqual("/public");
    expect(resourceDetails.iri).toEqual(iri);
  });

  test("it fetches a file with ACL if the fetchResource call fails", async () => {
    const iri = namedNode("https://dayton.dev.inrupt.net/file.txt");

    jest.spyOn(litSolidHelpers, "fetchResource").mockImplementationOnce(() => {
      throw new Error("boom");
    });

    jest
      .spyOn(litSolidHelpers, "fetchFileWithAcl")
      .mockResolvedValue({ iri, types: ["type"], file: new Blob(["file"]) });

    const resourceDetails = await fetchResourceDetails(iri);

    expect(resourceDetails.name).toEqual("/file.txt");
    expect(resourceDetails.iri).toEqual(iri);
  });
});

describe("PodIrisFromWebId", () => {
  test("Loads data from a webId", async () => {
    const iri = namedNode("https://mypod.myhost.com/profile/card#me");
    const iris = [namedNode("https://mypod.myhost.com/profile")];

    (fetchLitDataset as jest.Mock).mockResolvedValue({});
    (getThingOne as jest.Mock).mockImplementationOnce(() => {});
    (getIriAll as jest.Mock).mockImplementationOnce(() => iris);

    expect(await fetchPodIrisFromWebId(iri)).toEqual(iris);

    expect(fetchLitDataset).toHaveBeenCalled();
    expect(getThingOne).toHaveBeenCalled();
    expect(getIriAll).toHaveBeenCalled();
  });
});

describe("useFetchContainerResourceIris", () => {
  test("it wraps fetchContainerResourceIris in SWR", () => {
    const iri: Iri = namedNode("iri");
    useFetchContainerResourceIris(iri);

    expect(useSWR).toHaveBeenCalledWith(
      [iri, namedNode("getContainerResourceIris")],
      fetchContainerResourceIris
    );
  });
});

describe("useFetchResourceDetails", () => {
  test("it wraps fetchResourceDetails in SWR", () => {
    const iri: Iri = namedNode("iri");
    useFetchResourceDetails(iri);

    expect(useSWR).toHaveBeenCalledWith(
      [iri, namedNode("fetchResourceDetails")],
      fetchResourceDetails
    );
  });
});

describe("useFetchResourceWithAcl", () => {
  test("it wraps fetchResourceWithAcl in SWR", () => {
    const iri: Iri = namedNode("iri");
    useFetchResourceWithAcl(iri);

    expect(useSWR).toHaveBeenCalledWith(
      [iri, namedNode("fetchResourceWithAcl")],
      litSolidHelpers.fetchResourceWithAcl
    );
  });
});

describe("useFetchPodIrisFromWebId", () => {
  test("it wraps fetchPodIrisFromWebId in SWR", () => {
    const iri: Iri = namedNode("iri");
    useFetchPodIrisFromWebId(iri);

    expect(useSWR).toHaveBeenCalledWith(
      [iri, namedNode("fetchPodIrisFromWebId")],
      fetchPodIrisFromWebId
    );
  });
});
