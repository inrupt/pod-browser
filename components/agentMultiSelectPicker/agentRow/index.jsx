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

/* eslint react/jsx-props-no-spreading: off */

import React from "react";
import { useThing } from "@inrupt/solid-ui-react";
import { createStyles, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import SkeletonRow from "../skeletonRow";
import ErrorMessage from "../../errorMessage";
import Avatar from "../../avatar";
import styles from "./styles";
import useContactProfile from "../../../src/hooks/useContactProfile";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-webid";

export default function AgentRow() {
  const { thing } = useThing();
  const { data: contactFull, error, isValidating } = useContactProfile(thing, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const classes = useStyles();

  if (!contactFull || isValidating) return <SkeletonRow />;
  if (error) return <ErrorMessage error={error} />;

  const originalUrl = contactFull.type?.getOriginalUrl(contactFull);
  const name = contactFull.type?.getName(contactFull);
  const avatarProps = contactFull.type?.getAvatarProps(contactFull);
  return (
    <Tooltip title={originalUrl || "Unable to load profile"}>
      <div className={classes.nameAndAvatarContainer}>
        <Avatar className={classes.avatar} alt={originalUrl} {...avatarProps} />
        <Typography
          classes={{ body1: classes.detailText }}
          data-testid={TESTCAFE_ID_AGENT_WEB_ID}
          className={classes.detailText}
        >
          {name || originalUrl}
        </Typography>
      </div>
    </Tooltip>
  );
}
