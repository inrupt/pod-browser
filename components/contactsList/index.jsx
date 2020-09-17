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

import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { Avatar } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Container, PageHeader } from "@inrupt/prism-react-components";
import Spinner from "../spinner";
import styles from "./styles";

import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import useAddressBook from "../../src/hooks/useAddressBook";
import usePeople from "../../src/hooks/usePeople";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function ContactsList() {
  useRedirectIfLoggedOut();

  const classes = useStyles();
  const bem = useBem(classes);
  const actionClass = PageHeader.actionClassName();

  const [addressBook, addressBookError] = useAddressBook();
  const [people, peopleError] = usePeople(addressBook);

  if (!addressBook || !people) return <Spinner />;
  if (addressBookError) return addressBookError;
  if (peopleError) return peopleError;

  return (
    <>
      <PageHeader
        title="Contacts"
        actions={[
          <Link href="/contacts/add">
            <a className={actionClass}>Add new contact</a>
          </Link>,
        ]}
      />
      <Container>
        <table className={bem("table")}>
          <tbody className={bem("table__body")}>
            {people.map(({ name, avatar, webId }) => (
              <tr className={bem("table__body-row")} key={webId}>
                <td
                  className={clsx(
                    bem("table__body-cell"),
                    bem("table__body-cell--align-end"),
                    bem("table__body-cell--width-preview")
                  )}
                >
                  <Avatar className={bem("avatar")} alt={name} src={avatar} />
                </td>
                <td>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </>
  );
}

ContactsList.propTypes = {};

ContactsList.defaultProps = {};

export default ContactsList;
