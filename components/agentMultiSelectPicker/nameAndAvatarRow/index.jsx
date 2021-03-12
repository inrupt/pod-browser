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

/* eslint react/jsx-props-no-spreading: off, react/forbid-prop-types: off */

import React from "react";
import T from "prop-types";
import { createStyles, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import Avatar from "../../avatar";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-webid";

export default function NameAndAvatarRow({ name, originalUrl, avatarProps }) {
  const bem = useBem(useStyles());
  return (
    <Tooltip title={originalUrl || "Unable to load profile"}>
      <div className={bem("name-and-avatar")}>
        <Avatar
          className={bem("name-and-avatar__avatar")}
          alt={originalUrl}
          {...avatarProps}
        />
        <Typography
          classes={{ body1: bem("name-and-avatar__detail-text") }}
          data-testid={TESTCAFE_ID_AGENT_WEB_ID}
          className={bem("name-and-avatar__detail-text")}
        >
          {name || originalUrl}
        </Typography>
      </div>
    </Tooltip>
  );
}

NameAndAvatarRow.propTypes = {
  avatarProps: T.object,
  name: T.string,
  originalUrl: T.string,
};

NameAndAvatarRow.defaultProps = {
  avatarProps: {},
  name: null,
  originalUrl: null,
};
