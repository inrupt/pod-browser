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

import React, { useState } from "react";
import { createStyles, Modal } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";
import AgentPickerModal from "../agentPickerModal";
import styles from "./styles";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_ADVANCED_SHARING_BUTTON = "advanced-sharing-button";
export const TESTCAFE_ID_MODAL_OVERLAY = "advanced-sharing-modal-overlay";

export default function AdvancedSharingButton() {
  const defaultType = "viewAndAdd";
  const classes = useStyles();
  const { mutate: mutatePermissions } = usePolicyPermissions(defaultType);

  const bem = useBem(useStyles());
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.sharingButtonContainer}>
      <Button
        data-testid={TESTCAFE_ID_ADVANCED_SHARING_BUTTON}
        variant="text"
        className={classes.sharingButton}
        onClick={handleOpen}
      >
        <i className={clsx(bem("icon-settings"), bem("icon"))} />
        Advanced Sharing
      </Button>

      <Modal
        data-testid={TESTCAFE_ID_MODAL_OVERLAY}
        open={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClose={handleClose}
        aria-labelledby="Advanced sharing modal"
        aria-describedby="Advanced sharing for this resource"
      >
        <AgentPickerModal
          type={defaultType}
          onClose={handleClose}
          mutatePermissions={mutatePermissions}
          advancedSharing
        />
      </Modal>
    </div>
  );
}
