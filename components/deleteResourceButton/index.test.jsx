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
import DeleteResourceButton, { createDeleteHandler } from "./index";
import usePoliciesContainerUrl from "../../src/hooks/usePoliciesContainerUrl";
import {
  getResource,
  deleteResource,
} from "../../src/solidClientHelpers/resource";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import { renderWithTheme } from "../../__testUtils/withTheme";

jest.mock("../../src/hooks/useResourceInfo");
jest.mock("../../src/hooks/usePoliciesContainerUrl");
jest.mock("../../src/solidClientHelpers/resource");

describe("Delete resource button", () => {
  const name = "Resource";
  const resourceIri = "iri";

  const policiesContainerUrl = "https://example.org/policies";
  usePoliciesContainerUrl.mockImplementation(() => policiesContainerUrl);
  useResourceInfo.mockReturnValue("resource info");
  describe("it hooks works successfully", () => {
    let renderResult;
    beforeEach(() => {
      renderResult = renderWithTheme(
        <DeleteResourceButton
          onDelete={jest.fn()}
          onDeleteCurrentContainer={jest.fn()}
          resourceIri={resourceIri}
          name={name}
        />
      );
    });

    it("renders a delete resource button", () => {
      expect(renderResult.asFragment()).toMatchSnapshot();
    });
  });

  describe("createDeleteHandler", () => {
    let onDelete;
    let handleDelete;
    const router = {};
    router.push = jest.fn();
    const policyUrl = null;
    const fetch = jest.fn();
    const resourceInfo = mockSolidDatasetFrom(
      "https://example.org/example.txt"
    );

    beforeEach(async () => {
      getResource.mockResolvedValue({
        dataset: resourceInfo,
        iri: "https://example.org/example.txt",
      });
      onDelete = jest.fn();
      handleDelete = createDeleteHandler(
        resourceInfo,
        policyUrl,
        onDelete,
        router,
        fetch
      );
      await handleDelete();
    });

    it("triggers deleteResource", async () => {
      expect(deleteResource).toHaveBeenCalled();
    });

    it("triggers onDelete", () => expect(onDelete).toHaveBeenCalledWith());
  });

  describe("when deleting current folder", () => {
    let onDelete;
    let onDeleteCurrentContainer;
    let handleDelete;
    const router = {};
    router.push = jest.fn();
    const policyUrl = null;
    const fetch = jest.fn();
    const iri = "https://example.org/folder/subfolder/";

    const resourceInfo = mockSolidDatasetFrom(iri);
    beforeEach(async () => {
      getResource.mockResolvedValue({
        dataset: resourceInfo,
        iri: "https://example.org/folder/subfolder/",
      });
      onDelete = jest.fn();
      onDeleteCurrentContainer = jest.fn();
      router.query = { iri: "https://example.org/folder/subfolder/" };
      handleDelete = createDeleteHandler(
        resourceInfo,
        policyUrl,
        onDelete,
        onDeleteCurrentContainer,
        router,
        fetch
      );
      await handleDelete();
    });
    it("triggers onDeleteCurrentContainer", () =>
      expect(onDeleteCurrentContainer).toHaveBeenCalled());
  });
});
