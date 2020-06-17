/* eslint-disable camelcase */
import { ReactElement, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, TableCell, TableRow } from "@material-ui/core";
import Link from "next/link";
import Details from "../details";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import {
  fetchFileWithAcl,
  fetchResource,
  fetchResourceWithAcl,
  getIriPath,
  NormalizedResource,
  PUBLIC_PERMISSIONS,
} from "../../src/lit-solid-helpers";
import styles from "./styles";

export function isPublic(pathname: string): boolean {
  return !!pathname.match(/^\/public$/);
}

interface ResourceDetails extends NormalizedResource {
  name: string | undefined;
}

export async function fetchResourceDetails(
  iri: string
): Promise<ResourceDetails> {
  const name = getIriPath(iri);
  let resource;
  try {
    if (isPublic(name as string)) {
      const response = await fetchResource(iri);
      resource = {
        ...response,
        permissions: PUBLIC_PERMISSIONS,
      };
    } else {
      resource = await fetchResourceWithAcl(iri);
    }
  } catch (e) {
    resource = await fetchFileWithAcl(iri);
  }

  return {
    ...resource,
    name,
  };
}

export function resourceHref(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}

interface TableRowClickHandlerParams {
  classes: Record<string, string>;
  iri: string;
  setMenuOpen: (open: boolean) => void;
  setMenuContents: (contents: ReactElement) => void;
}

export function handleTableRowClick({
  classes,
  iri,
  setMenuOpen,
  setMenuContents,
}: TableRowClickHandlerParams) {
  return async (evnt: Partial<React.MouseEvent>): Promise<void> => {
    const element = evnt.target as HTMLElement;
    if (element && element.tagName === "A") return;

    setMenuOpen(true);
    setMenuContents(
      <div className={classes.spinnerContainer}>
        <CircularProgress />
      </div>
    );

    const { types, name, permissions } = await fetchResourceDetails(iri);

    setMenuContents(
      <Details iri={iri} types={types} name={name} permissions={permissions} />
    );
  };
}

const useStyles = makeStyles(styles);

interface Props {
  iri: string;
}

export default function ContainerTableRow({ iri }: Props): ReactElement {
  const { setMenuOpen, setMenuContents } = useContext(DetailsMenuContext);
  const classes = useStyles();
  const onClick = handleTableRowClick({
    classes,
    iri,
    setMenuOpen,
    setMenuContents,
  });

  return (
    <TableRow className={classes.tableRow} onClick={onClick}>
      <TableCell>
        <Link href={resourceHref(iri)}>
          <a>{getIriPath(iri)}</a>
        </Link>
      </TableCell>
      <TableCell>Folder</TableCell>
      <TableCell>Full</TableCell>
      <TableCell>Today :)</TableCell>
    </TableRow>
  );
}
