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

const styles = (theme, menuItem) => {
  const bookmarkIconOutline = menuItem
    ? `2px ${theme.palette.text.primary}`
    : `2px ${theme.palette.grey["400"]}`;

  return createStyles(theme, ["icons", "button"], {
    "bookmark-button": {
      width: "100%",
      height: "100%",
      "&:hover": {
        textDecoration: "none",
      },
    },
    "bookmark-menu-item": {
      textAlign: "left",
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(1),
      borderRadius: "unset",
      "& i": {
        padding: theme.spacing(0, 0.8),
      },
    },
    "bookmark-icon-unselected": {
      color: theme.palette.background.paper,
      textStroke: bookmarkIconOutline,
    },
    "bookmark-icon-selected": theme.icons.iconColor(theme.palette.primary.main),
    "bookmark-text": {
      fontSize: theme.typography.htmlFontSize,
      textTransform: "none",
      letterSpacing: "normal",
      padding: 0,
    },
  });
};

export default styles;
