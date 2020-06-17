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

import React, { ComponentType, ReactElement, useEffect, useState } from "react";

import PropTypes from "prop-types";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";
import auth from "solid-auth-client";

import { createStyles, makeStyles, ThemeProvider } from "@material-ui/styles";

import { StyleRules } from "@material-ui/styles/withStyles";
import theme from "../src/theme";
import UserContext, { ISession } from "../src/contexts/userContext";
import PodManagerHeader from "../components/header";
import "./styles.css";
import { appLayout, useBem } from "../lib/prism/packages/prism-patterns";

/* eslint @typescript-eslint/no-explicit-any: 0 */
interface AppProps {
  Component: ComponentType;
  pageProps: any;
}

const useStyles = makeStyles(() =>
  createStyles(appLayout.styles(theme) as StyleRules)
);

export default function App(props: AppProps): ReactElement {
  const { Component, pageProps } = props;

  const [session, setSession] = useState<ISession | undefined>();
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const bem = useBem(useStyles());

  // Remove injected serverside JSS
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    auth.trackSession(setSession).catch((e) => {
      throw e;
    });
  }, []);

  // Update the session when a page is loaded
  useEffect(() => {
    setIsLoadingSession(true);

    // Remove the server-side injected CSS.
    async function fetchSession(): Promise<void> {
      const sessionStorage = await auth.currentSession();
      setSession(sessionStorage);
      setIsLoadingSession(false);
    }

    fetchSession().catch((e) => {
      throw e;
    });
  }, [Component, pageProps, setSession, setIsLoadingSession]);

  return (
    <>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <ThemeProvider theme={theme}>
        <UserContext.Provider value={{ session, isLoadingSession }}>
          <CssBaseline />
          {/* eslint react/jsx-props-no-spreading: 0 */}
          <div className={bem("app-layout")}>
            <PodManagerHeader />
            <main className={bem("app-layout__main")}>
              <Component {...pageProps} />
            </main>
          </div>
        </UserContext.Provider>
      </ThemeProvider>
    </>
  );
}

// TODO Temporary workaround to .env issues
App.getInitialProps = async function placeholder() {
  return {};
};

App.defaultProps = { pageProps: {} };

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  /* eslint react/forbid-prop-types: 0 */
  pageProps: PropTypes.object,
};
