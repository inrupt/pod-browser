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
import { useSession, useThing } from "@inrupt/solid-ui-react";
import { addUrl, createThing } from "@inrupt/solid-client";
import AddAgentRow from "./index";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import useContactProfileOld from "../../../../src/hooks/useContactProfileOld";
import { vcardExtras } from "../../../../src/addressBook";

jest.mock("@inrupt/solid-ui-react");
const mockedThingHook = useThing;

jest.mock("../../../../src/hooks/useContactProfileOld");
const mockedUseContactProfileOld = useContactProfileOld;

describe("AddAgentRow", () => {
  describe("when adding a new webId", () => {
    const mockThing = createThing();
    beforeEach(() => {
      mockedThingHook.mockReturnValue({ thing: mockThing });
      useSession.mockReturnValue({ fetch: jest.fn() });
      mockedUseContactProfileOld.mockReturnValue({ data: null });
    });
    const index = 0;
    const setNewAgentsWebIds = jest.fn();
    const newAgentsWebIds = [];
    const setAddingWebId = jest.fn();
    const setNoAgentsAlert = jest.fn();
    const addingWebId = true;
    const updateTemporaryRowThing = jest.fn();
    const permissions = [{ webId: "https://example.org/profile/card#me" }];

    it("renders a row with an input for the first item in the array", () => {
      const { asFragment } = renderWithTheme(
        <AddAgentRow
          index={index}
          setNewAgentsWebIds={setNewAgentsWebIds}
          newAgentsWebIds={newAgentsWebIds}
          setAddingWebId={setAddingWebId}
          setNoAgentsAlert={setNoAgentsAlert}
          addingWebId={addingWebId}
          updateTemporaryRowThing={updateTemporaryRowThing}
          permissions={[]}
        />
      );
      expect(asFragment()).toMatchSnapshot();
    });
    it("renders a validation error if added webId is already in permissions", () => {
      const { getByTestId, getByText } = renderWithTheme(
        <AddAgentRow
          index={index}
          setNewAgentsWebIds={setNewAgentsWebIds}
          newAgentsWebIds={newAgentsWebIds}
          setAddingWebId={setAddingWebId}
          setNoAgentsAlert={setNoAgentsAlert}
          addingWebId={addingWebId}
          updateTemporaryRowThing={updateTemporaryRowThing}
          permissions={permissions}
        />
      );
      const input = getByTestId("webid-input");
      const addButton = getByTestId("add-button");
      userEvent.type(input, "https://example.org/profile/card#me");
      userEvent.click(addButton);
      const errorText = getByText("That WebID has already been added");
      expect(errorText).not.toBeNull();
    });
    it("clears error when changing input again", () => {
      const { getByTestId, queryByText } = renderWithTheme(
        <AddAgentRow
          index={index}
          setNewAgentsWebIds={setNewAgentsWebIds}
          newAgentsWebIds={newAgentsWebIds}
          setAddingWebId={setAddingWebId}
          setNoAgentsAlert={setNoAgentsAlert}
          addingWebId={addingWebId}
          updateTemporaryRowThing={updateTemporaryRowThing}
          permissions={permissions}
        />
      );
      const input = getByTestId("webid-input");
      userEvent.type(input, "");
      const errorText = queryByText("That WebID has already been added");
      expect(errorText).toBeNull();
    });
    it("adds webId to webIds array on submit", () => {
      const { getByTestId } = renderWithTheme(
        <AddAgentRow
          index={index}
          setNewAgentsWebIds={setNewAgentsWebIds}
          newAgentsWebIds={newAgentsWebIds}
          setAddingWebId={setAddingWebId}
          setNoAgentsAlert={setNoAgentsAlert}
          addingWebId={addingWebId}
          updateTemporaryRowThing={updateTemporaryRowThing}
          permissions={permissions}
        />
      );
      const input = getByTestId("webid-input");
      userEvent.type(input, "https://somewebid.com/");
      const addButton = getByTestId("add-button");
      userEvent.click(addButton);
      expect(setNewAgentsWebIds).toHaveBeenCalledWith([
        "https://somewebid.com/",
        ...newAgentsWebIds,
      ]);
    });
  });
  describe("with existing contacts", () => {
    const index = 0;
    const setNewAgentsWebIds = jest.fn();
    const newAgentsWebIds = [];
    const setAddingWebId = jest.fn();
    const setNoAgentsAlert = jest.fn();
    const addingWebId = false;
    const updateTemporaryRowThing = jest.fn();

    beforeEach(() => {
      useSession.mockReturnValue({ fetch: jest.fn() });
    });

    it("renders a row with the agent's name if profile is available", () => {
      const mockThing = createThing();
      mockedThingHook.mockReturnValue({ thing: mockThing });
      mockedUseContactProfileOld.mockReturnValue({
        data: { webId: "https://somewebid.org", name: "Example", avatar: null },
      });
      const { asFragment, getByTestId, queryByText } = renderWithTheme(
        <AddAgentRow
          index={index}
          setNewAgentsWebIds={setNewAgentsWebIds}
          newAgentsWebIds={newAgentsWebIds}
          setAddingWebId={setAddingWebId}
          setNoAgentsAlert={setNoAgentsAlert}
          addingWebId={addingWebId}
          updateTemporaryRowThing={updateTemporaryRowThing}
          permissions={[]}
        />
      );
      expect(asFragment()).toMatchSnapshot();
      expect(queryByText("Example")).toBeDefined();
      expect(getByTestId("agent-webid")).toBeDefined();
    });
    it("for newly added webids, if profile is unavailable it renders a row with the provided webId", () => {
      const mockThing = addUrl(
        createThing(),
        vcardExtras("WebId"),
        "https://somewebid.com"
      );
      mockedThingHook.mockReturnValue({ thing: mockThing });
      mockedUseContactProfileOld.mockReturnValue({
        data: null,
      });
      const { asFragment, getByTestId, queryByText } = renderWithTheme(
        <AddAgentRow
          index={1}
          setNewAgentsWebIds={setNewAgentsWebIds}
          newAgentsWebIds={newAgentsWebIds}
          setAddingWebId={setAddingWebId}
          setNoAgentsAlert={setNoAgentsAlert}
          addingWebId={addingWebId}
          updateTemporaryRowThing={updateTemporaryRowThing}
          permissions={[]}
        />
      );
      expect(asFragment()).toMatchSnapshot();
      expect(queryByText("https://somewebid.com")).toBeDefined();
      expect(getByTestId("agent-webid")).toBeDefined();
    });
  });
});
