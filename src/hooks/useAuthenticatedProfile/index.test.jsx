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

import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import useAuthenticatedProfile from "./index";
import { fetchProfile } from "../../solidClientHelpers/profile";

jest.mock("../../solidClientHelpers/profile");

const webId = "https://webid.com/#me";
const profile = { webId };

describe("useAuthenticatedProfile", () => {
  test("no profile loaded when no session is given", () => {
    const session = {
      fetch: jest.fn(),
      info: {
        isLoggedIn: false,
      },
    };

    jest.spyOn(React, "useContext").mockReturnValueOnce({ session });

    fetchProfile.mockResolvedValue(profile);

    const { result } = renderHook(() => useAuthenticatedProfile());
    expect(result.current).toBeNull();
  });

  test("profile is loaded when session is given", async () => {
    const session = {
      fetch: jest.fn(),
      info: {
        isLoggedIn: true,
      },
    };

    jest.spyOn(React, "useContext").mockReturnValueOnce({ session });

    fetchProfile.mockResolvedValue(profile);

    const { result, waitForNextUpdate } = renderHook(useAuthenticatedProfile);

    await waitForNextUpdate();

    expect(result.current).toBe(profile);
  });
});
