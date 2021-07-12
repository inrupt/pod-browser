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

/* eslint react/jsx-props-no-spreading: 0 */

import React, { createRef, useEffect, useState } from "react";
import T from "prop-types";
import {
  FormControl,
  FormHelperText,
  TextField,
  useTheme,
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Autocomplete } from "@material-ui/lab";
import { useBem } from "@solid/lit-prism-patterns";
import { LoginButton, useSession } from "@inrupt/solid-ui-react";

import { Button } from "@inrupt/prism-react-components";
import { generateRedirectUrl } from "../../../src/windowHelpers";
import getIdentityProviders from "../../../constants/provider";
import { ERROR_REGEXES, hasError } from "../../../src/error";
import useIdpFromQuery from "../../../src/hooks/useIdpFromQuery";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const providers = getIdentityProviders();
export const TESTCAFE_ID_LOGIN_FIELD = "login-field";
const TESTCAFE_ID_GO_BUTTON = "go-button";
const CLIENT_APP_WEBID = "https://podbrowser.inrupt.com/app.jsonld#id";

export function setupOnProviderChange(setProviderIri, setLoginError) {
  return (e, newValue) => {
    setLoginError(null);
    if (typeof newValue === "string") {
      if (newValue.startsWith("https://") || newValue.startsWith("http://")) {
        setProviderIri(newValue);
      } else {
        setProviderIri(`https://${newValue}`);
      }
    } else {
      setProviderIri(newValue?.iri || null);
    }
  };
}
export function setupLoginHandler(login) {
  return async (event) => {
    event.preventDefault();
    login();
  };
}

export function setupErrorHandler(setLoginError) {
  return (error) => {
    setLoginError(error);
  };
}

export function getErrorMessage(error) {
  const postFix = " Please fill out a valid Solid Identity Provider.";
  if (hasError(error, ERROR_REGEXES.INVALID_IDP)) {
    return "This URL is not a Solid Identity Provider.";
  }
  if (hasError(error, ERROR_REGEXES.HANDLER_NOT_FOUND)) {
    return "Please fill out a valid Solid Identity Provider.";
  }
  return `We were unable to log in with this URL.${postFix}`;
}

export default function Provider({ defaultError }) {
  const bem = useBem(useStyles());
  const classes = useStyles();
  const { login } = useSession();
  const [loginError, setLoginError] = useState(defaultError);
  const theme = useTheme();
  const idp = useIdpFromQuery();
  const [providerIri, setProviderIri] = useState();
  const loginFieldRef = createRef();

  useEffect(() => {
    if (idp) {
      setProviderIri(idp.iri);
      loginFieldRef.current?.querySelector("input")?.focus();
    }
  }, [idp, loginFieldRef]);

  const authOptions = {
    clientName: "Inrupt PodBrowser",
    clientId: CLIENT_APP_WEBID,
  };

  const onProviderChange = setupOnProviderChange(setProviderIri, setLoginError);
  const handleLogin = setupLoginHandler(login);
  const onError = setupErrorHandler(setLoginError);

  const providersWithIdp = idp ? [idp, ...providers] : providers;
  return (
    <form onSubmit={handleLogin} className={bem("provider-login__form")}>
      <div className={bem("provider-login__wrapper")}>
        <FormControl
          classes={{ root: classes.selectionBox }}
          error={!!loginError}
        >
          <Autocomplete
            onChange={onProviderChange}
            onInputChange={onProviderChange}
            id="provider-select"
            freeSolo
            options={providersWithIdp}
            getOptionLabel={(option) => option.label}
            renderOption={(option) => {
              return (
                <>
                  {option.logo ? (
                    <img
                      src={`../${option.logo}`}
                      width={20}
                      style={{ margin: "1rem" }}
                      alt={option.label}
                    />
                  ) : (
                    <div style={{ minWidth: "20px", padding: "1.6rem" }} />
                  )}
                  {option.label}
                </>
              );
            }}
            inputValue={idp?.label || providerIri}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!loginError}
                margin="none"
                variant="outlined"
                type="url"
                aria-describedby={loginError ? "login-error-text" : null}
                data-testid={TESTCAFE_ID_LOGIN_FIELD}
                ref={loginFieldRef}
              />
            )}
          />
          {loginError ? (
            <FormHelperText
              id="login-error-text"
              style={{ marginBottom: theme.spacing(1) }}
            >
              {getErrorMessage(loginError)}
            </FormHelperText>
          ) : null}
        </FormControl>
        <LoginButton
          oidcIssuer={providerIri}
          redirectUrl={generateRedirectUrl("")}
          authOptions={authOptions}
          onError={onError}
        >
          <Button
            variant="primary"
            data-testid={TESTCAFE_ID_GO_BUTTON}
            type="submit"
            className={bem("provider-login__button")}
          >
            Go
          </Button>
        </LoginButton>
      </div>
    </form>
  );
}

Provider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  defaultError: T.object,
};

Provider.defaultProps = {
  defaultError: null,
};
