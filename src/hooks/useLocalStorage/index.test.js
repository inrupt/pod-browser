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

import { renderHook, act } from "@testing-library/react-hooks";
import useLocalStorage from "./index";
import * as windowFns from "../../windowHelpers/index";
import { getFakeLocalStorage } from "../../windowHelpers/index";
import mockConsole from "../../../__testUtils/mockConsole";

describe("useLocalStorage", () => {
  const KEY = "key";
  const VALUE = {
    INITIAL: "initial value",
    CHANGED: "changed value",
    NONE: "",
  };
  const fakeLocalStorage = getFakeLocalStorage();
  const fakeConsole = mockConsole();

  beforeEach(() => {
    jest.spyOn(windowFns, "getLocalStorage").mockReturnValue(fakeLocalStorage);
    jest.spyOn(windowFns, "getConsole").mockReturnValue(fakeConsole);
  });

  describe("Setup", () => {
    it("Returns initial value", () => {
      const { result } = renderHook(() => useLocalStorage(KEY, VALUE.INITIAL));
      expect(result.current[0]).toMatch(VALUE.INITIAL);
    });

    it("When no initial value is passed, returns an empty string", () => {
      const { result } = renderHook(() => useLocalStorage(KEY));
      expect(result.current[0]).toMatch(VALUE.NONE);
    });

    it("Returns setValue function", () => {
      const { result } = renderHook(() => useLocalStorage(KEY, VALUE.INITIAL));
      expect(typeof result.current[1]).toMatch("function");
    });
  });

  it("When `setValue()` is called, the `value` updates", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, VALUE.INITIAL));

    act(() => {
      result.current[1](VALUE.CHANGED);
    });

    expect(result.current[0]).toMatch(VALUE.CHANGED);
  });

  it("When `value` changes, `localStorage` is updated", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, VALUE.INITIAL));

    act(() => {
      result.current[1](VALUE.CHANGED);
    });

    expect(fakeLocalStorage.getItem(KEY)).toBe(VALUE.CHANGED);
  });
});
