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

/* eslint-disable camelcase */
import React from "react";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import PermissionCheckbox, { TESTCASE_ID_PERMISSION_CHECKBOX } from "./index";

describe("PermissionCheckbox", () => {
  const onChange = jest.fn();
  const label = "Read";
  const value = true;
  const checkboxTestId = TESTCASE_ID_PERMISSION_CHECKBOX + label.toLowerCase();

  it("renders a permission checkbox", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <PermissionCheckbox value={value} label={label} onChange={onChange} />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(checkboxTestId).disabled).toBe(false);
  });

  it("can be disabled", () => {
    const { getByTestId } = renderWithTheme(
      <PermissionCheckbox
        value={value}
        label={label}
        onChange={onChange}
        disabled
      />
    );

    expect(getByTestId(checkboxTestId).disabled).toBe(true);
  });
});
