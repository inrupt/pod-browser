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

import { renderHook } from "@testing-library/react-hooks";
import { useSession } from "@inrupt/solid-ui-react";
import useUserMenu, {
  TESTCAFE_ID_USER_MENU_LOGOUT,
  TESTCAFE_ID_USER_MENU_PROFILE,
} from "./index";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

describe("useUserMenu", () => {
  let logout;

  beforeEach(() => {
    logout = jest.fn();
    mockedSessionHook.mockReturnValue({ logout });
  });

  it("returns menu with profile and logout", () => {
    const { result } = renderHook(() => useUserMenu());
    expect(result.current).toHaveLength(2);
    const testIds = result.current.map(({ "data-testid": testid }) => testid);
    expect(testIds).toContain(TESTCAFE_ID_USER_MENU_PROFILE);
    expect(testIds).toContain(TESTCAFE_ID_USER_MENU_LOGOUT);
  });

  test("log out button triggers logout", () => {
    const { result } = renderHook(() => useUserMenu());
    result.current
      .find(
        ({ "data-testid": testid }) => testid === TESTCAFE_ID_USER_MENU_LOGOUT
      )
      .onClick();
    expect(logout).toHaveBeenCalled();
  });
});
