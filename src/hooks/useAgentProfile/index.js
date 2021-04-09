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

import useSWR from "swr";
import { useSession } from "@inrupt/solid-ui-react";
import { PUBLIC_AGENT_PREDICATE } from "../../models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../models/contact/authenticated";
import { fetchProfile } from "../../solidClientHelpers/profile";

export const GET_PROFILE = "getProfile";

export default function useAgentProfile(webId, options) {
  const {
    session: { fetch },
  } = useSession();

  return useSWR(
    [webId, GET_PROFILE],
    async () => {
      if (!webId) return null;
      if (webId === PUBLIC_AGENT_PREDICATE) {
        return { name: "Anyone" };
      }
      if (webId === AUTHENTICATED_AGENT_PREDICATE) {
        return { name: "Anyone signed in" };
      }
      return fetchProfile(webId, fetch);
    },
    options
  );
}
