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

// material-ui is broken and doesn't allow `ListItem` to accept `component`

import React from "react";
import {
  Divider,
  createStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import T from "prop-types";
import Skeleton from "@material-ui/lab/Skeleton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ActionMenu, ActionMenuItem } from "@inrupt/prism-react-components";
import styles from "./styles";
import DownloadLink from "../../downloadLink";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function DetailsLoading({ name, iri, onDelete, onDeleteError }) {
  const classes = useStyles();

  return (
    <>
      <section className={classes.centeredSection}>
        <h3 className={classes["content-h3"]} title={iri || ""}>
          {name || <Skeleton width={100} />}
        </h3>
      </section>

      <Divider />

      <Accordion disabled>
        <AccordionSummary>Actions</AccordionSummary>
      </Accordion>

      <Accordion disabled>
        <AccordionSummary>Details</AccordionSummary>
      </Accordion>

      <Accordion disabled>
        <AccordionSummary>Permissions</AccordionSummary>
      </Accordion>
    </>
  );
}

DetailsLoading.propTypes = {
  iri: T.string,
  name: T.string,
  onDelete: T.func,
  onDeleteError: T.func,
};

DetailsLoading.defaultProps = {
  iri: null,
  name: null,
  onDelete: () => {},
  onDeleteError: () => {},
};

export default DetailsLoading;
