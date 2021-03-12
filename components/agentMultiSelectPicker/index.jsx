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
} from "@inrupt/solid-client";
import AgentsTableTabs from "../resourceDetails/resourceSharing/agentsTableTabs";
import { PERSON_CONTACT } from "../../src/models/contact/person";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import MobileAgentsSearchBar from "../resourceDetails/resourceSharing/mobileAgentsSearchBar";
import AddWebIdButton from "../resourceDetails/resourceSharing/addAgentButton/agentPickerModal/addWebIdButton";
import AgentsSearchBar from "../resourceDetails/resourceSharing/agentsSearchBar";
import AgentPickerEmptyState from "../resourceDetails/resourceSharing/addAgentButton/agentPickerEmptyState";
import styles from "./styles";
import useAddressBook from "../../src/hooks/useAddressBook";
import { vcardExtras } from "../../src/addressBook";
import MemberCheckbox from "./memberCheckbox";
import MemberRow from "./memberRow";
import { getContactUrl } from "../../src/models/contact";
import { chain } from "../../src/solidClientHelpers/utils";
import { TEMP_CONTACT } from "../../src/models/contact/temp";
import { getBaseUrl } from "../../src/solidClientHelpers/resource";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = vcardExtras("WebId");

export default function AgentMultiSelectPicker({
  contacts,
  onChange,
  selected,
  disabled,
}) {
  const { fetch } = useSession();
  const { data: addressBook } = useAddressBook();
  const bem = useBem(useStyles());
  const [selectedTabValue, setSelectedTabValue] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [contactsToShow, setContactsToShow] = useState(contacts);
  const [selectedContacts, setSelectedContacts] = useState(
    selected.reduce((memo, url) => Object.assign(memo, { [url]: null }), {})
  );
  const [unselectedContacts, setUnselectedContacts] = useState({});

  // const getSelectedChange = (selectedChange) =>
  //   Object.entries(selectedChange).reduce((memo, [key, value]) => {
  //     if (!selected.includes(key)) {
  //       return Object.assign(memo, { [key]: value });
  //     }
  //     return memo;
  //   }, {});
  // const getUnselectedChange = (unselectedChange) =>
  //   Object.entries(unselectedChange).reduce((memo, [key, value]) => {
  //     if (selected.includes(key)) {
  //       return Object.assign(memo, { [key]: value });
  //     }
  //     return memo;
  //   });
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
  const getChangedMaps = (model, checked) => {
    const originalUrl = model.type.getOriginalUrl(model);
    if (checked) {
      const selectedChange = {
        [originalUrl]: model,
        ...selectedContacts,
      };
      delete unselectedContacts[originalUrl];
      return [selectedChange, unselectedContacts];
    }
    const unselectedChange = {
      [originalUrl]: model,
      ...unselectedContacts,
    };
    delete selectedContacts[originalUrl];
    return [selectedContacts, unselectedChange];
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    setGlobalFilter(event.target.value || undefined);
  };

  const handleAddRow = () => {
    if (contactsToShow[0] && !getContactUrl(contactsToShow[0].thing)) return;
    const newItem = {
      thing: createThing(),
      dataset: addressBook,
    };
    setContactsToShow([newItem, ...contactsToShow]);
  };

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

  useEffect(() => {}, []);

  const contactsForTable = selectedTabValue ? contactsToShow : contacts;

  const toggleCheckbox = (event, model) => {
    const [selectedChange, unselectedChange] = getChangedMaps(
      model,
      event.target.checked
    );
    setSelectedContacts(selectedChange);
    setUnselectedContacts(unselectedChange);
    onChange(
      getFinalChangeMap(selectedChange, false),
      getFinalChangeMap(unselectedChange, true)
    );
    // console.log("toggleCheckbox", memberUrl, checked);
    // if (index === 0 && addingWebId) return null;
    // if (
    //   !webIdsToDelete.includes(value) &&
    //   webIdsInPermissions.includes(value)
    // ) {
    //   setWebIdsToDelete([value, ...webIdsToDelete]);
    // } else if (
    //   webIdsToDelete.includes(value) &&
    //   webIdsInPermissions.includes(value)
    // ) {
    //   setWebIdsToDelete(webIdsToDelete.filter((webId) => webId !== value));
    // }
    // return e.target.checked
    //   ? setNewAgentsWebIds([value, ...newAgentsWebIds])
    //   : setNewAgentsWebIds(newAgentsWebIds.filter((webId) => webId !== value));
  };

  const handleNewAgentSubmit = async (agentUrl) => {
    const agentDatasetUrl = getBaseUrl(agentUrl);
    const agentDataset = await getSolidDataset(agentDatasetUrl, { fetch });
    const agentThing = getThing(agentDataset, agentUrl);
    const tempAgent = {
      thing: chain(agentThing, (t) =>
        addUrl(t, rdf.type, vcardExtras("TempIndividual"))
      ),
      dataset: agentDataset,
      type: TEMP_CONTACT,
    };
    setContactsToShow([tempAgent, ...contactsToShow.slice(1)]);
    const [selectedChange, unselectedChange] = getChangedMaps(tempAgent, true);
    setSelectedContacts(selectedChange);
    setUnselectedContacts(unselectedChange);
    onChange(
      getFinalChangeMap(selectedChange, false),
      getFinalChangeMap(unselectedChange, true)
    );
  };

  return (
    <div className={bem("tableContainer")}>
      <div className={bem("tabsAndAddButtonContainer")}>
        <AgentsTableTabs
          handleTabChange={handleTabChange}
          selectedTabValue={selectedTabValue}
          className={bem("modalTabsContainer")}
          tabsValues={{
            all: "",
            people: PERSON_CONTACT,
            groups: GROUP_CONTACT,
          }}
        />
        <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
        <AddWebIdButton onClick={handleAddRow} className={bem("desktopOnly")} />
      </div>
      <AgentsSearchBar handleFilterChange={handleFilterChange} />

      <AddWebIdButton onClick={handleAddRow} className={bem("mobileOnly")} />
      {!contactsToShow && (
        <Container variant="empty">
          <CircularProgress />
        </Container>
      )}
      {!!contactsToShow && contactsToShow?.length > 0 && (
        <Table
          things={contactsToShow}
          className={clsx(bem("table"), bem("agentPickerTable"))}
          filter={globalFilter}
        >
          <TableColumn
            property={VCARD_WEBID_PREDICATE}
            dataType="url"
            header={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <span className={bem("tableHeader")}>TYPE</span>
            }
            body={() => (
              <MemberCheckbox
                selected={selectedContacts}
                disabled={disabled}
                onChange={toggleCheckbox}
              />
            )}
          />
          <TableColumn
            header={<span className={bem("tableHeader")}>Name</span>}
            property={vcard.fn}
            filterable
            body={() => <MemberRow onNewAgentSubmit={handleNewAgentSubmit} />}
          />
        </Table>
      )}
      {!!contacts &&
        contactsForTable.length === 0 &&
        (selectedTabValue.searchNoResult ? (
          <span className={bem("emptyStateTextContainer")}>
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
};

AgentMultiSelectPicker.defaultProps = {
  contacts: [],
  disabled: [],
};
