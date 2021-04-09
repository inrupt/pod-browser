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

import { useSession } from "@inrupt/solid-ui-react";
import useSWR from "swr";
import { renderHook } from "@testing-library/react-hooks";
import useAgentProfile, { GET_PROFILE } from "./index";
import { fetchProfile } from "../../solidClientHelpers/profile";
import { PUBLIC_AGENT_PREDICATE } from "../../models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../models/contact/authenticated";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

jest.mock("../../solidClientHelpers/profile");
const mockedFetchProfile = fetchProfile;

jest.mock("swr");
const mockedSwrHook = useSWR;

describe("useAgentProfile", () => {
  const fetch = jest.fn();
  const swrResponse = 42;
  const webId = "https://example.org/profile/card#me";
  const profileResponse = "profile";

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ session: { fetch } });
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("uses SWR to cache", () => {
    const { result } = renderHook(() => useAgentProfile(webId));
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      [webId, GET_PROFILE],
      expect.any(Function),
      undefined
    );
  });

  it("returns profile", async () => {
    mockedFetchProfile.mockReturnValue(profileResponse);
    renderHook(() => useAgentProfile(webId));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(
      profileResponse
    );
  });

  it("returns correct profile for public agent", async () => {
    renderHook(() => useAgentProfile(PUBLIC_AGENT_PREDICATE));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual({
      name: "Anyone",
    });
  });

  it("returns correct profile for authenticated agent", async () => {
    renderHook(() => useAgentProfile(AUTHENTICATED_AGENT_PREDICATE));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual({
      name: "Anyone signed in",
    });
  });

  it("returns null if there is no webId", async () => {
    renderHook(() => useAgentProfile(null));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });

  it("returns error if fails to fetch profile", async () => {
    mockedFetchProfile.mockReturnValue({ error: "500" });
    renderHook(() => useAgentProfile(webId));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual({
      error: "500",
    });
  });
});
