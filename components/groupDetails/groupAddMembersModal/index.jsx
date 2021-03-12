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

import React, { useContext, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalButtonsContainer,
  ModalContainer,
  ModalTitle,
} from "@inrupt/prism-react-components";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import AgentMultiSelectPicker from "../../agentMultiSelectPicker";
import useContacts from "../../../src/hooks/useContacts";
import {
  PERSON_CONTACT,
  savePersonWithSchema,
} from "../../../src/models/contact/person";
import { GROUP_CONTACT } from "../../../src/models/contact/group";
import GroupContext from "../../../src/contexts/groupContext";
import Spinner from "../../spinner";
import {
  getGroupMemberUrlAll,
  getGroupUrl,
  updateGroupMembers,
} from "../../../src/models/group";
import { TEMP_CONTACT } from "../../../src/models/contact/temp";
import AddressBookContext from "../../../src/contexts/addressBookContext";
import { getOriginalUrlForContactAll } from "../../../src/models/contact";

export default function GroupAddMembersModal({ open, handleClose }) {
  const { fetch } = useSession();
  const { data: addressBook } = useContext(AddressBookContext);
  const { data: group, mutate: mutateGroup, isValidating } = useContext(
    GroupContext
  );
  const { data: contacts, mutate: mutateContacts } = useContacts(
    [PERSON_CONTACT, GROUP_CONTACT],
    {
      revalidateOnFocus: false,
      errorRetryCount: 0,
    }
  );
  const selectedChanged = useRef();
  selectedChanged.current = {};
  const unselectedChanged = useRef();
  unselectedChanged.current = {};
  // const [selectedChanged, setSelectedChanged] = useState({});
  // const [unselectedChanged, setUnselectedChanged] = useState({});
  const [processing, setProcessing] = useState(false);

  if (isValidating) return <Spinner />;

  const disabled = [getGroupUrl(group)];
  const selected = getGroupMemberUrlAll(group);

  const handleChange = (selectedChange, unselectedChange) => {
    selectedChanged.current = selectedChange;
    unselectedChanged.current = unselectedChange;
  };

  const handleSubmit = async () => {
    setProcessing(true);
    const finalSelected = selectedChanged.current || {};
    const finalUnselected = unselectedChanged.current || {};
    const newContacts = Object.values(finalSelected).filter((model) =>
      TEMP_CONTACT.isOfType(model.thing)
    );
    if (newContacts.length) {
      // handle adding new contact(s)
      const agentOriginalUrlAll = await getOriginalUrlForContactAll(
        addressBook,
        [PERSON_CONTACT],
        fetch
      );
      const actualNewContacts = newContacts.filter(
        (tempAgent) =>
          agentOriginalUrlAll.indexOf(
            tempAgent.type.getOriginalUrl(tempAgent)
          ) === -1
      );
      await Promise.all(
        actualNewContacts.map((tempAgent) => {
          const contactSchema = {
            webId: tempAgent.type.getOriginalUrl(tempAgent),
            fn: tempAgent.type.getName(tempAgent),
          };
          return savePersonWithSchema(addressBook, contactSchema, fetch);
        })
      );
      await mutateContacts();
    }
    // update group members
    const membersToAdd = Object.keys(finalSelected);
    const membersToRemove = Object.keys(finalUnselected);
    const updatedGroup = await updateGroupMembers(
      group,
      membersToAdd,
      membersToRemove,
      fetch
    );
    await mutateGroup(updatedGroup);
    setProcessing(false);
    selectedChanged.current = {};
    unselectedChanged.current = {};
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContainer>
        <ModalTitle>Edit Group</ModalTitle>
        <ModalBody>
          {processing && <Spinner />}
          {!processing && (
            <AgentMultiSelectPicker
              contacts={contacts}
              onChange={handleChange}
              selected={selected}
              disabled={disabled}
            />
          )}
        </ModalBody>
        {!processing && (
          <ModalButtonsContainer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Group</Button>
          </ModalButtonsContainer>
        )}
      </ModalContainer>
    </Modal>
  );
}

GroupAddMembersModal.propTypes = {
  handleClose: T.func.isRequired,
  open: T.bool.isRequired,
};
