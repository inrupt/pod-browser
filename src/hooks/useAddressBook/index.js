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
import useSWR from "swr";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { contactsContainerIri } from "../../addressBook";
import { getResource } from "../../solidClientHelpers/resource";
import { ERROR_CODES, isHTTPError } from "../../error";
import { loadAddressBook, saveNewAddressBook } from "../../models/addressBook";

export default function useAddressBook() {
  const { session, fetch } = useSession();
  const { data: profile } = useAuthenticatedProfile();

  const { data, ...props } = useSWR(["addressBook", session], async () => {
    if (!session.info.isLoggedIn || !profile) return null;
    const { pods, webId } = profile;
    const contactsIri = contactsContainerIri(pods[0]);
    const {
      response: existingAddressBook,
      error: existingError,
    } = await getResource(contactsIri, fetch);

    if (existingAddressBook) {
      return loadAddressBook(existingAddressBook.iri, fetch);
    }

    if (existingError && isHTTPError(existingError, ERROR_CODES.NOT_FOUND)) {
      return saveNewAddressBook(contactsIri, webId, fetch);
    }

    throw existingError;
  });
  return { addressBook: data, ...props };
}
