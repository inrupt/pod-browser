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

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-one-expression-per-line */

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useFilters, useGlobalFilter, useTable } from "react-table";
import { useBem } from "@solid/lit-prism-patterns";
import { Container } from "@inrupt/prism-react-components";
import clsx from "clsx";
import {
  Accordion,
  CircularProgress,
  createStyles,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";
import AgentAccess from "../agentAccess";
import AddAgentButton from "../addAgentButton";
import AgentsTableTabs from "../agentsTableTabs";
import AgentsSearchBar from "../agentsSearchBar";
import { POLICIES_TYPE_MAP } from "../../../../constants/policies";

import styles from "./styles";
import PolicyHeader from "../policyHeader";
import PolicyActionButton from "../policyActionButton";
import { isCustomPolicy } from "../../../../src/models/policy";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_SHOW_ALL_BUTTON = "show-all-button";
const TESTCAFE_ID_HIDE_BUTTON = "hide-button";
export const TESTCAFE_ID_AGENT_ACCESS_TABLE = "agent-access-table";

export default function AgentAccessTable({ type }) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const { data: policyPermissions } = usePolicyPermissions(type);

  useEffect(() => {
    if (!policyPermissions) return;
    setPermissions(policyPermissions);
  }, [policyPermissions]);

  const bem = useBem(useStyles());

  const classes = useStyles();

  const [showAll, setShowAll] = useState(false);
  const [selectedTabValue, setSelectedTabValue] = useState("");

  const columns = useMemo(
    () => [
      {
        header: "",
        accessor: "name",
        modifiers: ["align-center", "width-preview"],
      },
      {
        header: "",
        accessor: "webId",
        modifiers: ["align-center", "width-preview"],
      },
      {
        header: "",
        accessor: "type",
        modifiers: ["align-center", "width-preview"],
      },
    ],
    []
  );

  const data = useMemo(() => {
    if (!permissions) {
      return [];
    }

    return showAll ? permissions : permissions.slice(0, 3);
  }, [permissions, showAll]);

  const {
    getTableProps,
    getTableBodyProps,
    rows,
    prepareRow,
    setFilter,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [{ id: "name", desc: false }],
      },
    },
    useFilters,
    useGlobalFilter
  );

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setGlobalFilter(value || undefined);
  };

  const handleTabChange = (e, newValue) => {
    setSelectedTabValue(newValue);
    // TODO: this will change when Groups are available since we will not have profiles for Groups
    setFilter("type", newValue);
  };

  if (!permissions.length && isCustomPolicy(type)) return null;

  const { emptyStateText } = POLICIES_TYPE_MAP[type];

  return (
    <Accordion
      defaultExpanded
      classes={{ root: classes.accordion, rounded: classes.rounded }}
      data-testid={TESTCAFE_ID_AGENT_ACCESS_TABLE}
    >
      <PolicyHeader type={type} isPolicyList>
        <>
          <AddAgentButton
            type={type}
            setLoading={setLoading}
            permissions={permissions}
          />
          <PolicyActionButton
            permissions={permissions}
            setLoading={setLoading}
            type={type}
          />
        </>
      </PolicyHeader>
      <div className={classes.permissionsContainer}>
        {!!permissions.length && (
          <>
            {/* TODO: Uncomment to reintroduce tabs */}
            {/* <AgentsTableTabs */}
            {/*  handleTabChange={handleTabChange} */}
            {/*  selectedTabValue={selectedTabValue} */}
            {/*  tabsValues={{ all: "", people: "agent", groups: "group" }} */}
            {/* /> */}
            <AgentsSearchBar handleFilterChange={handleFilterChange} />
          </>
        )}
        {loading && (
          <Container variant="empty">
            <CircularProgress />
          </Container>
        )}
        {!loading && permissions.length ? (
          <table
            className={clsx(bem("table"), bem("agents-table"))}
            {...getTableProps()}
          >
            <tbody className={bem("table__body")} {...getTableBodyProps()}>
              {rows.length ? (
                rows.map((row) => {
                  prepareRow(row);
                  const details = row.original;
                  return (
                    <tr className={bem("table__body-row")} key={details.webId}>
                      <td
                        className={clsx(
                          bem("table__body-cell"),
                          bem("agent-cell")
                        )}
                      >
                        <AgentAccess permission={details} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className={classes.emptyStateTextContainer}>
                  <td>
                    {selectedTabValue &&
                      `No ${
                        selectedTabValue === "Person" ? "people " : "groups "
                      } found`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <span className={classes.emptyStateTextContainer}>
            {!loading && <p>{emptyStateText}</p>}
          </span>
        )}
        {!loading && permissions.length > 3 && (
          <div
            className={clsx(
              classes.showAllButtonContainer,
              showAll && bem("expanded")
            )}
          >
            <button
              data-testid={
                showAll ? TESTCAFE_ID_HIDE_BUTTON : TESTCAFE_ID_SHOW_ALL_BUTTON
              }
              type="button"
              className={classes.showAllButton}
              onClick={() => setShowAll(!showAll)}
            >
              <Typography classes={{ body1: classes.showAllText }}>
                {showAll ? (
                  <span>
                    Hide{" "}
                    <i
                      className={clsx(
                        bem("icon-caret-up"),
                        classes.showAllButtonIcon
                      )}
                    />
                  </span>
                ) : (
                  <span>
                    Show all ({permissions.length}){" "}
                    <i
                      className={clsx(
                        bem("icon-caret-down"),
                        classes.showAllButtonIcon
                      )}
                    />
                  </span>
                )}
              </Typography>
            </button>
          </div>
        )}
      </div>
    </Accordion>
  );
}

AgentAccessTable.propTypes = {
  type: PropTypes.string.isRequired,
};
