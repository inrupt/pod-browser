import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import ResourceDetails, {
  displayName,
  displayPermission,
  displayThirdPartyPermissions,
  displayType,
} from "./index";

describe("Resource details", () => {
  test("renders resource details", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
        profile: {
          avatar: "http://example.com/avatar.png",
          nickname: "owner",
          name: "Test Person",
        },
      },
      {
        webId: "collaborator",
        alias: "Can View",
        acl: {
          append: false,
          control: false,
          read: true,
          write: false,
        },
        profile: {
          avatar: null,
          nickname: "collaborator",
          name: "Test Collaborator",
        },
      },
    ];

    const classes = {
      typeValue: "typeValue",
      listItem: "listItem",
      detailText: "detailText",
      centeredSection: "centeredSection",
    };

    const tree = shallow(
      <ResourceDetails
        name="Resource Name"
        types={["Resource"]}
        iri="iri"
        classes={classes}
        permissions={permissions}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("renders no 3rd party access message", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
        profile: {
          avatar: "http://example.com/avatar.png",
          nickname: "owner",
          name: "Test Person",
        },
      },
    ];

    const classes = {
      typeValue: "typeValue",
      listItem: "listItem",
      detailText: "detailText",
      centeredSection: "centeredSection",
    };

    const tree = shallow(
      <ResourceDetails
        name="Resource Name"
        types={["Resource"]}
        iri="iri"
        classes={classes}
        permissions={permissions}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("displayName", () => {
  const name = "Test Example";
  const nickname = "test_example";
  const webId = "webId";

  test("it returns the webId, if no name or nickname is defined", () => {
    expect(displayName({ webId })).toEqual("webId");
  });

  test("it returns the nickname, if no name is defined", () => {
    expect(displayName({ nickname, webId })).toEqual("test_example");
  });

  test("it returns the name, if defined", () => {
    expect(displayName({ name, nickname, webId })).toEqual("Test Example");
  });
});

describe("displayPermission", () => {
  test("it returns null if given no permission", () => {
    let permission;
    const classes = {};
    expect(displayPermission(permission, classes)).toBeNull();
  });
});

describe("displayThirdPartyPermissions", () => {
  test("it returns null if given no permissions", () => {
    let permissions;
    const classes = {};
    expect(displayThirdPartyPermissions(permissions, classes)).toBeNull();
  });
});

describe("displayType", () => {
  test("it returns 'Resource' if no types", () => {
    expect(displayType([])).toEqual("Resource");
  });
});
