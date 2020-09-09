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

// @ts-nocheck
// react-table is super broken with sorting, so temporarily disable ts checking.
/* eslint react/jsx-one-expression-per-line: 0 */

import React, { ReactElement, useMemo } from "react";
import { useTable, useSortBy, UseSortByOptions } from "react-table";
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";

import ContainerTableRow, { renderResourceType } from "../containerTableRow";
import SortedTableCarat from "../sortedTableCarat";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import { useFetchContainerResourceIris } from "../../src/hooks/solidClient";
import {
  IResourceDetails,
  getResourceName,
} from "../../src/solidClientHelpers";

import Spinner from "../spinner";
import styles from "./styles";
import Breadcrumbs from "../breadcrumbs";
import PageHeader from "../containerPageHeader";
import ContainerDetails from "../containerDetails";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface IPodList {
  iri: string;
}

export default function Container({ iri }: IPodList): ReactElement {
  useRedirectIfLoggedOut();
  const encodedIri = encodeURI(iri);

  const { data: resourceIris, mutate } = useFetchContainerResourceIris(
    encodedIri
  );
  const loading = typeof resourceIris === "undefined";

  const bem = useBem(useStyles());

  const columns = useMemo(
    () => [
      {
        header: "Icon",
        accessor: "icon",
        disableSortBy: true,
        modifiers: ["align-center", "width-preview"],
      },
      {
        Header: "File",
        accessor: "filename",
      },
      {
        Header: "Type",
        accessor: "type",
      },
    ],
    []
  );

  const data = useMemo(() => {
    if (!resourceIris) {
      return [];
    }

    return resourceIris.map((rIri) => ({
      iri: rIri,
      name: getResourceName(rIri),
      filename: getResourceName(rIri)?.toLowerCase(),
      type: renderResourceType(rIri),
    }));
  }, [resourceIris]);

  // TODO fix typescript errors below.
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<UseSortByOptions<IResourceDetails>>(
    {
      columns,
      data,
      defaultCanSort: true,
    },
    useSortBy
  );

  if (loading) {
    return <Spinner />;
  }

  // react-table works through spreads.
  /* eslint react/jsx-props-no-spreading: 0 */
  return (
    <>
      <PageHeader mutate={mutate} resourceList={data} />
      <div className={clsx(bem("container"), bem("container-breadcrumbs"))}>
        <Breadcrumbs />
      </div>
      <ContainerDetails mutate={mutate}>
        <table className={clsx(bem("table"))} {...getTableProps()}>
          <thead className={bem("table__header")}>
            {headerGroups.map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={bem("table__header-row")}
                {...headerGroup.getHeaderGroupProps()}
              >
                {headerGroup.headers.map((column) => (
                  <td
                    key={column.id}
                    className={bem(
                      "table__header-cell",
                      ...(column.modifiers || [])
                    )}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                    {` `}
                    <SortedTableCarat
                      sorted={column.isSorted}
                      sortedDesc={column.isSortedDesc}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={bem("table__body")} {...getTableBodyProps()}>
            {!data || !data.length ? (
              <tr key="no-resources-found" className={bem("table__body-row")}>
                <td rowSpan={3} className={bem("table__body-cell")}>
                  No resources were found within this container.
                </td>
              </tr>
            ) : null}

            {rows.map((row) => {
              prepareRow(row);
              const details = row.original as IResourceDetails;
              return <ContainerTableRow key={details.iri} resource={details} />;
            })}
          </tbody>
        </table>
      </ContainerDetails>
    </>
  );
}
