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

/* eslint-disable camelcase */
import { Dispatch, ReactElement, useContext, useEffect, useState } from "react";
import { PrismTheme } from "@solid/lit-prism-patterns";
import { StyleRules } from "@material-ui/styles";
import { AlertProps } from "@material-ui/lab/Alert";
import { unstable_Access } from "@solid/lit-pod";
import {
  Button,
  Checkbox,
  createStyles,
  FormControlLabel,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import AlertContext from "../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import {
  displayPermissions,
  NormalizedPermission,
  ACL_KEYS,
  IResponse,
} from "../../src/lit-solid-helpers";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface IConfirmDialog {
  warn: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export function setPermissionHandler(
  access: Record<string, boolean>,
  key: string,
  setAccess: (access: unstable_Access) => void
): () => void {
  return () => {
    const value = !access[key];
    setAccess({
      ...access,
      [key]: value,
    } as unstable_Access);
  };
}

interface IPermissionCheckbox {
  label: string;
  classes: Record<string, string>;
  onChange: () => void;
  value: boolean;
}

export function PermissionCheckbox({
  value,
  label,
  classes,
  onChange,
}: IPermissionCheckbox): ReactElement {
  const name = label.toLowerCase();

  return (
    // prettier-ignore
    <ListItem className={classes.listItem}>
      <FormControlLabel
        classes={{ label: classes.label }}
        label={label}
        control={(
          <Checkbox
            classes={{ root: classes.checkbox }}
            checked={value}
            name={name}
            onChange={onChange}
          />
        )}
      />
    </ListItem>
  );
}

interface ISavePermissionHandler {
  access: unstable_Access;
  setMessage: Dispatch<string>;
  setSeverity: Dispatch<AlertProps["severity"]>;
  setDialogOpen: Dispatch<boolean>;
  setAlertOpen: Dispatch<boolean>;
  onSave: (access: unstable_Access) => Promise<IResponse>;
}

export function savePermissionsHandler({
  access,
  onSave,
  setAlertOpen,
  setDialogOpen,
  setMessage,
  setSeverity,
}: ISavePermissionHandler): () => void {
  return async (): Promise<void> => {
    const { response, error } = await onSave(access);

    if (response) {
      setDialogOpen(false);
      setMessage("Your permissions have been saved!");
      setAlertOpen(true);
    } else {
      setDialogOpen(false);
      setSeverity("error" as AlertProps["severity"]);
      setMessage(error as string);
      setAlertOpen(true);
    }
  };
}

interface ISaveHandler {
  warnOnSubmit: boolean;
  setDialogOpen: Dispatch<boolean>;
  savePermissions: () => void;
}

export function saveHandler({
  setDialogOpen,
  warnOnSubmit,
  savePermissions,
}: ISaveHandler) {
  return async (): Promise<void> => {
    if (warnOnSubmit) {
      setDialogOpen(true);
    } else {
      await savePermissions();
    }
  };
}

export function toggleOpen(
  open: boolean,
  setOpen: Dispatch<boolean>
): () => void {
  return () => setOpen(!open);
}

interface RequiredPermissionProps {
  alias: string;
  acl: unstable_Access;
}

interface IPermissionForm {
  permission: RequiredPermissionProps & Partial<NormalizedPermission>;
  warnOnSubmit: boolean;
  onSave: (access: unstable_Access) => Promise<IResponse>;
}

export default function PermissionsForm({
  permission,
  warnOnSubmit,
  onSave,
}: IPermissionForm): ReactElement | null {
  const { acl } = permission;

  const classes = useStyles();
  const [access, setAccess] = useState<unstable_Access>(acl);
  const [formOpen, setFormOpen] = useState(false);
  const icon = formOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />;
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const { setTitle, setOpen, setContent, confirmed, setConfirmed } = useContext(
    ConfirmationDialogContext
  );

  const savePermissions = savePermissionsHandler({
    access,
    onSave,
    setAlertOpen,
    setDialogOpen: setOpen,
    setMessage,
    setSeverity,
  });

  const handleSaveClick = saveHandler({
    savePermissions,
    setDialogOpen: setOpen,
    warnOnSubmit,
  });

  const readChange = setPermissionHandler(access, ACL_KEYS.READ, setAccess);
  const writeChange = setPermissionHandler(access, ACL_KEYS.WRITE, setAccess);
  const appendChange = setPermissionHandler(access, ACL_KEYS.APPEND, setAccess);
  const controlChange = setPermissionHandler(
    access,
    ACL_KEYS.CONTROL,
    setAccess
  );
  const handleToggleClick = toggleOpen(formOpen, setFormOpen);

  useEffect(() => {
    if (confirmationSetup && !confirmed) return;

    setTitle("Confirm Access Permissions");
    setContent(
      <p>
        You are about to change your own access to this resource, are you sure
        you wish to continue?
      </p>
    );
    setConfirmationSetup(true);

    if (confirmed) {
      setOpen(false);
      setConfirmed(false);
      savePermissions();
    }
  }, [
    setTitle,
    setContent,
    confirmed,
    setOpen,
    setConfirmed,
    savePermissions,
    confirmationSetup,
    setConfirmationSetup,
  ]);

  return (
    // prettier-ignore
    // This chooses typescript rules over prettier in a battle over adding parenthesis to JSX
    <div className={classes.container}>
      <Button
        className={classes.summary}
        onClick={handleToggleClick}
        endIcon={icon}
      >
        <span>{displayPermissions(access)}</span>
      </Button>
      <section className={formOpen ? classes.selectionOpen : classes.selectionClosed}>
        <List>
          <PermissionCheckbox value={access.read} classes={classes} label="read" onChange={readChange} />
          <PermissionCheckbox value={access.write} classes={classes} label="write" onChange={writeChange} />
          <PermissionCheckbox value={access.append} classes={classes} label="append" onChange={appendChange} />
          <PermissionCheckbox value={access.control} classes={classes} label="control" onChange={controlChange} />
        </List>

        <Button onClick={handleSaveClick} variant="contained">
          Save
        </Button>
      </section>
    </div>
  );
}
