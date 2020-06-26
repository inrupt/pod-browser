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

import * as ReactFns from "react";
import { mock } from "jest-mock-extended";
import { mount, shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "../../src/theme";

import { NormalizedPermission } from "../../src/lit-solid-helpers";

import ResourceDetails, {
  displayName,
  Permission,
  ThirdPartyPermissions,
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

    const tree = mount(
      <ThemeProvider theme={theme}>
        <ResourceDetails
          name="Resource Name"
          types={["Resource"]}
          iri="iri"
          classes={classes}
          permissions={permissions}
        />
      </ThemeProvider>
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

    const tree = mount(
      <ThemeProvider theme={theme}>
        <ResourceDetails
          name="Resource Name"
          types={["Resource"]}
          iri="iri"
          classes={classes}
          permissions={permissions}
        />
      </ThemeProvider>
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

describe("Permission", () => {
  test("it returns null if given no permissions", () => {
    const classes = {};

    const tree = shallow(<Permission classes={classes} permission={null} />);

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("it renders permissions if given", () => {
    const classes = {};
    const permission = mock<NormalizedPermission>({
      webId: "https://somepod.somehost.com/profile#me",
      alias: "some-alias",
      profile: {
        avatar: "https://somepod.somehost.com/public/photo.jpg",
      },
    });

    const tree = shallow(
      <Permission classes={classes} permission={permission} />
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("ThirdPartyPermissions", () => {
  test("it returns null if given no permissions", () => {
    const tree = shallow(
      <ThirdPartyPermissions classes={{}} thirdPartyPermissions={null} />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("it returns a useful message if there are no third party permissions", () => {
    const tree = shallow(
      <ThirdPartyPermissions classes={{}} thirdPartyPermissions={[]} />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("it renders permissions if given", () => {
    const classes = {};
    const permissions = [
      {
        webId: "https://somepod.somehost.com/profile#me",
        alias: "some-alias",
        acl: {},
        profile: {
          avatar: "https://somepod.somehost.com/public/photo.jpg",
        },
      },
      {
        webId: "https://someotherpod.somehost.com/profile#me",
        alias: "some-other-alias",
        acl: {},
        profile: {},
      },
    ];

    const tree = shallow(
      <ThirdPartyPermissions
        classes={classes}
        thirdPartyPermissions={permissions}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("displayType", () => {
  test("it returns 'Resource' if no types", () => {
    expect(displayType([])).toEqual("Resource");
  });

  test("it returns the first type if types", () => {
    const types = ["A Type"];
    expect(displayType(types)).toEqual(types[0]);
  });
});
