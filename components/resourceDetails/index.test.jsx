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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import ResourceDetails, * as resourceDetailFns from "./index";

const { displayType } = resourceDetailFns;

jest.mock("../../src/hooks/solidClient");

describe("Resource details", () => {
  test("it renders container details", () => {
    const dataset = mockSolidDatasetFrom("http://example.com/container/");

    const tree = mountToJson(
      <DatasetProvider dataset={dataset}>
        <ResourceDetails />
      </DatasetProvider>
    );
    expect(tree).toMatchSnapshot();
  });
  test("it renders a decoded container name", () => {
    const dataset = mockSolidDatasetFrom(
      "http://example.com/Some%20container/"
    );

    const tree = mountToJson(
      <DatasetProvider dataset={dataset}>
        <ResourceDetails />
      </DatasetProvider>
    );
    expect(tree).toMatchSnapshot();
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
