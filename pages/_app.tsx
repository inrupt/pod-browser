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

/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import React, { ComponentType, ReactElement, useEffect, useState } from "react";
import * as Sentry from "@sentry/node";

import PropTypes from "prop-types";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";

import {
  createStyles,
  makeStyles,
  StylesProvider,
  ThemeProvider,
} from "@material-ui/styles";

import { create } from "jss";
import preset from "jss-preset-default";

import { StyleRules } from "@material-ui/styles/withStyles";
import { appLayout, useBem } from "@solid/lit-prism-patterns";

import {
  Session,
  getClientAuthenticationWithDependencies,
} from "@inrupt/solid-client-authn-browser";

import theme from "../src/theme";
import SessionContext from "../src/contexts/sessionContext";
import { AlertProvider } from "../src/contexts/alertContext";
import { ConfirmationDialogProvider } from "../src/contexts/confirmationDialogContext";
import Notification from "../components/notification";
import ConfirmationDialog from "../components/confirmationDialog";
import PodBrowserHeader from "../components/header";
import PodBrowserFooter from "../components/footer";

import "./styles.css";

interface AppProps {
  Component: ComponentType;
  pageProps: any;
}

// Enable Sentry if there's an env var for it.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    enabled: process.env.NODE_ENV === "production",
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}

const jss = create(preset());

const useStyles = makeStyles(() =>
  createStyles(appLayout.styles(theme) as StyleRules)
);

// Generate an app-level session.
const session = new Session(
  {
    clientAuthentication: getClientAuthenticationWithDependencies({}),
  },
  "pod-browser"
);

export function hasSolidAuthClientHash(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.location.hash.indexOf("#access_token=") === 0) {
    return true;
  }

  return false;
}

export default function App(props: AppProps): ReactElement {
  const { Component, pageProps } = props;
  const bem = useBem(useStyles());
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    // Remove injected serverside JSS
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    session
      .handleIncomingRedirect(window.location.href)
      .then(() => {
        setIsLoadingSession(false);
      })
      .catch((error: Error) => {
        throw error;
      });
  }, []);

  return (
    <>
      <Head>
        <title>Inrupt PodBrowser</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme}>
          <SessionContext.Provider
            value={{
              session,
              isLoadingSession,
            }}
          >
            <AlertProvider>
              <ConfirmationDialogProvider>
                <CssBaseline />
                <div className={bem("app-layout")}>
                  <PodBrowserHeader />
                  <main className={bem("app-layout__main")}>
                    <Component {...pageProps} />
                  </main>
                  <PodBrowserFooter />
                </div>

                <Notification />
                <ConfirmationDialog />
              </ConfirmationDialogProvider>
            </AlertProvider>
          </SessionContext.Provider>
        </ThemeProvider>
      </StylesProvider>
    </>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};
