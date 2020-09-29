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

import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { createStyles, TextField } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Container,
  PageHeader,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import { Table, TableColumn } from "@inrupt/solid-ui-react";
import { getThingAll } from "@inrupt/solid-client";
import { dct } from "rdf-namespaces";
import BookmarksContext from "../../src/contexts/bookmarksContext";
import Bookmark from "../bookmark";
import ResourceLink from "../resourceLink";
import SortedTableCarat from "../sortedTableCarat";
import Spinner from "../spinner";
import styles from "./styles";
import { RECALLS_PROPERTY_IRI } from "../../src/solidClientHelpers/bookmarks";
import useFindResourceOwner from "../../src/hooks/useFindResourceOwner";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function OwnerDisplayName({ iri }) {
  const { ownerName } = useFindResourceOwner(iri);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (typeof ownerName === "undefined") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [ownerName, setLoading]);

  if (loading) {
    return <Skeleton width={150} />;
  }
  return <span>{ownerName}</span>;
}

const bookmarkBody = ({ value }) => {
  return <Bookmark iri={value} />;
};

const titleBody = ({ row, value, className }) => {
  const bookmarkedResourceIri = row.original.col0;
  return (
    <ResourceLink
      containerIri={bookmarkedResourceIri}
      resourceIri={bookmarkedResourceIri}
      className={className}
    >
      {value}
    </ResourceLink>
  );
};

const ownerBody = ({ value }) => {
  if (!value) {
    return null;
  }
  return <OwnerDisplayName iri={value} />;
};

function BookmarksList() {
  const { bookmarks } = useContext(BookmarksContext);
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);
  const tableLinkClassName = bem("table__link");
  const [search, setSearch] = useState();

  const isLoading = !bookmarks;

  if (isLoading) return <Spinner />;
  const { dataset } = bookmarks;
  const bookmarksList = getThingAll(dataset).map((b) => {
    return {
      thing: b,
      dataset,
    };
  });

  const ascIndicator = (
    <>
      {` `}
      <SortedTableCarat sorted />
    </>
  );
  const descIndicator = (
    <>
      {" "}
      <SortedTableCarat sorted sortedDesc />
    </>
  );

  return (
    <>
      <PageHeader title="Bookmarks">
        <TextField
          classes={{
            root: classes.search,
          }}
          InputProps={{
            className: classes.searchInput,
          }}
          margin="dense"
          variant="outlined"
          onChange={(e) => setSearch(e.target.value)}
        />
      </PageHeader>
      <Container>
        <Table
          things={bookmarksList}
          className={clsx(tableClass, bem("table"))}
          filter={search}
          ascIndicator={ascIndicator}
          descIndicator={descIndicator}
        >
          <TableColumn
            property={RECALLS_PROPERTY_IRI}
            dataType="url"
            header=""
            body={bookmarkBody}
          />
          <TableColumn
            property={dct.title}
            header="Name"
            className={tableLinkClassName}
            // eslint-disable-next-line prettier/prettier
            body={({ row, value }) => titleBody({ row, value, className: tableLinkClassName })}
            sortable
            filterable
            ascIndicator={ascIndicator}
            descIndicator={descIndicator}
          />
          <TableColumn
            property={RECALLS_PROPERTY_IRI}
            dataType="url"
            header="Owner"
            body={ownerBody}
          />
        </Table>
      </Container>
    </>
  );
}

OwnerDisplayName.propTypes = {
  iri: PropTypes.string.isRequired,
};

BookmarksList.propTypes = {};

BookmarksList.defaultProps = {};

export default BookmarksList;
