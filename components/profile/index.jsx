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

import React, { useState } from "react";
import T from "prop-types";
import { vcard } from "rdf-namespaces";
import Link from "next/link";
import {
  Avatar,
  Box,
  Paper,
  InputLabel,
  createStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Container, BackToNavLink } from "@inrupt/prism-react-components";

import { CombinedDataProvider, Text, Image } from "@inrupt/solid-ui-react";

import ContactInfoTable from "./contactInfoTable";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function Profile(props) {
  const { profileIri, editing } = props;
  const [error, setError] = useState(null);

  const classes = useStyles();
  const bem = useBem(classes);

  // TODO replace with toast error or something?
  if (error) {
    return error.toString();
  }

  return (
    <Container>
      <Box mt={2} mb={2}>
        <Link href="/contacts" passHref>
          <BackToNavLink>contacts</BackToNavLink>
        </Link>
      </Box>

      <Paper style={{ maxWidth: "800px" }}>
        <Box p={2}>
          <CombinedDataProvider
            datasetUrl={profileIri}
            thingUrl={profileIri}
            onError={setError}
          >
            <Box alignItems="center" display="flex">
              <Box>
                <Avatar className={classes.avatar}>
                  <Image
                    property={vcard.hasPhoto}
                    width={120}
                    errorComponent={() => (
                      <Avatar
                        className={bem("avatar")}
                        alt="Contact photo placeholder"
                      />
                    )}
                  />
                </Avatar>
              </Box>

              <Box p={2}>
                <h3>
                  <Text property={vcard.fn} />
                </h3>
              </Box>
            </Box>

            <hr />

            <Box mt={2}>
              <Box>
                <InputLabel>Name</InputLabel>
                <Text
                  property={vcard.fn}
                  edit={editing}
                  autosave
                  inputProps={{ className: bem("input") }}
                />
              </Box>

              <Box mt={1}>
                <InputLabel>Role</InputLabel>
                <Text
                  property={vcard.role}
                  edit={editing}
                  inputProps={{ className: bem("input") }}
                  autosave
                />
              </Box>

              <Box mt={1}>
                <InputLabel>Company</InputLabel>
                <Text
                  property={vcard.org}
                  edit={editing}
                  inputProps={{ className: bem("input") }}
                  autosave
                />
              </Box>
            </Box>

            <Box mt={4}>
              <InputLabel>Email Addresses</InputLabel>
              <ContactInfoTable property={vcard.hasEmail} editing={editing} />
            </Box>

            <Box mt={4}>
              <InputLabel>Phone Numbers</InputLabel>
              <ContactInfoTable
                property={vcard.hasTelephone}
                editing={editing}
              />
            </Box>
          </CombinedDataProvider>
        </Box>
      </Paper>
    </Container>
  );
}

Profile.propTypes = {
  profileIri: T.string.isRequired,
  editing: T.bool,
};

Profile.defaultProps = {
  editing: false,
};
