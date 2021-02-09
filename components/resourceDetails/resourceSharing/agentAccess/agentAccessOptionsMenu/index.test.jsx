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
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import AgentAccessOptionsMenu from "./index";

const resourceIri = "/iri/";
const webId = "https://example.com/profile/card#me";
const profile = {
  avatar: null,
  name: "Example Agent",
  webId,
};
const permission = { webId, profile, alias: "editors" };

describe("AgentAccessOptionsMenu", () => {
  test("it renders a button which triggers the opening of the menu", () => {
    const { asFragment, getByTestId, queryByText } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn}
        setLocalAccess={jest.fn}
        mutatePermissions={jest.fn}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("WebId:")).toBeNull();
    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    expect(queryByText("WebId:")).toBeDefined();
    const removeButton = getByTestId("remove-button");
    expect(removeButton).toBeDefined();
  });
});
