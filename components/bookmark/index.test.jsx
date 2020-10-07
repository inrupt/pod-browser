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
import { mount } from "enzyme";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { mountToJson, WithTheme } from "../../__testUtils/mountWithTheme";
import Bookmark, { toggleBookmarkHandler } from "./index";
import BookmarkContext from "../../src/contexts/bookmarksContext";
import defaultTheme from "../../src/theme";
import * as bookmarkHelpers from "../../src/solidClientHelpers/bookmarks";

const iri = "https://mypod.myhost.com/catvideos";
const bookmarks = mockSolidDatasetFrom(
  "https://mypod.myhost.com/bookmarks/index.ttl"
);
const setBookmarks = jest.fn();

describe("Bookmark", () => {
  test("it renders a bookmark icon", async () => {
    const tree = mountToJson(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} />
      </BookmarkContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });
});
describe("toggleHandler", () => {
  test("it updates icon when the toggle handler is triggered", async () => {
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
          <Bookmark iri={iri} />
        </BookmarkContext.Provider>
      </WithTheme>
    );

    expect(tree.html()).toContain("bookmark-icon-unselected");
  });

  test("it updates the icon when adding bookmarks", async () => {
    const setBookmarked = jest.fn();
    const setDisabled = jest.fn();

    const toggleHandler = toggleBookmarkHandler({
      bookmarks,
      bookmarked: false,
      iri,
      setSeverity: jest.fn(),
      setMessage: jest.fn(),
      setAlertOpen: jest.fn(),
      setBookmarked,
      setBookmarks,
      setDisabled,
      fetch: jest.fn(),
    });

    jest
      .spyOn(bookmarkHelpers, "addBookmark")
      .mockResolvedValueOnce({ response: bookmarks });

    await toggleHandler();
    expect(setBookmarked).toHaveBeenCalledWith(true);
    expect(setBookmarks).toHaveBeenCalled();
  });
  test("it updates the icon when removing bookmarks", async () => {
    const setBookmarked = jest.fn();
    const setDisabled = jest.fn();

    const toggleHandler = toggleBookmarkHandler({
      bookmarks,
      bookmarked: true,
      iri,
      setSeverity: jest.fn(),
      setMessage: jest.fn(),
      setAlertOpen: jest.fn(),
      setBookmarked,
      setBookmarks,
      setDisabled,
      fetch: jest.fn(),
    });

    jest
      .spyOn(bookmarkHelpers, "removeBookmark")
      .mockResolvedValueOnce({ response: bookmarks });

    await toggleHandler();
    expect(setBookmarked).toHaveBeenCalledWith(false);
    expect(setBookmarks).toHaveBeenCalled();
  });
  test("it renders an error when it is unsuccessful in adding bookmark", async () => {
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
          <Bookmark iri={iri} />
        </BookmarkContext.Provider>
      </WithTheme>
    );

    expect(tree.html()).toContain("bookmark-icon-unselected");

    const setBookmarked = jest.fn();
    const setAlertOpen = jest.fn();
    const setSeverity = jest.fn();
    const setMessage = jest.fn();
    const setDisabled = jest.fn();

    const toggleHandler = toggleBookmarkHandler({
      bookmarks,
      bookmarked: false,
      iri,
      setSeverity,
      setMessage,
      setAlertOpen,
      setBookmarked,
      setBookmarks,
      setDisabled,
      fetch: jest.fn(),
    });

    jest
      .spyOn(bookmarkHelpers, "addBookmark")
      .mockResolvedValueOnce({ response: "", error: "There was an error" });

    await toggleHandler();
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(setSeverity).toHaveBeenCalledWith("error");
    expect(setMessage).toHaveBeenCalledWith("There was an error");
    expect(setBookmarks).not.toHaveBeenCalled();
  });
});
