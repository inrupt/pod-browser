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

import { mount } from "enzyme";
import { ReactElement, useContext } from "react";
import PodLocationContext, { PodLocationProvider } from "./index";
import usePodRoot from "../../hooks/usePodRoot";

jest.mock("../../hooks/useAuthenticatedProfile");
jest.mock("../../hooks/usePodRoot");

function ChildComponent(): ReactElement {
  const { baseUriAsString, currentUriAsString } = useContext(
    PodLocationContext
  );
  return (
    <>
      <div id="BaseUriAsString">{baseUriAsString}</div>
      <div id="CurrentUriAsString">{currentUriAsString}</div>
    </>
  );
}

describe("PodLocationContext", () => {
  test("it provides baseUri based on storages given in profile", () => {
    const baseUriAsString = "https://foo.test/";

    (usePodRoot as jest.Mock).mockReturnValue(baseUriAsString);

    const component = mount(
      <PodLocationProvider currentUriAsString="https://foo.test/bar/baz">
        <ChildComponent />
      </PodLocationProvider>
    );

    expect(component.find("#BaseUriAsString").text()).toEqual(
      "https://foo.test/"
    );
    expect(component.find("#CurrentUriAsString").text()).toEqual(
      "https://foo.test/bar/baz"
    );
  });
});
