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

import { createStyles } from "@solid/lit-prism-patterns";

const TABLE_MAX_HEIGHT = 460;
const MOBILE_TABLE_MIN_HEIGHT = 300;

export default function styles(theme) {
  return createStyles(theme, ["icons", "button", "table"], {
    "agent-multi-select-picker": {
      minHeight: MOBILE_TABLE_MIN_HEIGHT,
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.common.white,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.grey.A100}`,
      marginBottom: theme.spacing(2.4),
      height: "100%",
      maxHeight: TABLE_MAX_HEIGHT,
      overflowY: "auto",
      [theme.breakpoints.up("xs")]: {
        minHeight: "unset",
      },
    },
    "agent-multi-select-picker__tabs-and-button-container": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme.palette.grey.A100}`,
    },
    "agent-multi-select-picker__agent-table": {
      width: `calc(100% - ${theme.spacing(1.6) * 2}px)`,
      boxSizing: "border-box",
      marginLeft: theme.spacing(1.6),
      marginRight: theme.spacing(1.6),
      "&& thead > tr": {
        minWidth: "100%",
        fontSize: theme.typography.caption.fontSize,
        alignItems: "center",
        borderBottom: `1px solid ${theme.palette.grey.A100}`,
        fontWeight: theme.typography.body1.fontWeight,
        color: theme.palette.text.primary,
      },
      "&& tbody tr": {
        borderBottom: `1px solid ${theme.palette.grey.A100}`,
      },
      "&& tbody td": {
        maxWidth: "100%",
      },
      "&& tbody :last-child": {
        borderBottom: "none",
      },
    },
    "agent-multi-select-picker__table-header": {
      display: "flex",
      margin: 0,
      padding: theme.spacing(0.5),
      textTransform: "capitalize",
    },
    "agent-multi-select-picker__tabs": {
      borderBottom: "none !important", // overriding the default border bottom so we can set it to the whole width of the container
    },
    "agent-multi-select-picker__empty": {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(0.7, 1.4),
      textAlign: "center",
    },
    // hopefully we can remove these once we figure out how to test the Hidden component from MUI so we can use that instead
    "agent-multi-select-picker__mobile-only": {
      display: "flex",
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
    },
    "agent-multi-select-picker__desktop-only": {
      display: "none",
      [theme.breakpoints.up("sm")]: {
        display: "flex",
      },
    },
  });
}
