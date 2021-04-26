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
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import AgentAccessTable, { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "./index";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";
import usePermissionsWithProfiles from "../../../../src/hooks/usePermissionsWithProfiles";
import { TESTCAFE_ID_SEARCH_INPUT } from "../agentsSearchBar";
import {
  TESTCAFE_ID_TAB_PEOPLE,
  TESTCAFE_ID_TAB_GROUPS,
} from "../agentsTableTabs";
import {
  PUBLIC_AGENT_PREDICATE,
  PUBLIC_AGENT_TYPE,
} from "../../../../src/models/contact/public";
import {
  AUTHENTICATED_AGENT_PREDICATE,
  AUTHENTICATED_AGENT_TYPE,
} from "../../../../src/models/contact/authenticated";

jest.mock("../../../../src/hooks/usePolicyPermissions");
const mockedUsePolicyPermissions = usePolicyPermissions;

jest.mock("../../../../src/hooks/usePermissionsWithProfiles");
const mockedUsePermissionsWithProfiles = usePermissionsWithProfiles;

const profile1 = {
  avatar: null,
  webId: "https://example1.com/profile/card#me",
  name: "Example A",
  types: ["https://schema.org/Person"],
};

const profile2 = {
  avatar: null,
  webId: "https://example2.com/profile/card#me",
  name: "Example B",
  types: ["https://schema.org/Person"],
};

const profile3 = {
  avatar: null,
  webId: "https://example3.com/profile/card#me",
  name: "Example C",
  types: ["https://schema.org/Person"],
};

const profile4 = {
  avatar: null,
  webId: "https://example4.com/profile/card#me",
  name: "Example D",
  types: ["https://schema.org/Person"],
};

const profiles = [profile1, profile2, profile3, profile4];

const publicPermission = {
  acl: createAccessMap(true, true, false, false),
  webId: PUBLIC_AGENT_PREDICATE,
  type: PUBLIC_AGENT_TYPE,
};

const authenticatedPermission = {
  acl: createAccessMap(true, true, false, false),
  webId: AUTHENTICATED_AGENT_PREDICATE,
  type: AUTHENTICATED_AGENT_TYPE,
};

const permissions = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example2.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example3.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example4.com/profile/card#me",
    type: "agent",
  },
];

const permissionsWithProfiles = permissions.map((p, i) => {
  return {
    ...p,
    profile: profiles[i],
  };
});

const permissionsWithProfilesMixedTypes = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    type: "agent",
    profile: profile1,
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example4.com/profile/card#me",
    type: "agent",
    profile: {
      avatar: null,
      name: "Not a person",
      types: ["Something else"],
    },
  },
];
describe("AgentAccessTable with agents", () => {
  beforeEach(() => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });
  });
  it("renders a list of permissions", async () => {
    const type = "editors";
    const { asFragment, queryAllByRole } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    expect(queryAllByRole("cell")).toHaveLength(3);
    expect(asFragment()).toMatchSnapshot();
  });
  it("shows all permissions when clicking 'show all' button", async () => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });

    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    expect(queryAllByRole("cell")).toHaveLength(4);
  });
  it("agents appear in alphabetical order with public and authenticated first", async () => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [
        publicPermission,
        authenticatedPermission,
        ...permissionsWithProfiles,
      ],
    });

    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    const cells = queryAllByRole("cell");
    expect(cells).toHaveLength(6);
    expect(cells[0]).toHaveTextContent("Anyone");
    expect(cells[1]).toHaveTextContent("Anyone signed in");
    expect(cells[2]).toHaveTextContent("Example A");
    expect(cells[3]).toHaveTextContent("Example B");
    expect(cells[4]).toHaveTextContent("Example C");
    expect(cells[5]).toHaveTextContent("Example D");
  });
  it("shows first 3 permissions by default and when clicking the 'hide' button", async () => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });
    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    const showAllButton = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(showAllButton);
    expect(queryAllByRole("cell")).toHaveLength(4);
    const hideButton = getByTestId("hide-button");
    userEvent.click(hideButton);
    expect(queryAllByRole("cell")).toHaveLength(3);
  });
  it("renders a search box which filters by name or webId", () => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });

    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    waitFor(() => {
      expect(queryByText("Example 2")).not.toBeNull();
      const searchInput = getByTestId(TESTCAFE_ID_SEARCH_INPUT);
      userEvent.type(searchInput, "2");
      expect(queryByText("Example 4")).toBeNull();
      expect(queryByText("Example 2")).not.toBeNull();
    });
  });

  it.skip("renders a set of tabs which filter by Group type", () => {
    const permissionsWithTypes = [
      {
        type: "agent",
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
      },
      {
        type: "group",
        acl: createAccessMap(true, true, false, false),
        webId: "https://example-group.com/profile/card#me",
      },
    ];

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissionsWithTypes,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithProfilesMixedTypes,
    });
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    waitFor(() => {
      const tabPeople = getByTestId(TESTCAFE_ID_TAB_PEOPLE);
      const tabGroups = getByTestId(TESTCAFE_ID_TAB_GROUPS);
      userEvent.click(tabPeople);
      expect(queryByText("Example 1")).not.toBeNull();
      expect(queryByText("Not a person")).toBeNull();
      userEvent.click(tabGroups);
      expect(queryByText("No groups found")).not.toBeNull();
      expect(queryByText("Example 1")).toBeNull();
    });
  });
  it.skip("renders a set of tabs which filter by People type", () => {
    const permissionsWithTypes = [
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
        type: "agent",
      },
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example-group.com/profile/card#me",
        type: "group",
      },
    ];

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissionsWithTypes,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithProfilesMixedTypes,
    });

    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    waitFor(() => {
      const tabPeople = getByTestId(TESTCAFE_ID_TAB_PEOPLE);
      const tabGroups = getByTestId(TESTCAFE_ID_TAB_GROUPS);
      userEvent.click(tabPeople);
      expect(queryByText("No people found")).not.toBeNull();
      expect(queryByText("Not a person")).toBeNull();
      userEvent.click(tabGroups);
      expect(queryByText("Example 1")).not.toBeNull();
      expect(queryByText("Example 2")).not.toBeNull();
    });
  });
});
describe("AgentAccessTable without agents", () => {
  it("renders an empty list of permissions if there are no permissions and the policy is not custom", () => {
    const type = "editors";
    mockedUsePolicyPermissions.mockReturnValue({
      data: [],
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [],
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("renders an empty list of permissions if permissions are unavailable", () => {
    const type = "editors";
    mockedUsePolicyPermissions.mockReturnValue({
      error: "error",
      data: undefined,
      mutate: jest.fn(),
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("does not render table at all if there aren't any permissions for a custom policy", () => {
    const type = "viewAndAdd";
    mockedUsePolicyPermissions.mockReturnValue({
      data: [],
      mutate: jest.fn(),
    });
    const { asFragment, queryByTestId } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(queryByTestId(TESTCAFE_ID_AGENT_ACCESS_TABLE)).toBeNull();
  });
});
