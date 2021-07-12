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
import useClientId from "./index";

const getControlledPromie = () => {
  let deferred;
  const promise = new Promise((resolve, reject) => {
    deferred = { resolve, reject };
  });
  return { deferred, promise };
};

describe("useClientId tests", () => {
  it("fetches the correct url", async () => {
    global.fetch = jest.fn();

    await act(async () =>
      renderHook(() => useClientId("https://broker.pod.inrupt.com"))
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://broker.pod.inrupt.com/.well-known/openid-configuration"
    );
  });

  it("handles fetching data correctly", async () => {
    const { deferred, promise } = getControlledPromie();
    global.fetch = jest.fn(() => promise);

    const { result, waitForNextUpdate } = renderHook(useClientId);

    deferred.resolve({
      json: () => ({
        solid_oidc_supported: "https://solidproject.org/TR/solid-oidc",
      }),
    });

    await waitForNextUpdate();
    expect(result.current.response).toBe(true);
  });

  it.todo("handles loading state correctly");
  it.todo("handles error state correctly");
});
