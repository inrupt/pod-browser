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

import React, { useCallback, useContext, useEffect, useState } from "react";
import T from "prop-types";
import { Avatar, createStyles, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSolidDatasetWithAcl, getSourceUrl } from "@inrupt/solid-client";
import { Button } from "@inrupt/prism-react-components";
import PermissionsForm from "../../../permissionsForm";
import styles from "./styles";
import { displayProfileName } from "../../../../src/solidClientHelpers/profile";
import AlertContext from "../../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import { saveAllPermissions } from "../../../../src/solidClientHelpers/permissions";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-web-id";

export default function AgentAccess({ permission }) {
  const classes = useStyles();
  const {
    fetch,
    session: {
      info: { webId: authenticatedWebId },
    },
  } = useSession();
  const { acl, profile, webId } = permission;
  const [access, setAccess] = useState(acl);
  const [tempAccess, setTempAccess] = useState(null);
  const { avatar } = profile;
  const { dataset, setDataset } = useContext(DatasetContext);
  const name = displayProfileName(profile);

  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const datasetIri = getSourceUrl(dataset);
  const dialogId = `change-agent-access-${datasetIri}`;
  const {
    setTitle,
    open,
    setOpen,
    setContent,
    confirmed,
    setConfirmed,
  } = useContext(ConfirmationDialogContext);

  const savePermissions = useCallback(
    async (newAccess) => {
      setAccess(newAccess);

      const datasetWithAcl = await getSolidDatasetWithAcl(datasetIri, {
        fetch,
      });

      // eslint-disable-next-line no-unused-vars
      const [{ response }, error] = await saveAllPermissions(
        datasetWithAcl,
        webId,
        newAccess,
        fetch
      );

      if (error) throw error;

      setDataset(response);

      setTempAccess(null);
      setSeverity("success");
      setMessage("Your permissions have been updated!");
      setAlertOpen(true);
    },
    [
      datasetIri,
      fetch,
      webId,
      setDataset,
      setSeverity,
      setMessage,
      setAlertOpen,
    ]
  );

  const saveHandler = () => {
    if (authenticatedWebId === webId) {
      setOpen(dialogId);
    } else {
      savePermissions(tempAccess);
    }
  };

  useEffect(() => {
    if (!open || open !== dialogId) return;

    setTitle("Confirm Access Permissions");
    setContent(
      <p>
        You are about to change your own access to this resource, are you sure
        you wish to continue?
      </p>
    );

    if (confirmed === null) return;

    (async () => {
      if (open && confirmed) {
        await savePermissions(tempAccess);
      }

      if (open && confirmed !== null) {
        setTempAccess(null);
        setOpen(null);
        setConfirmed(null);
      }
    })();
  }, [
    setTitle,
    setContent,
    confirmed,
    setOpen,
    setConfirmed,
    open,
    savePermissions,
    tempAccess,
    dialogId,
  ]);

  return (
    <>
      <Avatar className={classes.avatar} alt={name} src={avatar} />
      <Typography
        data-testid={TESTCAFE_ID_AGENT_WEB_ID}
        className={classes.detailText}
      >
        {name}
      </Typography>
      <PermissionsForm key={webId} acl={access} onChange={setTempAccess}>
        <Button onClick={saveHandler}>Save</Button>
      </PermissionsForm>
    </>
  );
}

AgentAccess.propTypes = {
  permission: T.object.isRequired,
  // onSave: T.func.isRequired,
  // onSubmit: T.func.isRequired,
  // saveFn: T.func.isRequired,
};
