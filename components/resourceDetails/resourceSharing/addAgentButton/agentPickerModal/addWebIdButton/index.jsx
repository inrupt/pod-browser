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

/* eslint-disable react/forbid-prop-types */

import React from "react";
import PropTypes from "prop-types";
import { createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";
import styles from "./styles";

const TESTCAFE_ADD_WEBID_BUTTON = "add-webid-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AddWebIdButton({ onClick, disabled }) {
  const bem = useBem(useStyles());
  const classes = useStyles();

  return (
    <Button
      variant="action"
      data-testid={TESTCAFE_ADD_WEBID_BUTTON}
      className={classes.button}
      disabled={disabled}
      onClick={onClick}
    >
      <i className={clsx(bem("icon-add"), bem("icon"))} />
      Add WebId
    </Button>
  );
}

AddWebIdButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

AddWebIdButton.defaultProps = {
  disabled: false,
};
