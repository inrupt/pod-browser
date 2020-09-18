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

import { useContext, useEffect, useState } from "react";
import { getSourceUrl } from "@inrupt/solid-client";
import SessionContext from "../../contexts/sessionContext";
import { getPeople } from "../../addressBook";

export default function usePeople(addressBook) {
  const [people, setPeople] = useState(null);
  const [error, setError] = useState(null);
  const {
    session: { fetch },
  } = useContext(SessionContext);

  useEffect(() => {
    if (!addressBook) {
      setPeople(null);
      return;
    }
    const contactsIri = getSourceUrl(addressBook);
    (async () => {
      const { response, error: peopleError } = await getPeople(
        contactsIri,
        fetch
      );
      if (response) {
        setPeople(response);
        return;
      }
      setError(peopleError);
    })();
  }, [fetch, addressBook]);

  return [people, error];
}
