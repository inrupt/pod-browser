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

import { getSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client";
import { parseUrl } from "../stringHelpers";
import { createResponder, isContainerIri } from "./utils";

export function getResourceName(iri) {
  let { pathname } = parseUrl(iri);
  if (isContainerIri(pathname)) {
    pathname = pathname.substring(0, pathname.length - 1);
  }
  const encodedURISegment =
    pathname.match(/(?!\/)(?:.(?!\/))+$/)?.toString() || "";
  return decodeURIComponent(encodedURISegment);
}

export async function getResource(iri, fetch) {
  const { respond, error } = createResponder();

  try {
    const dataset = await getSolidDataset(iri, { fetch });
    const resource = { dataset, iri };

    return respond(resource);
  } catch (e) {
    return error(e.message);
  }
}

export async function getOrCreateContainer(iri, fetch) {
  const { respond, error } = createResponder();
  const { response, error: getError } = await getResource(iri, fetch);
  if (response) return respond(response.dataset);
  if (getError && isHTTPError(getError, 404)) {
    try {
      const container = await createContainerAt(iri, { fetch });
      return respond(container);
    } catch (err) {
      return error(err.message);
    }
  }
  return error(getError);
}

export async function saveResource({ dataset, iri }, fetch) {
  const { respond, error } = createResponder();
  try {
    const response = await saveSolidDatasetAt(iri, dataset, { fetch });
    return respond(response);
  } catch (e) {
    return error(e.message);
  }
}
