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

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import {
  Avatar,
  createStyles,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";

import {
  addStringNoLocale,
  addUrl,
  getStringNoLocale,
  getUrl,
} from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import styles from "./styles";
import { chain } from "../../../../src/solidClientHelpers/utils";
import { fetchProfile } from "../../../../src/solidClientHelpers/profile";
import { vcardExtras } from "../../../../src/addressBook";
import useContactProfileOld from "../../../../src/hooks/useContactProfileOld";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = vcardExtras("WebId");
const TESTCAFE_ID_WEBID_INPUT = "webid-input";
const TESTCAFE_ID_ADD_WEBID_BUTTON = "add-button";
const TESTCAFE_ID_AGENT_WEB_ID = "agent-webid";

const updateThingForNewRow = async (agentWebId, thing, fetch) => {
  let newThing;
  try {
    const profile = await fetchProfile(agentWebId, fetch);
    if (profile) {
      const { name, avatar, webId } = profile;
      newThing = chain(
        thing,
        (t) => addStringNoLocale(t, foaf.name, name),
        (t) => addUrl(t, VCARD_WEBID_PREDICATE, webId) // temporarily storing this here to have a webId to display for these temporary rows
      );
      if (avatar) {
        newThing = addUrl(newThing, vcard.hasPhoto, avatar);
      }
    } else {
      newThing = addUrl(thing, VCARD_WEBID_PREDICATE, agentWebId); // temporarily storing this here to have a webId to display for these temporary rows
    }
  } catch (error) {
    newThing = addUrl(thing, VCARD_WEBID_PREDICATE, agentWebId); // temporarily storing this here to have a webId to display for these temporary rows
  }
  return newThing;
};

export default function AddAgentRow({
  index,
  setNewAgentsWebIds,
  newAgentsWebIds,
  contactsArrayLength,
  setAddingWebId,
  addingWebId,
  updateTemporaryRowThing,
  permissions,
}) {
  const { fetch } = useSession();
  const { thing: temporaryRowThing } = useThing();
  const classes = useStyles();
  const [agentWebId, setAgentWebId] = useState("");
  const [existingPermission, setExistingPermission] = useState();
  const [agentName, setAgentName] = useState(null);
  const [agentAvatar, setAgentAvatar] = useState(null);
  const [displayedWebId, setDisplayedWebId] = useState(null);
  const { data: profile } = useContactProfileOld(temporaryRowThing);
  useEffect(() => {
    if (profile) {
      setAgentName(profile.name);
      setAgentAvatar(profile.avatar);
      setDisplayedWebId(profile.webId);
    } else if (temporaryRowThing && !profile && contactsArrayLength > 0) {
      setAgentName(
        getStringNoLocale(temporaryRowThing, foaf.name) ||
          getStringNoLocale(temporaryRowThing, vcard.fn) ||
          null
      );
      setAgentAvatar(getUrl(temporaryRowThing, vcard.hasPhoto) || null);
      setDisplayedWebId(getUrl(temporaryRowThing, VCARD_WEBID_PREDICATE));
    }
  }, [profile, temporaryRowThing, agentWebId, contactsArrayLength]);

  const handleAddAgentsWebIds = async (e) => {
    e.preventDefault();
    const existingWebId = permissions.filter((p) => p.webId === agentWebId);
    if (existingWebId.length) {
      setExistingPermission(true);
      return;
    }
    setNewAgentsWebIds([...newAgentsWebIds, agentWebId]);
    const newThing = await updateThingForNewRow(
      agentWebId,
      temporaryRowThing,
      fetch
    );
    updateTemporaryRowThing(newThing);
    setAddingWebId(false);
  };

  if (index === 0 && addingWebId) {
    return (
      <div className={classes.agentPickerFormContainer}>
        <form className={classes.addAgentForm} onSubmit={handleAddAgentsWebIds}>
          <div className={classes.searchBoxContainer}>
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
              classes={{ root: classes.searchInput }}
              type="url"
              inputProps={{ "data-testid": TESTCAFE_ID_WEBID_INPUT }}
              // the duplicate props is known issue for Material UI: https://github.com/mui-org/material-ui/issues/11377
              // eslint-disable-next-line react/jsx-no-duplicate-props
              InputProps={{
                pattern: "https://.+",
                title: "Must start with https://",
                className: classes.searchInput,
                disableUnderline: true,
              }}
              required
            />
          </div>
          <Button
            data-testid={TESTCAFE_ID_ADD_WEBID_BUTTON}
            className={classes.button}
            type="submit"
            variant="with-input"
          >
            Add
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Tooltip title={agentName ? displayedWebId : "Unable to load profile"}>
      <div className={classes.nameAndAvatarContainer}>
        <Avatar
          className={classes.avatar}
          alt={displayedWebId}
          src={agentAvatar || null}
        />
        <Typography
          classes={{ body1: classes.detailText }}
          data-testid={TESTCAFE_ID_AGENT_WEB_ID}
          className={classes.detailText}
        >
          {agentName || displayedWebId}
        </Typography>
      </div>
    </Tooltip>
  );
}

AddAgentRow.propTypes = {
  index: PropTypes.number.isRequired,
  setNewAgentsWebIds: PropTypes.func.isRequired,
  newAgentsWebIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setAddingWebId: PropTypes.func.isRequired,
  contactsArrayLength: PropTypes.number.isRequired,
  addingWebId: PropTypes.bool.isRequired,
  updateTemporaryRowThing: PropTypes.func.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};
