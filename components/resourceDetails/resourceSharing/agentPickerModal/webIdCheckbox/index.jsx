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

import React from "react";
import { useThing } from "@inrupt/solid-ui-react";
import PropTypes from "prop-types";
import { Checkbox } from "@material-ui/core";
import useContactProfileOld from "../../../../../src/hooks/useContactProfileOld";

export const TESTCAFE_ID_WEBID_CHECKBOX = "webid-checkbox";

export default function WebIdCheckbox({
  value,
  index,
  addingWebId,
  toggleCheckbox,
  newAgentsWebIds,
  webIdsInPermissions,
  webIdsToDelete,
}) {
  const { thing } = useThing();
  const { data: profile } = useContactProfileOld(thing);

  const getWebIdValue = () => {
    let webIdValue;
    if (!value && profile) {
      webIdValue = profile.webId;
    } else if (value) {
      webIdValue = value;
    } else if (!value && index === 0) {
      webIdValue = "";
    }
    return webIdValue;
  };

  return (
    <Checkbox
      inputProps={{ "data-testid": TESTCAFE_ID_WEBID_CHECKBOX }}
      type="checkbox"
      color="primary"
      size="medium"
      value={getWebIdValue()}
      checked={
        (index === 0 && addingWebId) ||
        newAgentsWebIds.includes(getWebIdValue()) ||
        (webIdsInPermissions.includes(getWebIdValue()) &&
          !webIdsToDelete.includes(getWebIdValue()))
      }
      onChange={(e) => toggleCheckbox(e, index, getWebIdValue())}
    />
  );
}

WebIdCheckbox.propTypes = {
  value: PropTypes.string,
  index: PropTypes.number.isRequired,
  addingWebId: PropTypes.bool,
  toggleCheckbox: PropTypes.func,
  newAgentsWebIds: PropTypes.arrayOf(PropTypes.string),
  webIdsInPermissions: PropTypes.arrayOf(PropTypes.string),
  webIdsToDelete: PropTypes.arrayOf(PropTypes.string),
};

WebIdCheckbox.defaultProps = {
  value: null,
  addingWebId: false,
  toggleCheckbox: () => {},
  newAgentsWebIds: [],
  webIdsInPermissions: [],
  webIdsToDelete: [],
};
