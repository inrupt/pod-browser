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

import React, { createContext } from "react";
import T from "prop-types";
import useContacts from "../../hooks/useContacts";
import { GROUP_CONTACT } from "../../models/contact/group";

const GroupAllContext = createContext(null);

export default GroupAllContext;

export function GroupAllProvider({ children }) {
  const groups = useContacts([GROUP_CONTACT], {
    revalidateOnFocus: false,
    errorRetryCount: 0,
  });
  return (
    <GroupAllContext.Provider value={groups}>
      {children}
    </GroupAllContext.Provider>
  );
}

GroupAllProvider.propTypes = {
  children: T.node,
};

GroupAllProvider.defaultProps = {
  children: null,
};
