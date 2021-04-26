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
  addStringNoLocale,
  addUrl,
  createThing,
  getStringNoLocale,
  getUrl,
  setThing,
} from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import { chain } from "../../../solidClientHelpers/utils";

const AGENT_PREDICATE = "http://www.w3.org/ns/solid/acp#agent";
export const AUTHENTICATED_AGENT_PREDICATE =
  "http://www.w3.org/ns/solid/acp#AuthenticatedAgent";

export const AUTHENTICATED_AGENT_NAME = "Anyone signed in";
export const AUTHENTICATED_AGENT_TYPE = "authenticated";

export const AUTHENTICATED_AGENT = {
  isOfType: (thing) =>
    thing && getUrl(thing, AGENT_PREDICATE) === AUTHENTICATED_AGENT_PREDICATE,
  getName: (thing) => getStringNoLocale(thing, foaf.name),
  getAvatarProps: () => ({
    icon: "user-lock",
    src: null,
    variant: "authenticated",
  }),
};

export const createAuthenticatedAgent = (dataset) => {
  const thing = chain(
    createThing(),
    (t) =>
      addUrl(
        t,
        "http://www.w3.org/ns/solid/acp#agent",
        "http://www.w3.org/ns/solid/acp#AuthenticatedAgent"
      ),
    (t) => addStringNoLocale(t, foaf.name, "Anyone signed in")
  );
  const updatedDataset = setThing(dataset, thing);
  return {
    thing,
    dataset: updatedDataset,
    type: AUTHENTICATED_AGENT,
  };
};
