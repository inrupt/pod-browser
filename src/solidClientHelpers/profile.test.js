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

import { getSolidDataset } from "@inrupt/solid-client";
import {
  displayProfileName,
  fetchProfile,
  getProfileFromPersonDataset,
} from "./profile";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockProfileAlice,
  mockProfileBob,
} from "../../__testUtils/mockPersonResource";
import mockSession, { webIdUrl } from "../../__testUtils/mockSession";

describe("displayProfileName", () => {
  test("with name, displays the name", () => {
    const name = "name";
    const nickname = "nickname";
    const webId = "webId";
    expect(displayProfileName({ name, nickname, webId })).toEqual(name);
  });

  test("without name, and a nickname, displays the nickname", () => {
    const nickname = "nickname";
    const webId = "webId";
    expect(displayProfileName({ nickname, webId })).toEqual(nickname);
  });

  test("with only webId, displays the webId", () => {
    const webId = "webId";
    expect(displayProfileName({ webId })).toEqual(webId);
  });
});

describe("fetchProfile", () => {
  it("fetches a profile and its information", async () => {
    const profileWebId = webIdUrl;
    const { fetch } = mockSession();

    const profile = await fetchProfile(profileWebId, fetch);
    const dataset = await getSolidDataset(profileWebId, { fetch });
    expect(profile.webId).toEqual(profileWebId);
    expect(profile.name).toEqual("Test Testersen");
    expect(profile.nickname).toEqual("Testy");
    expect(profile.avatar).toEqual("http://example.com/photo.jpg");
    expect(profile.pods).toEqual(["http://example.com/"]);
    expect(profile.dataset).toEqual(dataset);
  });
});

describe("getProfileFromPersonDataset", () => {
  test("it maps people into profiles", async () => {
    expect(getProfileFromPersonDataset(mockPersonDatasetAlice())).toEqual(
      mockProfileAlice()
    );

    expect(getProfileFromPersonDataset(mockPersonDatasetBob())).toEqual(
      mockProfileBob()
    );
  });
});
