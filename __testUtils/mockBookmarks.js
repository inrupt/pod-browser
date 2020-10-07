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

import {
  addDatetime,
  addStringNoLocale,
  addUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
} from "@inrupt/solid-client";
import { dct, rdf } from "rdf-namespaces";
import {
  RECALLS_PROPERTY_IRI,
  BOOKMARK_TYPE_IRI,
} from "../src/solidClientHelpers/bookmarks";

const bookmarksUrl = "http://example.com/bookmarks/index.ttl";
const bookmark1Title = "Cat gifs";
const bookmark1Recalls = "https://example.com/catgifs";
const bookmark2Title = "Dog videos";
const bookmark2Recalls = "https://example.com/dogvideos";

export default function mockBookmarks() {
  let bookmarksDataset = mockSolidDatasetFrom(bookmarksUrl);
  const bookmark1 = mockThingFrom(`${bookmarksUrl}#1234`);
  const bookmark1WithTitle = addStringNoLocale(
    bookmark1,
    dct.title,
    bookmark1Title
  );
  const bookmark1WithRecalls = addUrl(
    bookmark1WithTitle,
    RECALLS_PROPERTY_IRI,
    bookmark1Recalls
  );
  const bookmark1WithType = addUrl(
    bookmark1WithRecalls,
    rdf.type,
    BOOKMARK_TYPE_IRI
  );
  const bookmark1WithCreated = addDatetime(
    bookmark1WithType,
    RECALLS_PROPERTY_IRI,
    new Date(Date.UTC(2020, 9, 28, 3, 24, 0))
  );
  bookmarksDataset = setThing(bookmarksDataset, bookmark1WithCreated);
  const bookmark2 = mockThingFrom(`${bookmarksUrl}#4567`);
  const bookmark2WithTitle = addStringNoLocale(
    bookmark2,
    dct.title,
    bookmark2Title
  );
  const bookmark2WithRecalls = addUrl(
    bookmark2WithTitle,
    RECALLS_PROPERTY_IRI,
    bookmark2Recalls
  );
  const bookmark2WithType = addUrl(
    bookmark2WithRecalls,
    rdf.type,
    BOOKMARK_TYPE_IRI
  );
  const bookmark2WithCreated = addDatetime(
    bookmark2WithType,
    RECALLS_PROPERTY_IRI,
    new Date(Date.UTC(2020, 9, 29, 3, 24, 0))
  );
  bookmarksDataset = setThing(bookmarksDataset, bookmark2WithCreated);
  return {
    dataset: bookmarksDataset,
    iri: bookmarksUrl,
  };
}
