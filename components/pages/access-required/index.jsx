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

/* eslint react/jsx-one-expression-per-line: 0 */

import React, { useEffect, useState } from "react";
import { Container, Content, PageHeader } from "@inrupt/prism-react-components";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import { useRedirectIfLoggedOut } from "../../../src/effects/auth";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AccessRequired() {
  useRedirectIfLoggedOut();

  const bem = useBem(useStyles());
  const [appUrl, setAppUrl] = useState("http://podbrowser.inrupt.com/");
  useEffect(() => setAppUrl(window.location.origin), []);
  return (
    <div>
      <PageHeader title="No access to resource" />
      <Container>
        <Content>
          <h1 className={bem("title")}>
            You don’t have access to this resource
          </h1>
          <p>
            <strong>To manage your Trusted Applications:</strong>
          </p>
          <ol>
            <li>Log into your Pod.</li>
            <li>
              Display your{" "}
              <a href="https://github.com/solid/userguide/blob/master/README.md#preferences">
                Preferences
              </a>
              .
            </li>
            <li>
              In the Manage your trusted applications table, against the URL of
              PodBrowser (<strong>{appUrl}</strong>):
              <ol>
                <li>Select Read, Write, Append, and Control Access Modes.</li>
                <li>Click &quot;Update&quot; under Actions.</li>
              </ol>
            </li>
          </ol>
          <p>You should now be able to access your Pod using the PodBrowser.</p>
        </Content>
      </Container>
    </div>
  );
}
