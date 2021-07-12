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
import { createStyles, makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";
import { LoginButton } from "@inrupt/solid-ui-react";
import { useBem } from "@solid/lit-prism-patterns";
import InfoTooltip from "../infoTooltip";
import ProviderLogin from "./provider";
import styles from "./styles";
import { generateRedirectUrl } from "../../src/windowHelpers";
import useClientId from "../../src/hooks/useClientId";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_LOGIN_BUTTON = "login-button";
const TESTCAFE_ID_LOGIN_TITLE = "login-title";
export const TESTCAFE_ID_OTHER_PROVIDERS_BUTTON = "other-providers-button";
const PROVIDER_IRI = "https://broker.pod.inrupt.com/";
const CLIENT_APP_WEBID = `${process.env.NEXT_PUBLIC_VERCEL_URL}/app.jsonld#id`;

export default function Login() {
  const bem = useBem(useStyles());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownIcon = isOpen ? "caret-up" : "caret-down";

  const toggleOpenDropdown = () => setIsOpen(!isOpen);
  const INFO_TOOLTIP_TEXT = "This is where you signed up for a Solid Pod";
  const INFO_BUTTON_LABEL = "Where is your Pod hosted?";

  const oidcSupported = useClientId(PROVIDER_IRI);

  const authOptions = {
    clientName: "Inrupt PodBrowser",
    clientId: oidcSupported.response ? CLIENT_APP_WEBID : null,
  };

  return (
    <div className={bem("login-form")}>
      <h3 data-testid={TESTCAFE_ID_LOGIN_TITLE}>Sign in with</h3>
      <img
        width={160}
        src="/pod-spaces-logo.svg"
        alt="Inrupt PodBrowser"
        className={bem("login-form__logo")}
      />
      <LoginButton
        oidcIssuer={PROVIDER_IRI}
        redirectUrl={generateRedirectUrl("")}
        authOptions={authOptions}
      >
        <Button
          variant="primary"
          data-testid={TESTCAFE_ID_LOGIN_BUTTON}
          type="submit"
          className={bem("login-form__button")}
        >
          Sign In
        </Button>
      </LoginButton>
      <div className={bem("separator__wrap")}>
        <h2 className={bem("separator__centre-line")}>
          <span>Or</span>
        </h2>
      </div>
      <Button
        variant="secondary"
        iconAfter={dropdownIcon}
        onClick={toggleOpenDropdown}
        data-testid={TESTCAFE_ID_OTHER_PROVIDERS_BUTTON}
      >
        Sign in with other provider
      </Button>
      <div className={bem("provider-login-container", isOpen && "visible")}>
        <InfoTooltip
          label={INFO_BUTTON_LABEL}
          tooltipText={INFO_TOOLTIP_TEXT}
          className={bem("info-button")}
        />
        <ProviderLogin />
      </div>
    </div>
  );
}
