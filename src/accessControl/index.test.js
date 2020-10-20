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

import * as solidClientHelperFns from "@inrupt/solid-client";
import AcpAccessControlStrategy from "./acp";
import WacAccessControlStrategy from "./wac";
import { getAccessControl, noAccessPolicyError } from "./index";
import * as mockedAcpFns from "./acp/mockedClientApi";

jest.mock("./acp");
jest.mock("./wac");

describe("getAccessControl", () => {
  let result;
  const resource = "resource";
  const policies = "policies";
  const fetch = "fetch";
  const acpStrategy = "acpStrategy";
  const wacStrategy = "wacStrategy";

  beforeEach(() => {
    jest.spyOn(solidClientHelperFns, "hasAccessibleAcl").mockReturnValue(false);
    jest.spyOn(mockedAcpFns, "hasLinkedAcr").mockReturnValue(false);
    jest.spyOn(WacAccessControlStrategy, "init").mockReturnValue(wacStrategy);
    jest.spyOn(AcpAccessControlStrategy, "init").mockReturnValue(acpStrategy);
  });

  it("throws error if no access link is found", async () => {
    await expect(getAccessControl(resource, policies, fetch)).rejects.toEqual(
      new Error(noAccessPolicyError)
    );
  });

  describe("ACP is supported", () => {
    beforeEach(async () => {
      mockedAcpFns.hasLinkedAcr.mockReturnValue(true);
      result = await getAccessControl(resource, policies, fetch);
    });

    it("calls AcpAccessControlStrategy.init", () =>
      expect(AcpAccessControlStrategy.init).toHaveBeenCalledWith(
        resource,
        policies,
        fetch
      ));

    it("returns the result from WacAccessControlStrategy.init", () =>
      expect(result).toBe(acpStrategy));
  });

  describe("WAC is supported", () => {
    beforeEach(async () => {
      solidClientHelperFns.hasAccessibleAcl.mockReturnValue(true);
      result = await getAccessControl(resource, policies, fetch);
    });

    it("calls WacAccessControlStrategy.init", () =>
      expect(WacAccessControlStrategy.init).toHaveBeenCalledWith(
        resource,
        fetch
      ));

    it("returns the result from WacAccessControlStrategy.init", () =>
      expect(result).toBe(wacStrategy));
  });
});
