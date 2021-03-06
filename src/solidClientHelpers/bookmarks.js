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
  createSolidDataset,
  createThing,
  getThingAll,
  getUrl,
  removeThing,
  setThing,
} from "@inrupt/solid-client";
import { dct, rdf } from "rdf-namespaces";
import { getResourceName, saveResource } from "./resource";
import { defineThing } from "./utils";

export async function initializeBookmarks(iri, fetch) {
  const index = createThing();
  const indexDataset = setThing(createSolidDataset(), index);
  const thing = {
    iri,
    dataset: indexDataset,
  };
  const { response: bookmarks } = await saveResource(thing, fetch);
  return { dataset: bookmarks, iri };
}

export const RECALLS_PROPERTY_IRI =
  "http://www.w3.org/2002/01/bookmark#recalls";
export const BOOKMARK_TYPE_IRI = "http://www.w3.org/2002/01/bookmark#Bookmark";

export async function addBookmark(bookmarkIri, bookmarks, profileName, fetch) {
  const { dataset, iri } = bookmarks;

  const resourceName = getResourceName(bookmarkIri);

  const bookmarkTitle =
    !resourceName.length && profileName ? `${profileName}'s Pod` : resourceName;

  const [existingBookmark] = getThingAll(dataset).filter(
    (t) => getUrl(t, RECALLS_PROPERTY_IRI) === bookmarkIri
  );
  if (existingBookmark) {
    return { response: bookmarks, error: null };
  }
  const bookmark = defineThing(
    {},
    (t) => addUrl(t, rdf.type, BOOKMARK_TYPE_IRI),
    (t) => addStringNoLocale(t, dct.title, bookmarkTitle),
    (t) => addUrl(t, RECALLS_PROPERTY_IRI, bookmarkIri),
    (t) => addDatetime(t, dct.created, new Date())
  );
  const bookmarkResource = {
    dataset: setThing(dataset, bookmark),
    iri,
  };
  return saveResource(bookmarkResource, fetch);
}

export async function removeBookmark(bookmarkIri, bookmarks, fetch) {
  const { dataset, iri } = bookmarks;
  const [bookmarkToDelete] = getThingAll(dataset).filter(
    (t) => getUrl(t, RECALLS_PROPERTY_IRI) === bookmarkIri
  );
  if (!bookmarkToDelete) {
    return { response: bookmarks, error: null };
  }
  const updatedDataset = {
    dataset: removeThing(dataset, bookmarkToDelete),
    iri,
  };
  return saveResource(updatedDataset, fetch);
}
