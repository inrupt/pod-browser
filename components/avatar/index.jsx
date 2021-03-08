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

/* eslint react/jsx-props-no-spreading:off */

import React from "react";
import { Icons } from "@inrupt/prism-react-components";
import { Avatar as MuiAvatar } from "@material-ui/core";
import T from "prop-types";

export default function Avatar({ src, icon, iconStyle, ...props }) {
  return src ? (
    <MuiAvatar src={src} {...props} />
  ) : (
    <MuiAvatar {...props}>
      <Icons name={icon} style={iconStyle} />
    </MuiAvatar>
  );
}

Avatar.propTypes = {
  icon: T.string.isRequired,
  src: T.string,
  iconStyle: T.shape(),
};

Avatar.defaultProps = {
  src: null,
  iconStyle: null,
};
