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

import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import Router from "next/router";
import auth from "solid-auth-client";

import LogOutButton from "./index";

jest.mock("next/router");
jest.mock("solid-auth-client");

describe("Logout button", () => {
  test("Renders a logout button", () => {
    const tree = shallow(<LogOutButton />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Calls logout and redirects on click", async () => {
    (auth.logout as jest.Mock).mockResolvedValue(null);
    (Router.push as jest.Mock).mockResolvedValue(null);

    const tree = shallow(<LogOutButton />);
    tree.simulate("click", { preventDefault: () => {} });

    // Simulate an await before continuing.
    await auth.logout();

    expect(Router.push).toHaveBeenCalledWith("/login");
    expect(auth.logout).toHaveBeenCalled();
  });
});
