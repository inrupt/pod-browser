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

import { useState, useEffect } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { getStringNoLocale } from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import { joinPath } from "../../stringHelpers";
import { getResource } from "../../solidClientHelpers/resource";

export default function useFindResourceOwner(iri) {
  const session = useSession();
  const { fetch } = session;
  const [ownerName, setOwnerName] = useState();
  const [error, setError] = useState();
  const resourceOrigin = new URL(iri).origin;
  const profileIri = joinPath(resourceOrigin, "profile/card#me");

  useEffect(() => {
    (async () => {
      const {
        response: ownerProfile,
        error: ownerProfileError,
      } = await getResource(profileIri, fetch);
      if (ownerProfileError) {
        setError(ownerProfileError);
      }
      if (!ownerProfile) {
        setOwnerName(null);
        return;
      }
      const name =
        getStringNoLocale(ownerProfile.dataset, vcard.fn) ||
        getStringNoLocale(ownerProfile.dataset, foaf.name);
      setOwnerName(name);
    })();
  }, [profileIri, fetch, setOwnerName]);
  return { ownerName, error };
}
