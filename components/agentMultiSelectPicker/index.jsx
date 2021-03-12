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

import React, { useEffect, useMemo, useRef, useState } from "react";
import T from "prop-types";
import { Container } from "@inrupt/prism-react-components";
import { CircularProgress, createStyles } from "@material-ui/core";
import { Table, TableColumn, useSession } from "@inrupt/solid-ui-react";
import clsx from "clsx";
import { rdf, vcard } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  addUrl,
  createThing,
  getSolidDataset,
  getThing,
  removeUrl,
} from "@inrupt/solid-client";
import AgentsTableTabs from "../resourceDetails/resourceSharing/agentsTableTabs";
import { PERSON_CONTACT } from "../../src/models/contact/person";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import MobileAgentsSearchBar from "../resourceDetails/resourceSharing/mobileAgentsSearchBar";
import AgentsSearchBar from "../resourceDetails/resourceSharing/agentsSearchBar";
import styles from "./styles";
import useAddressBook from "../../src/hooks/useAddressBook";
import { vcardExtras } from "../../src/addressBook";
import MemberCheckbox from "./memberCheckbox";
import MemberRow from "./memberRow";
import { getContactUrl } from "../../src/models/contact";
import { chain } from "../../src/solidClientHelpers/utils";
import { createTempContact, TEMP_CONTACT } from "../../src/models/contact/temp";
import { getBaseUrl } from "../../src/solidClientHelpers/resource";
import {
  createUnregisteredContact,
  UNREGISTERED_CONTACT,
} from "../../src/models/contact/unregistered";
import AddWebIdButton from "../resourceDetails/resourceSharing/agentPickerModal/addWebIdButton";
import AgentPickerEmptyState from "../resourceDetails/resourceSharing/agentPickerEmptyState";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = vcardExtras("WebId");

export default function AgentMultiSelectPicker({
  contacts,
  onChange,
  selected,
  disabled,
  checkboxHeadLabel,
}) {
  const { fetch } = useSession();
  // const { data: addressBook } = useAddressBook();
  const bem = useBem(useStyles());
  const [selectedTabValue, setSelectedTabValue] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [contactsToShow, setContactsToShow] = useState(contacts);
  const [selectedFake, setSelectedFake] = useState([]);

  const initialSelected = selected.reduce(
    (memo, url) => Object.assign(memo, { [url]: null }),
    {}
  );
  const selectedContacts = useRef(initialSelected);
  // selectedContacts.current = initialSelected;
  // selectedContacts.current = selected.reduce(
  //   (memo, url) => Object.assign(memo, { [url]: null }),
  //   {}
  // );
  const unselectedContacts = useRef({});
  // unselectedContacts.current = {};
  // unselectedContacts.current = {};
  // useEffect(() => {
  //   console.log("TEST", selected);
  //   selectedContacts.current = selected.reduce(
  //     (memo, url) => Object.assign(memo, { [url]: null }),
  //     {}
  //   );
  //   unselectedContacts.current = {};
  // }, [selected]);
  // const [selectedContacts, setSelectedContacts] = useState(initialSelected);
  // const [unselectedContacts, setUnselectedContacts] = useState({});

  useEffect(() => {
    if (selectedTabValue) {
      const filtered = contacts.filter(({ thing }) =>
        selectedTabValue.isOfType(thing)
      );
      setContactsToShow(filtered);
      return;
    }
    setContactsToShow(contacts);
  }, [contacts, selectedTabValue]);

  const getFinalChangeMap = (changeMap, shouldInclude) => {
    const entries = Object.entries(changeMap);
    return entries.length
      ? entries.reduce((memo, [key, value]) => {
          if (selected.includes(key) === shouldInclude) {
            return Object.assign(memo, { [key]: value });
          }
          return memo;
        }, {})
      : {};
  };

  const getChangedSelection = (model, checked) => {
    const originalUrl = model.type.getOriginalUrl(model);
    if (checked) {
      const selectedChange = {
        [originalUrl]: model,
        ...selectedContacts.current,
        // ...selectedContacts,
      };
      const {
        [originalUrl]: urlToRemove,
        ...unselectedChange
      } = unselectedContacts.current;
      // const {
      //   [originalUrl]: urlToRemove,
      //   ...unselectedChange
      // } = unselectedContacts;
      return [selectedChange, unselectedChange, selectedFake];
    }
    const unselectedChange = {
      [originalUrl]: model,
      ...unselectedContacts.current,
      // ...unselectedContacts,
    };
    // const { [originalUrl]: urlToRemove, ...selectedChange } = selectedContacts;
    const {
      [originalUrl]: urlToRemove,
      ...selectedChange
    } = selectedContacts.current;
    if (selectedFake.includes(originalUrl)) {
      const index = selectedFake.indexOf(originalUrl);
      const newSelectedFake = selectedFake
        .slice(0, index)
        .concat(selectedFake.slice(index + 1));
      return [selectedChange, unselectedChange, newSelectedFake];
    }
    return [selectedChange, unselectedChange, selectedFake];
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    setGlobalFilter(event.target.value || undefined);
  };

  const handleAddRow = () => {
    if (
      contactsToShow[0] &&
      UNREGISTERED_CONTACT.isOfType(contactsToShow[0].thing)
    ) {
      return;
    }
    const newItem = createUnregisteredContact();
    setContactsToShow([newItem, ...contactsToShow]);
  };

  const contactsForTable = selectedTabValue ? contactsToShow : contacts;

  const toggleCheckbox = (event, model) => {
    const [
      selectedChange,
      unselectedChange,
      selectionFakeChange,
    ] = getChangedSelection(model, event.target.checked);
    selectedContacts.current = selectedChange;
    unselectedContacts.current = unselectedChange;
    // setSelectedContacts(selectedChange);
    // setUnselectedContacts(unselectedChange);
    onChange(
      getFinalChangeMap(selectedChange, false),
      getFinalChangeMap(unselectedChange, true)
    );
    setSelectedFake(selectionFakeChange);
  };

  const handleNewAgentSubmit = async (agentUrl) => {
    const agentDatasetUrl = getBaseUrl(agentUrl);
    const agentDataset = await getSolidDataset(agentDatasetUrl, { fetch });
    const agentThing = getThing(agentDataset, agentUrl);
    const tempAgent = createTempContact(agentThing, agentDataset);
    setContactsToShow([tempAgent, ...contactsToShow.slice(1)]);
    const [selectedChange, unselectedChange] = getChangedSelection(
      tempAgent,
      true
    );
    selectedContacts.current = selectedChange;
    unselectedContacts.current = unselectedChange;
    setSelectedFake(selectedFake.concat(agentUrl));
    // setSelectedContacts(selectedChange);
    // setUnselectedContacts(unselectedChange);
    onChange(
      getFinalChangeMap(selectedChange, false),
      getFinalChangeMap(unselectedChange, true)
    );
  };

  // console.log("contactsToShow", contactsToShow);
  // console.log("contactsToShow", selectedContacts.current);

  return (
    <div className={bem("agent-multi-select-picker")}>
      <div
        className={bem("agent-multi-select-picker__tabs-and-button-container")}
      >
        <AgentsTableTabs
          handleTabChange={handleTabChange}
          selectedTabValue={selectedTabValue}
          className={bem("agent-multi-select-picker__tabs")}
          tabsValues={{
            all: "",
            people: PERSON_CONTACT,
            groups: GROUP_CONTACT,
          }}
        />
        <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
        <AddWebIdButton
          onClick={handleAddRow}
          className={bem("agent-multi-select-picker__desktop-only")}
        />
      </div>
      <AgentsSearchBar handleFilterChange={handleFilterChange} />

      <AddWebIdButton
        onClick={handleAddRow}
        className={bem("agent-multi-select-picker__mobile-only")}
      />
      {!contactsToShow && (
        <Container variant="empty">
          <CircularProgress />
        </Container>
      )}
      {!!contactsToShow && contactsToShow?.length > 0 && (
        <Table
          things={contactsToShow}
          className={clsx(
            bem("table"),
            bem("agent-multi-select-picker__agent-table")
          )}
          filter={globalFilter}
        >
          <TableColumn
            property={VCARD_WEBID_PREDICATE}
            dataType="url"
            header={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <span className={bem("agent-multi-select-picker__table-header")}>
                {checkboxHeadLabel}
              </span>
            }
            body={() => (
              <MemberCheckbox
                selected={selectedContacts.current}
                // selected={selectedContacts}
                // selectedFake={selectedFake}
                disabled={disabled}
                onChange={toggleCheckbox}
                // isChecked={(originalUrl) => {
                //   return (
                //     originalUrl === undefined ||
                //     selectedContacts[originalUrl] !== undefined
                //   );
                // }}
              />
            )}
          />
          <TableColumn
            header={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <span className={bem("agent-multi-select-picker__table-header")}>
                Name
              </span>
            }
            property={vcard.fn}
            filterable
            body={() => <MemberRow onNewAgentSubmit={handleNewAgentSubmit} />}
          />
        </Table>
      )}
      {!!contacts &&
        contactsForTable.length === 0 &&
        (selectedTabValue.searchNoResult ? (
          <span className={bem("agent-multi-select-picker__empty")}>
            <p>{selectedTabValue.searchNoResult}</p>
          </span>
        ) : (
          <AgentPickerEmptyState onClick={handleAddRow} />
        ))}
    </div>
  );
}

AgentMultiSelectPicker.propTypes = {
  contacts: T.arrayOf(T.object),
  disabled: T.arrayOf(T.string),
  onChange: T.func.isRequired,
  selected: T.arrayOf(T.string).isRequired,
  checkboxHeadLabel: T.string,
};

AgentMultiSelectPicker.defaultProps = {
  contacts: [],
  disabled: [],
  checkboxHeadLabel: "Select",
};
