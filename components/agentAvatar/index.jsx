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

import React from "react";
import PropTypes from "prop-types";
import { useThing } from "@inrupt/solid-ui-react";
import { makeStyles } from "@material-ui/styles";
import { Icons } from "@inrupt/prism-react-components";
import { Avatar, createStyles } from "@material-ui/core";
import { getUrl } from "@inrupt/solid-client";
import { rdf } from "rdf-namespaces";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AgentAvatar({ imageUrl, altText }) {
  const { thing } = useThing();
  const classes = useStyles();
  const contactType = getUrl(thing, rdf.type) || "app";
  if (!imageUrl && contactType === "app") {
    return (
      <Avatar className={classes.appAvatar} alt={altText || "Contact avatar"}>
        <Icons className={classes.appAvatar} name="project-diagram" />
      </Avatar>
    );
  }
  return (
    <Avatar
      className={classes.avatar}
      alt={altText || "Contact avatar"}
      src={imageUrl}
    />
  );
}

AgentAvatar.propTypes = {
  imageUrl: PropTypes.string,
  altText: PropTypes.string,
};

AgentAvatar.defaultProps = {
  imageUrl: null,
  altText: "Contact avatar",
};
