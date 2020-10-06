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

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import { Drawer, LoadingIndicator } from "@inrupt/prism-react-components";
import { DatasetProvider, useSession } from "@inrupt/solid-ui-react";
import { getResourceInfoWithAcl } from "@inrupt/solid-client";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import { stripQueryParams } from "../../src/stringHelpers";
import ResourceDetails from "../resourceDetails";

export function handleCloseDrawer({ setMenuOpen, router }) {
  return async () => {
    setMenuOpen(false);
    const { asPath } = router;
    const pathname = stripQueryParams(asPath) || "/";
    await router.replace("/resource/[iri]", pathname);
  };
}

export default function DetailsContextMenu({ onUpdate }) {
  const { menuOpen, setMenuOpen } = useContext(DetailsMenuContext);
  const { fetch } = useSession();
  const [datasetWithAcl, setDatasetWithAcl] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    query: { action, resourceIri },
  } = useRouter();

  const router = useRouter();

  useEffect(() => {
    setMenuOpen(!!(action && resourceIri));
  }, [action, resourceIri, setMenuOpen]);

  useEffect(() => {
    if (!resourceIri) return;
    setLoading(true);
    getResourceInfoWithAcl(resourceIri, { fetch }).then((dataset) => {
      setDatasetWithAcl(dataset);
      setLoading(false);
    });
  }, [fetch, resourceIri]);

  const closeDrawer = handleCloseDrawer({ setMenuOpen, router });

  return (
    <Drawer open={menuOpen} close={closeDrawer}>
      {loading ? (
        <LoadingIndicator center maxHeight={400} />
      ) : (
        <DatasetProvider dataset={datasetWithAcl}>
          <ResourceDetails onDelete={onUpdate} />
        </DatasetProvider>
      )}
    </Drawer>
  );
}

DetailsContextMenu.propTypes = {
  onUpdate: T.func,
};

DetailsContextMenu.defaultProps = {
  onUpdate: () => {},
};
