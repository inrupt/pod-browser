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
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { useRouter } from "next/router";

import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import IndexPage from "./index";
import useRedirectIfNoControlAccessToOwnPod from "../../../src/hooks/useRedirectIfNoControlAccessToOwnPod";

jest.mock("../../../src/effects/auth");
jest.mock("../../../src/hooks/useRedirectIfNoControlAccessToOwnPod");
jest.mock("next/router");
jest.mock("../../../src/hooks/useRedirectIfNoControlAccessToOwnPod");

describe("Index page", () => {
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      query: {
        iri: encodeURIComponent("https://mypod.myhost.com"),
      },
    }));
  });

  test("Renders a logout button", () => {
    const tree = shallow(<IndexPage />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Redirects if the user is logged out", () => {
    shallow(<IndexPage />);
    expect(useRedirectIfLoggedOut).toHaveBeenCalled();
  });

  test("Redirects if the user does not have access to Pod", () => {
    shallow(<IndexPage />);
    expect(useRedirectIfNoControlAccessToOwnPod).toHaveBeenCalled();
  });
});
