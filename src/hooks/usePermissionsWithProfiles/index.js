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

import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../models/contact/authenticated";
import { PUBLIC_AGENT_PREDICATE } from "../../models/contact/public";
import { fetchProfile } from "../../solidClientHelpers/profile";

export default function usePermissionsWithProfiles(permissions) {
  const [permissionsWithProfiles, setPermissionsWithProfiles] = useState([]);
  const { fetch } = useSession();

  useEffect(() => {
    if (!permissions) return;
    Promise.all(
      permissions.map(async (p) => {
        let profile;
        let profileError;
        if (
          p.webId === PUBLIC_AGENT_PREDICATE ||
          p.webId === AUTHENTICATED_AGENT_PREDICATE
        ) {
          return p;
        }
        try {
          profile = await fetchProfile(p.webId, fetch);
        } catch (error) {
          profileError = error;
        }
        return {
          ...p,
          profile,
          profileError,
        };
      })
    ).then((completed) => setPermissionsWithProfiles(completed));
  }, [permissions, fetch]);
  return { permissionsWithProfiles };
}
