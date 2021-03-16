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
import AgentProfileDetails from "./index";

import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import { PUBLIC_AGENT_PREDICATE } from "../../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../../src/models/contact/authenticated";

const webId = "https://example.com/profile/card#me";

describe("AgentProfileDetails", () => {
  const profile = {
    avatar: null,
    name: "Example Agent",
    webId,
  };
  const permission = { webId, alias: "editors", type: "agent" };
  const resourceIri = "/iri/";

  const publicProfile = {
    webId: PUBLIC_AGENT_PREDICATE,
  };
  const publicPermission = {
    webId: PUBLIC_AGENT_PREDICATE,
    alias: "editors",
    type: "public",
  };

  const authenticatedProfile = {
    webId: AUTHENTICATED_AGENT_PREDICATE,
  };
  const authenticatedPermission = {
    webId: AUTHENTICATED_AGENT_PREDICATE,
    alias: "editors",
    type: "authenticated",
  };

  it("renders without error", () => {
    const { asFragment } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={permission}
        profile={profile}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
        mutatePermissions={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders correctly for public agent", () => {
    const { asFragment, queryByText } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={publicPermission}
        profile={publicProfile}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
        mutatePermissions={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("Anyone")).not.toBeNull();
  });

  it("renders correctly for authenticated agent", () => {
    const { asFragment, queryByText } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={authenticatedPermission}
        profile={authenticatedProfile}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
        mutatePermissions={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("Anyone signed in")).not.toBeNull();
  });
});
