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

import { mount } from "enzyme";
import { mountToJson } from "enzyme-to-json";
import { act } from "react-dom/test-utils";
import { overwriteFile } from "@inrupt/solid-client";

import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import SessionContext from "../../src/contexts/sessionContext";
import AlertContext from "../../src/contexts/alertContext";
import AddFileButton, {
  handleSaveResource,
  handleFileSelect,
  findExistingFile,
  handleUploadedFile,
  handleConfirmation,
} from "./index";

jest.mock("@inrupt/solid-client");

describe("AddFileButton", () => {
  const fileContents = "file contents";

  const file = new Blob([fileContents], {
    type: "text/plain",
    name: "myfile.txt",
  });

  const currentUri = "https://www.mypodbrowser.com/";
  const newFilePath = currentUri + file.name;

  const session = {
    logout: jest.fn(),
  };

  const setAlertOpen = jest.fn();
  const setMessage = jest.fn();
  const setSeverity = jest.fn();
  const onSave = jest.fn();

  const tree = mount(
    <AlertContext.Provider
      value={{
        setAlertOpen,
        setMessage,
        setSeverity,
      }}
    >
      <PodLocationProvider currentUri={currentUri}>
        <SessionContext.Provider value={{ session }}>
          <AddFileButton onSave={onSave} />
        </SessionContext.Provider>
      </PodLocationProvider>
    </AlertContext.Provider>
  );

  test("Renders an add file button", () => {
    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("Uploads a file", async () => {
    await act(async () => {
      tree.find("input").simulate("click");
      tree.find("input").simulate("change", { target: { files: [file] } });
    });

    // await for promises to resolve
    await Promise.resolve();

    expect(overwriteFile).toHaveBeenCalledWith(newFilePath, file, {
      type: file.type,
      fetch: session.fetch,
    });

    expect(onSave).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalled();
  });
});

describe("handleSaveResource", () => {
  test("it returns a handler that saves the resource", async () => {
    const fileContents = "file contents";

    const file = new Blob([fileContents], {
      type: "text/plain",
      name: "myfile.txt",
    });

    const currentUri = "https://www.mypodbrowser.com/";
    const newFilePath = currentUri + file.name;

    const fetch = jest.fn();
    const onSave = jest.fn();
    const setIsUploading = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleSaveResource({
      fetch,
      currentUri,
      onSave,
      setIsUploading,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    await handler(file);

    expect(overwriteFile).toHaveBeenCalledWith(newFilePath, file, {
      type: file.type,
      fetch,
    });
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });
});

describe("handleFileSelect", () => {
  const fileContents = "file contents";

  const file = new Blob([fileContents], {
    type: "text/plain",
    name: "myfile.txt",
  });

  const currentUri = "https://www.mypodbrowser.com/";

  const setIsUploading = jest.fn();
  const setFile = jest.fn();
  const findFile = jest.fn();
  const saveUploadedFile = jest.fn();
  const setSeverity = jest.fn();
  const setMessage = jest.fn();
  const setAlertOpen = jest.fn();

  const handler = handleFileSelect({
    currentUri,
    setIsUploading,
    setFile,
    findFile,
    saveUploadedFile,
    setSeverity,
    setMessage,
    setAlertOpen,
  });
  test("it returns a handler that uploads a file", async () => {
    await handler({ target: { files: [file] } });

    expect(setIsUploading).toHaveBeenCalled();
    expect(setFile).toHaveBeenCalled();
    expect(findFile).toHaveBeenCalled();
    expect(saveUploadedFile).toHaveBeenCalled();
  });

  test("it returns a handler that returns an error if not successful", async () => {
    await handler();

    expect(setSeverity).toHaveBeenCalledWith("error");
    expect(setMessage).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalled();
  });
});

describe("handleUploadedFile", () => {
  test("it returns a handler that triggers the confirmation logic in case the file already exists", async () => {
    const fileContents = "file contents";

    const file = new Blob([fileContents], {
      type: "text/plain",
      name: "myfile.txt",
    });

    const existingFile = true;

    const saveResource = jest.fn();
    const setIsUploading = jest.fn();
    const setOpen = jest.fn();
    const setTitle = jest.fn();
    const setContent = jest.fn();
    const setConfirmationSetup = jest.fn();

    const handler = handleUploadedFile({
      setOpen,
      setTitle,
      setContent,
      setConfirmationSetup,
      setIsUploading,
      saveResource,
    });

    await handler(file, existingFile);

    expect(setIsUploading).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalled();
    expect(setContent).toHaveBeenCalled();
    expect(setTitle).toHaveBeenCalled();
    expect(setConfirmationSetup).toHaveBeenCalled();
  });
});

describe("findExistingFile", () => {
  test("it tries to find a file and returns the file or throws an error and returns null if the file does not exist", async () => {
    const fileContents = "file contents";

    const file = new Blob([fileContents], {
      type: "text/plain",
      name: "myfile.txt",
    });

    const currentUri = "https://www.mypodbrowser.com/";

    return findExistingFile(currentUri, file.name).catch((error) => {
      expect(error).toMatch("error");
    });
  });
});

describe("handleConfirmation", () => {
  const fileContents = "file contents";

  const file = new Blob([fileContents], {
    type: "text/plain",
    name: "myfile.txt",
  });

  const setOpen = jest.fn();
  const saveResource = jest.fn();
  const setConfirmed = jest.fn();
  const setConfirmationSetup = jest.fn();

  const handler = handleConfirmation({
    setOpen,
    setConfirmed,
    saveResource,
    setConfirmationSetup,
  });

  test("it returns a handler that saves the file when user confirms dialog", async () => {
    await handler(true, true, file);

    expect(setOpen).toHaveBeenCalled();
    expect(saveResource).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalled();
    expect(setConfirmationSetup).toHaveBeenCalled();
  });
  test("it returns a handler that exits when user cancels the operation", async () => {
    await handler(true, false, file);

    expect(saveResource).not.toHaveBeenCalled();
    expect(setConfirmed).not.toHaveBeenCalled();
  });
});
