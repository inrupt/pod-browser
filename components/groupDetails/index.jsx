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

import React, { useContext } from "react";
import { createStyles } from "@material-ui/core";
import { Content, LinkButton } from "@inrupt/prism-react-components";
import Link from "next/link";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import GroupContext from "../../src/contexts/groupContext";
import Spinner from "../spinner";
import {
  getGroupDescription,
  getGroupMemberUrlAll,
  getGroupName,
} from "../../src/models/group";
import GroupDetailsActionButton from "./groupDetailsActionButton";
import GroupAllContext from "../../src/contexts/groupAllContext";
import GroupAddMembersButton from "./groupAddMembersButton";

export const TESTCAFE_ID_GROUP_DETAILS = "group-details";
export const TESTCAFE_ID_GROUP_DETAILS_BACK_LINK = "group-details-back-link";
export const TESTCAFE_ID_GROUP_DETAILS_NAME = "group-details-name";
export const TESTCAFE_ID_GROUP_DETAILS_DESCRIPTION =
  "group-details-description";

export const MESSAGE_GROUP_DETAILS_DESCRIPTION_FALLBACK =
  "(Optional) Add a group description";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function GroupDetails() {
  const { data: group, isValidating: groupIsValidating } = useContext(
    GroupContext
  );
  const { isValidating: groupAllIsValidating } = useContext(GroupAllContext);
  const bem = useBem(useStyles());

  const loading = groupIsValidating || groupAllIsValidating;
  if (loading) return <Spinner />;

  const groupDescription = getGroupDescription(group);
  const members = getGroupMemberUrlAll(group);
  return (
    <>
      <div
        data-testid={TESTCAFE_ID_GROUP_DETAILS}
        className={bem("group-details")}
      >
        <div className={bem("group-details__main-content")}>
          <Link href="/groups">
            <LinkButton
              variant="text"
              iconBefore="caret-left"
              className={bem("group-details__back-link")}
              data-testid={TESTCAFE_ID_GROUP_DETAILS_BACK_LINK}
            >
              All Groups
            </LinkButton>
          </Link>
          <Content>
            <h1
              className={bem("group-details__title")}
              data-testid={TESTCAFE_ID_GROUP_DETAILS_NAME}
            >
              {getGroupName(group)}
            </h1>
            {groupDescription ? (
              <p
                className={bem("group-details__description")}
                data-testid={TESTCAFE_ID_GROUP_DETAILS_DESCRIPTION}
              >
                {groupDescription}
              </p>
            ) : (
              <p
                className={bem("group-details__description", "fallback")}
                data-testid={TESTCAFE_ID_GROUP_DETAILS_DESCRIPTION}
              >
                {MESSAGE_GROUP_DETAILS_DESCRIPTION_FALLBACK}
              </p>
            )}
          </Content>
          <div>
            <GroupAddMembersButton />
          </div>
        </div>
        <GroupDetailsActionButton
          className={bem("group-details__action-button")}
        />
      </div>
      <div>
        <h2>Temporary: Group members (only URL for now)</h2>
        <ul>
          {members.map((url) => (
            <li key={url} style={{ wordBreak: "break-word" }}>
              {url}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
