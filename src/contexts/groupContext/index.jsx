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

import React, { createContext, useContext } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import useGroup from "../../hooks/useGroup";
import { getGroupName, getGroupUrl } from "../../models/group";
import GroupAllContext from "../groupAllContext";

const GroupContext = createContext(null);

export default GroupContext;

export function GroupProvider({ children }) {
  const { data: groups } = useContext(GroupAllContext);
  const sortedGroups = groups?.sort((a, b) =>
    getGroupName(a) < getGroupName(b) ? -1 : 1
  );
  const router = useRouter();
  const groupUrl =
    router.query.iri ||
    (sortedGroups && sortedGroups[0] ? getGroupUrl(sortedGroups[0]) : null); // TODO: Tried sortedGroup?[0] ? ... : ..., but ESLint don't accept it
  const group = useGroup(groupUrl, {
    revalidateOnFocus: false,
    errorRetryCount: 0,
  });
  return (
    <GroupContext.Provider value={group}>{children}</GroupContext.Provider>
  );
}

GroupProvider.propTypes = {
  children: T.node.isRequired,
};
