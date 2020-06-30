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

import { act, renderHook } from "@testing-library/react-hooks";
import useAuthenticatedProfile from "./index";
import { fetchProfile } from "../../lit-solid-helpers";

jest.mock("../../lit-solid-helpers");

const webId = "https://webid.com/#me";
const profile = { webId };

describe("useAuthenticatedProfile", () => {
  test("no profile loaded when no session is given", () => {
    (fetchProfile as jest.Mock).mockResolvedValue(profile);

    const { result } = renderHook(() => useAuthenticatedProfile(undefined));
    expect(result.current).toBeNull();
  });

  test("profile is loaded when session is given", async () => {
    (fetchProfile as jest.Mock).mockResolvedValue(profile);

    const session = { webId };
    const { result, waitForNextUpdate } = renderHook(() =>
      useAuthenticatedProfile(session)
    );

    await waitForNextUpdate();

    expect(result.current).toBe(profile);
  });

  test.skip("throws error if fetch fails", async () => {
    // TODO: Unable to get this working
    // This might be of help - https://github.com/testing-library/react-hooks-testing-library/issues/20
    const error = "Some error";
    (fetchProfile as jest.Mock).mockRejectedValue(error);

    const session = { webId };
    const { result, waitForNextUpdate } = renderHook(() =>
      useAuthenticatedProfile(session)
    );

    await waitForNextUpdate();

    expect(result.error).toEqual(Error(error));
  });
});
