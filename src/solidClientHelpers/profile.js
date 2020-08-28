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
  fetchLitDataset,
  getIri,
  getIriAll,
  getStringNoLocale,
  getThing,
} from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import { namespace } from "./utils";

export function displayProfileName({ nickname, name, webId }) {
  if (name) return name;
  if (nickname) return nickname;
  return webId;
}

export async function fetchProfile(webId, fetch) {
  const dataset = await fetchLitDataset(webId, { fetch });

  const profile = getThing(dataset, webId);
  const nickname = getStringNoLocale(profile, namespace.nickname);
  const name = getStringNoLocale(profile, namespace.name);
  const avatar = getIri(profile, namespace.hasPhoto);
  const pods = getIriAll(profile, space.storage);

  return {
    avatar,
    dataset,
    name,
    nickname,
    pods,
    webId,
  };
}