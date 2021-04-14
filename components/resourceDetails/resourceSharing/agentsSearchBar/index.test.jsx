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
import { useSession } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import AgentsSearchBar, { TESTCAFE_ID_SEARCH_INPUT } from "./index";
import mockSession from "../../../../__testUtils/mockSession";
import { GROUPS_PAGE_ENABLED_FOR } from "../../../../src/featureFlags";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

describe("AgentSearchBar", () => {
  const handleFilterChange = jest.fn();

  beforeEach(() => {
    const session = mockSession();
    mockedSessionHook.mockReturnValue({ session });
  });

  it("renders a search bar", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <AgentsSearchBar handleFilterChange={handleFilterChange} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_SEARCH_INPUT)).toBeDefined();
  });
  it("triggers handleFilterChange when typing into the search input", () => {
    const { getByTestId } = renderWithTheme(
      <AgentsSearchBar handleFilterChange={handleFilterChange} />
    );

    const input = getByTestId(TESTCAFE_ID_SEARCH_INPUT);
    userEvent.type(input, "A");

    expect(handleFilterChange).toHaveBeenCalled();
  });
  it("renders slightly different view with Group UI enabled", () => {
    const session = mockSession({ webId: GROUPS_PAGE_ENABLED_FOR[0] });
    mockedSessionHook.mockReturnValue({ session });
    const { asFragment } = renderWithTheme(
      <AgentsSearchBar handleFilterChange={handleFilterChange} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
