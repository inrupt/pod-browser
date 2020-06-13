import { ReactElement, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, TableCell, TableRow } from "@material-ui/core";
import Link from "next/link";
import Details from "../details";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";

import {
  NormalizedResource,
  getIriPath,
  fetchResource,
} from "../../src/lit-solid-helpers";
import styles from "./styles";

const useStyles = makeStyles(styles);

interface ContainerDetails extends NormalizedResource {
  name: string | undefined;
}

export async function fetchContainerDetails(
  iri: string
): Promise<ContainerDetails> {
  const name = getIriPath(iri);
  const resource = await fetchResource(iri);

  return {
    ...resource,
    name,
  };
}

export function resourceLink(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}

export function handleTableRowClick({
  classes,
  iri,
  setMenuOpen,
  setMenuContents,
}: {
  classes: Record<string, string>;
  iri: string;
  setMenuOpen: (open: boolean) => void;
  setMenuContents: (contents: ReactElement) => void;
}) {
  return async (evnt: Partial<React.MouseEvent>): Promise<void> => {
    const element = evnt.target as HTMLElement;
    if (element && element.tagName === "A") return;

    setMenuOpen(true);
    setMenuContents(
      <div className={classes.spinnerContainer}>
        <CircularProgress />
      </div>
    );

    const { type, name, acl } = await fetchContainerDetails(iri);

    setMenuContents(<Details iri={iri} type={type} name={name} acl={acl} />);
  };
}

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
        <Link href={resourceLink(iri)}>
          <a>{getIriPath(iri)}</a>
        </Link>
      </TableCell>
      <TableCell>Folder</TableCell>
      <TableCell>Full</TableCell>
      <TableCell>Today :)</TableCell>
    </TableRow>
  );
}
