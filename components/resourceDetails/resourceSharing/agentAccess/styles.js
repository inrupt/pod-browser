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

export default function styles() {
  return {
    avatar: {
      marginRight: "1rem",
    },
    detailText: {
      fontSize: "0.75rem",
      textAlign: "left",
      flexGrow: 1,
    },
    "alert-container": {
      maxWidth: "100%",
    },
    alertBox: {
      fontSize: "14px",
      width: "100%",
      overflowWrap: "break-word",
      margin: "16px 0",
    },
    alertMessage: {
      maxWidth: "50%",
      overflowWrap: "break-word",
    },
    "avatar-container": {
      display: "flex",
      maxWidth: "100%",
      paddingRight: "16px",
      "& p": {
        overflowWrap: "anywhere",
        marginRight: "16px",
      },
    },
    "bold-button": {
      fontWeight: "bold",
    },
    spinner: {
      margin: "20px",
    },
  };
}
