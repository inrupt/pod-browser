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
import T from "prop-types";
import { createStyles, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Button, Form } from "@inrupt/prism-react-components";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import SkeletonRow from "../skeletonRow";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_WEBID_INPUT = "webid-input";
const TESTCAFE_ID_ADD_WEBID_BUTTON = "add-button";

export default function AddAgentRow({ onNewAgentSubmit }) {
  const bem = useBem(useStyles());
  const [agentWebId, setAgentWebId] = useState("");
  const [existingPermission, setExistingPermission] = useState();
  const [processing, setProcessing] = useState(false);

  const handleAddAgentsWebIds = async (event) => {
    event.preventDefault();
    setProcessing(true);
    await onNewAgentSubmit(agentWebId);
    setProcessing(false);
  };

  if (processing) return <SkeletonRow />;

  return (
    <div className={bem("add-agent-row")}>
      <Form
        className={bem("add-agent-row__form")}
        onSubmit={handleAddAgentsWebIds}
      >
        <div className={bem("add-agent-row__search")}>
          <TextField
            aria-label="Enter WebID"
            placeholder="Enter WebID"
            value={agentWebId}
            error={existingPermission}
            helperText={
              existingPermission ? "That WebID has already been added" : null
            }
            onChange={(e) => {
              setExistingPermission(false);
              setAgentWebId(e.target.value);
            }}
            classes={{ root: bem("add-agent-row__search-input") }}
            type="url"
            inputProps={{ "data-testid": TESTCAFE_ID_WEBID_INPUT }}
            // the duplicate props is known issue for Material UI: https://github.com/mui-org/material-ui/issues/11377
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              pattern: "https://.+",
              title: "Must start with https://",
              className: bem("add-agent-row__search-input"),
              disableUnderline: true,
            }}
            required
          />
        </div>
        <Button
          data-testid={TESTCAFE_ID_ADD_WEBID_BUTTON}
          className={bem("add-agent-row__button")}
          type="submit"
          variant="with-input"
        >
          Add
        </Button>
      </Form>
    </div>
  );
}

AddAgentRow.propTypes = {
  onNewAgentSubmit: T.func.isRequired,
};
