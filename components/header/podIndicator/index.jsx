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

import React, { useState } from "react";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";
import { useBem } from "@solid/lit-prism-patterns";
import Popover from "@material-ui/core/Popover";
import { Form, Input } from "@inrupt/prism-react-components";
import Skeleton from "@material-ui/lab/Skeleton";
import usePodOwnerProfile from "../../../src/hooks/usePodOwnerProfile";
import styles from "./styles";
import { urlLookupAndRedirect } from "../../../src/navigator";
import { isHTTPError } from "../../../src/solidClientHelpers/utils";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const clickHandler = (setAnchorEl) => (event) =>
  setAnchorEl(event.currentTarget);

export const closeHandler = (setAnchorEl) => () => setAnchorEl(null);

export const submitHandler = (handleClose) => async (
  event,
  url,
  router,
  fetch
) => {
  event.preventDefault();
  if (await urlLookupAndRedirect(url, router, { fetch })) {
    handleClose();
  }
};

export default function PodIndicator() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { fetch } = useSession();
  const bem = useBem(useStyles());
  const { profile, error } = usePodOwnerProfile();
  const loading = !profile && !error;

  const open = Boolean(anchorEl);
  const id = open ? "pod-navigator" : undefined;
  const handleClick = clickHandler(setAnchorEl);
  const handleClose = closeHandler(setAnchorEl);
  const onSubmit = submitHandler(handleClose);

  if (error && !isHTTPError(error.message, 403)) {
    // we'll accept 403s, but nothing else
    throw error;
  }

  return (
    <div className={classes.indicator}>
      <label htmlFor="pod-indicator-prompt" className={classes.indicatorLabel}>
        <span>Pod: </span>
        {loading ? (
          <Skeleton width={100} style={{ display: "inline-block" }} />
        ) : (
          <button
            data-testid="pod-indicator-prompt"
            id="pod-indicator-prompt"
            type="button"
            aria-describedby={id}
            onClick={handleClick}
            className={clsx(bem("button", "prompt"), classes.indicatorPrompt)}
          >
            {profile ? profile.name : "Unknown"}
          </button>
        )}
        <Popover
          id={id}
          classes={{
            paper: classes.popover,
          }}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Form onSubmit={(event) => onSubmit(event, url, router, fetch)}>
            <Input
              id="PodNavigator"
              label="Go to Pod"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </Form>
        </Popover>
      </label>
    </div>
  );
}
