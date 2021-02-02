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

import * as solidClientFns from "@inrupt/solid-client";
import {
  addMockResourceAclTo,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import AcpAccessControlStrategy from "./acp";
import WacAccessControlStrategy from "./wac";
import {
  getAccessControl,
  hasAccess,
  isAcp,
  isWac,
  noAccessPolicyError,
} from "./index";

const acp = solidClientFns.acp_v1;

jest.mock("./acp");
jest.mock("./wac");

const resource = mockSolidDatasetFrom("http://example.com");

describe("isAcp", () => {
  beforeEach(() => jest.spyOn(acp, "hasLinkedAcr").mockReturnValue(true));

  it("uses acp.hasLinkedAcr to determine whether a resource from a server uses ACP", () => {
    expect(isAcp(resource)).toBeTruthy();
    expect(acp.hasLinkedAcr).toHaveBeenCalledWith(resource);
  });

  it("returns false for non-instantiated ResourceInfo", () =>
    expect(isAcp(null)).toBeFalsy());
});

describe("isWac", () => {
  beforeEach(() =>
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(true)
  );

  it("uses hasAccessibleAcl to determine whether a resource from a server uses WAC", () => {
    expect(isWac(resource)).toBeTruthy();
    expect(solidClientFns.hasAccessibleAcl).toHaveBeenCalledWith(resource);
  });

  it("returns false for non-instantiated ResourceInfo", () =>
    expect(isWac(null)).toBeFalsy());
});

describe("getAccessControl", () => {
  let result;
  const policiesContainerUrl = "policiesContainer";
  const fetch = "fetch";
  const acpStrategy = "acpStrategy";
  const wacStrategy = "wacStrategy";

  beforeEach(() => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(false);
    jest.spyOn(acp, "hasLinkedAcr").mockReturnValue(false);
    jest.spyOn(WacAccessControlStrategy, "init").mockReturnValue(wacStrategy);
    jest.spyOn(AcpAccessControlStrategy, "init").mockReturnValue(acpStrategy);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws error if no access link is found", async () => {
    await expect(
      getAccessControl(resource, policiesContainerUrl, fetch)
    ).rejects.toEqual(new Error(noAccessPolicyError));
  });

  describe("ACP is supported", () => {
    beforeEach(async () => {
      acp.hasLinkedAcr.mockReturnValue(true);
      result = await getAccessControl(resource, policiesContainerUrl, fetch);
    });

    it("calls AcpAccessControlStrategy.init", () =>
      expect(AcpAccessControlStrategy.init).toHaveBeenCalledWith(
        resource,
        policiesContainerUrl,
        fetch
      ));

    it("returns the result from WacAccessControlStrategy.init", () =>
      expect(result).toBe(acpStrategy));
  });

  describe("WAC is supported", () => {
    beforeEach(async () => {
      solidClientFns.hasAccessibleAcl.mockReturnValue(true);
      result = await getAccessControl(resource, policiesContainerUrl, fetch);
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

describe("hasAccess", () => {
  it("checks whether resource is accessible either through ACP or WAC", () => {
    const resourceWithWac = addMockResourceAclTo(resource);
    const resourceWithAcp = acp.addMockAcrTo(resource);
    jest
      .spyOn(acp, "hasLinkedAcr")
      .mockImplementation((r) => r === resourceWithAcp);

    expect(hasAccess(resource)).toBeFalsy();
    expect(hasAccess(resourceWithWac)).toBeTruthy();
    expect(hasAccess(resourceWithAcp)).toBeTruthy();
  });
});
