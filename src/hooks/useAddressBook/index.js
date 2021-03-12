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
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import {
  createAddressBook,
  getAddressBookContainerUrl,
  loadAddressBook,
} from "../../models/addressBook";
import { ERROR_CODES, isHTTPError } from "../../error";

export const ERROR_USE_ADDRESS_BOOK_NO_POD_ROOT =
  "No pod root found for authenticated user";

export default function useAddressBook(
  swrOptions = {
    revalidateOnFocus: false,
    errorRetryCount: 0,
  }
) {
  const { fetch } = useSession();
  const {
    data: authenticatedProfile,
    error: authenticatedError,
  } = useAuthenticatedProfile();

  return useSWR(
    ["addressBook", authenticatedProfile],
    async () => {
      if (!authenticatedProfile && !authenticatedError) return null;
      if (authenticatedError) throw authenticatedError;
      const podRootUrl = authenticatedProfile.pods[0];
      if (!podRootUrl) throw new Error(ERROR_USE_ADDRESS_BOOK_NO_POD_ROOT);
      const containerUrl = getAddressBookContainerUrl(podRootUrl);
      try {
        return await loadAddressBook(containerUrl, fetch);
      } catch (error) {
        if (isHTTPError(error, ERROR_CODES.NOT_FOUND)) {
          // the address book is not yet created
          return createAddressBook(containerUrl, authenticatedProfile.webId);
        }
        throw error;
      }
    },
    swrOptions
  );
}
