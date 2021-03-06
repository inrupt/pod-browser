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

/* istanbul ignore file */
import React, { createContext, useState } from "react";
import T from "prop-types";

export const defaultAlertContext = {
  alertOpen: false,
  message: "",
  severity: "success",
  setAlertOpen: () => false,
  setMessage: () => "",
  setSeverity: () => "success",
  alertSuccess: () => {},
  alertError: () => {},
};
const AlertContext = createContext(defaultAlertContext);

function AlertProvider({ children }) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const alertSuccess = (msg) => {
    let errorMessage = msg;

    if (msg instanceof Error) {
      errorMessage = msg.toString();
    }

    setSeverity("success");
    setMessage(errorMessage);
    setAlertOpen(true);
  };

  const alertError = (msg) => {
    let errorMessage = msg;

    if (msg instanceof Error) {
      errorMessage = msg.toString();
    }

    setSeverity("error");
    setMessage(errorMessage);
    setAlertOpen(true);
  };

  return (
    <AlertContext.Provider
      value={{
        alertError,
        alertOpen,
        alertSuccess,
        message,
        setAlertOpen,
        setMessage,
        setSeverity,
        severity,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

AlertProvider.propTypes = {
  children: T.node.isRequired,
};

export { AlertProvider };
export default AlertContext;
