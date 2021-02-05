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

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useFilters, useGlobalFilter, useTable } from "react-table";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import {
  Accordion,
  createStyles,
  IconButton,
  InputBase,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import AgentAccess from "../agentAccess";
import AddAgentButton from "../addAgentButton";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_SHOW_ALL_BUTTON = "show-all-button";
const TESTCAFE_ID_HIDE_BUTTON = "hide-button";
const TESTCAFE_ID_SEARCH_INPUT = "search-input";
const TESTCAFE_ID_TAB_ALL = "tab-all";
const TESTCAFE_ID_TAB_PEOPLE = "tab-people";
const TESTCAFE_ID_TAB_GROUPS = "tab-groups";

export default function AgentAccessTable({ permissions, type }) {
  const editorsDescription = (
    <p>
      <b>Can </b>
      view, edit and delete this resource
    </p>
  );

  const viewersDescription = (
    <p>
      <b>Can </b>
      view but
      <b> cannot </b>
      edit or delete this resource
    </p>
  );

  const blockedDescription = (
    <p>
      <b>Cannot </b>
      view this resource
    </p>
  );

  const PERMISSIONS_TYPE_MAP = {
    editors: {
      icon: "icon-editor",
      iconClassName: "iconEditor",
      title: "Editors",
      emptyStateText: "No editors",
      description: editorsDescription,
    },
    viewers: {
      icon: "icon-view",
      iconClassName: "iconViewer",
      title: "Viewers",
      emptyStateText: "No viewers",
      description: viewersDescription,
    },
    blocked: {
      icon: "icon-block",
      iconClassName: "iconBlocked",
      title: "Blocked",
      emptyStateText: "No one is blocked",
      description: blockedDescription,
    },
  };

  const bem = useBem(useStyles());

  const classes = useStyles();

  const [showAll, setShowAll] = useState(false);
  const [selectedTabValue, setSelectedTabValue] = useState("");

  const {
    title,
    emptyStateText,
    icon,
    iconClassName,
    description,
  } = PERMISSIONS_TYPE_MAP[type];

  const columns = useMemo(
    () => [
      {
        header: "",
        accessor: "profile.name",
        disableSortBy: true,
        modifiers: ["align-center", "width-preview"],
      },
      {
        header: "",
        accessor: "webId",
        disableSortBy: true,
        modifiers: ["align-center", "width-preview"],
      },
      {
        header: "",
        accessor: "profile.types",
        disableSortBy: true,
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
      defaultCanSort: true,
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
    // TODO: this filter will change once we have groups
    setFilter("profile.types", newValue);
  };

  const tabs = [
    {
      label: "All",
      testid: TESTCAFE_ID_TAB_ALL,
      value: "",
    },
    {
      label: "People",
      testid: TESTCAFE_ID_TAB_PEOPLE,
      value: "Person",
    },
    {
      label: "Groups",
      testid: TESTCAFE_ID_TAB_GROUPS,
      value: "Group",
    },
  ];

  return (
    <Accordion
      defaultExpanded
      classes={{ root: classes.accordion, rounded: classes.rounded }}
    >
      <div className={classes.headerContainer}>
        <i className={clsx(bem(icon), bem("icon"), bem(iconClassName))} />
        <div className={classes.textContainer}>
          <div className={classes.titleAndButtonContainer}>
            <p className={classes.title}>{title}</p>
            <AddAgentButton type={type} />
          </div>
          <span className={classes.description}>{description}</span>
        </div>
      </div>
      <div className={classes.permissionsContainer}>
        {!!permissions.length && (
          <>
            <div className={classes.tabsContainer}>
              <Tabs
                classes={{ indicator: classes.indicator }}
                value={selectedTabValue}
                onChange={handleTabChange}
                aria-label="Permissions Filter tabs"
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.label}
                    classes={{
                      root: classes.tab,
                      selected: classes.selected,
                    }}
                    label={tab.label}
                    data-testid={tab.testid}
                    value={tab.value}
                  />
                ))}
              </Tabs>
            </div>
            <div className={classes.searchBoxContainer}>
              <IconButton type="submit" aria-label="search">
                <i
                  className={clsx(
                    bem("icon-search"),
                    bem("icon"),
                    classes.iconSearch
                  )}
                  aria-label="search"
                  alt="search icon"
                />
              </IconButton>
              <InputBase
                classes={{ root: classes.searchInput }}
                placeholder="Search by name or WebId"
                inputProps={{
                  "aria-label": "Search by name or WebId",
                  onChange: handleFilterChange,
                  "data-testid": TESTCAFE_ID_SEARCH_INPUT,
                }}
              />
            </div>
          </>
        )}
        {permissions.length ? (
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
                <span className={classes.emptyStateTextContainer}>
                  <p>
                    {selectedTabValue === ""
                      ? emptyStateText
                      : `No ${
                          selectedTabValue === "Person" ? "people " : "groups "
                        } found`}
                  </p>
                </span>
              )}
            </tbody>
          </table>
        ) : (
          <span className={classes.emptyStateTextContainer}>
            <p>{emptyStateText}</p>
          </span>
        )}
        {permissions.length > 3 && (
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
  permissions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  type: PropTypes.string.isRequired,
};