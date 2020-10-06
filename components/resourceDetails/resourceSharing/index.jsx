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

/* eslint-disable camelcase, no-console, react/forbid-prop-types */

import React, { useContext, useState } from "react";
import T from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  // createStyles,
  // Divider,
  // List,
  // ListItem,
  // ListItemIcon,
  // Popover,
  // Typography,
} from "@material-ui/core";
// import PersonIcon from "@material-ui/icons/Person";
// import { makeStyles } from "@material-ui/styles";
// import {
//   getAgentDefaultAccess,
//   getResourceAcl,
//   hasAccessibleAcl,
//   hasResourceAcl,
// } from "@inrupt/solid-client";
import { ActionMenu, ActionMenuItem } from "@inrupt/prism-react-components";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// import { useSession } from "@inrupt/solid-ui-react";
// import { resourceContextRedirect } from "../../resourceLink";
// import { fetchProfile } from "../../../src/solidClientHelpers/profile";
// import {
//   ACL,
//   displayPermissions,
//   getThirdPartyPermissions,
//   getUserPermissions,
//   saveDefaultPermissions,
//   saveSpecificPermissions,
// } from "../../../src/solidClientHelpers/permissions";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import styles from "./styles";
import AgentAccessList from "./agentAccessList";
import AddPermissionUsingWebIdButton from "../../addPermissionUsingWebIdButton";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

// export function handleAddAgentClick(addedAgents, setAddedAgents, fetch) {
//   return async (agentId) => {
//     try {
//       const profile = await fetchProfile(agentId, fetch);
//       const { webId } = profile;
//       const exists = addedAgents.some(({ webId: id }) => id === profile.webId);
//       if (!exists) {
//         setAddedAgents([
//           ...addedAgents,
//           {
//             webId,
//             profile,
//             alias: ACL.NONE.alias,
//             acl: ACL.NONE.acl,
//           },
//         ]);
//       }
//     } catch ({ message }) {
//       console.error(message);
//     }
//   };
// }

// export function onThirdPartyAccessSubmit({
//   addedAgents,
//   setAddedAgents,
//   setThirdPartyPermissions,
//   thirdPartyPermissions,
// }) {
//   return async (profile, acl) => {
//     const alias = displayPermissions(acl);
//     const { webId } = profile;
//
//     setAddedAgents(addedAgents.filter((a) => a.webId !== webId));
//     setThirdPartyPermissions([
//       ...thirdPartyPermissions,
//       {
//         alias,
//         acl,
//         webId,
//         profile,
//       },
//     ]);
//   };
// }

// function NoThirdPartyPermissions({ classes }) {
//   return (
//     <section className={classes.centeredSection}>
//       <List>
//         <ListItem key={0} className={classes.listItem}>
//           <ListItemIcon>
//             <PersonIcon />
//             People
//           </ListItemIcon>
//         </ListItem>
//
//         <ListItem key={1} className={classes.listItem}>
//           <Typography className={classes.detailText}>
//             No 3rd party access
//           </Typography>
//         </ListItem>
//       </List>
//     </section>
//   );
// }
//
// NoThirdPartyPermissions.propTypes = {
//   classes: T.object.isRequired,
// };
//
// export { NoThirdPartyPermissions };

// export function thirdPartySubmitHandler({
//   setThirdPartyPermissions,
//   thirdPartyPermissions,
// }) {
//   return (agent, access) => {
//     if (Object.values(access).some((x) => x)) return;
//
//     setThirdPartyPermissions(
//       thirdPartyPermissions.filter(({ webId }) => webId !== agent.webId)
//     );
//   };
// }

// function ThirdPartyPermissions(props) {
//   const {
//     thirdPartyPermissions,
//     classes,
//     iri,
//     setThirdPartyPermissions,
//   } = props;
//
//   if (!thirdPartyPermissions) return null;
//   if (thirdPartyPermissions.length === 0) {
//     return <NoThirdPartyPermissions classes={classes} />;
//   }
//
//   const onSubmit = thirdPartySubmitHandler({
//     thirdPartyPermissions,
//     setThirdPartyPermissions,
//   });
//
//   return (
//     <section className={classes.centeredSection}>
//       <h5 className={classes["content-h5"]}>Sharing</h5>
//       <List>
//         <ListItem key={0} className={classes.listItem}>
//           <ListItemIcon>
//             <PersonIcon />
//             People
//           </ListItemIcon>
//         </ListItem>
//
//         <Divider />
//
//         <AgentAccessList
//           permissions={thirdPartyPermissions}
//           classes={classes}
//           saveFn={savePermissions}
//           onSubmit={onSubmit}
//           iri={iri}
//         />
//       </List>
//     </section>
//   );
// }
//
// ThirdPartyPermissions.propTypes = {
//   thirdPartyPermissions: T.arrayOf(T.object).isRequired,
//   classes: T.object.isRequired,
//   iri: T.string.isRequired,
//   setThirdPartyPermissions: T.func.isRequired,
// };
//
// export { ThirdPartyPermissions };

// export function backToDetailsClick(router) {
//   return async () => {
//     const { iri, resourceIri } = router.query;
//     await resourceContextRedirect("details", resourceIri, iri, router);
//   };
// }

// export function handleChangeDefaultAgentPermissions({
//   defaultAgents,
//   setDefaultAgents,
// }) {
//   return (agent, access) => {
//     const noAccess = Object.values(access).every((x) => !x);
//
//     if (noAccess) {
//       setDefaultAgents(defaultAgents.filter((a) => a.webId !== agent.webId));
//     }
//   };
// }

// export function handleAddDefaultPermissions({
//   defaultAgents,
//   setDefaultAgents,
// }) {
//   return (agent, access) => {
//     const agentInList = defaultAgents.some((a) => a.webId === agent.webId);
//
//     if (agentInList) return;
//
//     const permission = {
//       webId: agent.webId,
//       alias: displayPermissions(access),
//       profile: agent,
//       acl: access,
//     };
//
//     setDefaultAgents([...defaultAgents, permission]);
//   };
// }

function ResourceSharing() {
  // const {
  //   session: {
  //     info: { webId },
  //   },
  // } = useSession();
  // const [addedAgents, setAddedAgents] = useState(permissions);
  // const [defaultAgents, setDefaultAgents] = useState(permissions);
  const actionMenuBem = ActionMenu.useBem();
  const classes = useStyles();

  // const userPermissions = getUserPermissions(webId, permissions);
  // const [thirdPartyPermissions, setThirdPartyPermissions] = useState(
  //   getThirdPartyPermissions(webId, permissions)
  // );
  // const classes = useStyles();
  // const defaultPermission = {
  //   webId,
  //   alias: "Control",
  //   profile: { webId },
  //   acl: {
  //     read: true,
  //     write: true,
  //     append: true,
  //     control: true,
  //   },
  // };
  //
  // if (hasResourceAcl(dataset) && hasAccessibleAcl(dataset)) {
  //   const resourceAcl = getResourceAcl(dataset);
  //   const acl = getAgentDefaultAccess(resourceAcl, webId);
  //   defaultPermission.acl = acl;
  // }

  // const onThirdPartyPermissionSubmit = onThirdPartyAccessSubmit({
  //   setAddedAgents,
  //   addedAgents,
  //   thirdPartyPermissions,
  //   setThirdPartyPermissions,
  // });

  return (
    <div>
      <ActionMenu>
        <ActionMenuItem>
          <AddPermissionUsingWebIdButton
            className={actionMenuBem("action-menu__trigger", "prompt")}
          />
        </ActionMenuItem>
      </ActionMenu>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Individual permissions
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <AgentAccessList />
        </AccordionDetails>
      </Accordion>
      {/* <Divider /> */}
      {/* <Divider /> */}
      {/* <Divider /> */}
      {/* <Divider /> */}
      {/* <Divider /> */}
      {/* <Divider /> */}
      {/* <section className={classes.centeredSection}> */}
      {/*  <h5 className={classes["content-h5"]}>My Access</h5> */}
      {/*  <AgentAccessList */}
      {/*    permissions={userPermissions ? [userPermissions] : []} */}
      {/*    iri={iri} */}
      {/*    saveFn={savePermissions} */}
      {/*    warn */}
      {/*  /> */}
      {/* </section> */}

      {/* <ThirdPartyPermissions */}
      {/*  iri={iri} */}
      {/*  thirdPartyPermissions={thirdPartyPermissions} */}
      {/*  setThirdPartyPermissions={setThirdPartyPermissions} */}
      {/*  classes={classes} */}
      {/* /> */}

      {/* <Divider /> */}

      {/* <section className={classes.centeredSection}> */}
      {/*  <AgentSearchForm */}
      {/*    onSubmit={handleAddAgentClick(addedAgents, setAddedAgents, fetch)} */}
      {/*  /> */}
      {/* </section> */}

      {/* <section className={classes.centeredSection} /> */}

      {/* <Divider /> */}

      {/* <section className={classes.centeredSection}> */}
      {/*  <h5 className={classes["content-h5"]}>Default Access</h5> */}

      {/*  <List> */}
      {/*    <ListItem key={0} className={classes.listItem}> */}
      {/*      <ListItemIcon> */}
      {/*        <PersonIcon /> */}
      {/*        People */}
      {/*      </ListItemIcon> */}
      {/*    </ListItem> */}

      {/*    <Divider /> */}
      {/*  </List> */}

      {/*  <DefaultPermissionForm */}
      {/*    iri={iri} */}
      {/*    webId={webId} */}
      {/*    permission={defaultPermission} */}
      {/*    onSubmit={handleAddDefaultPermissions({ */}
      {/*      defaultAgents, */}
      {/*      setDefaultAgents, */}
      {/*    })} */}
      {/*  /> */}

      {/*  <Divider /> */}
      {/* </section> */}
    </div>
  );
}

ResourceSharing.propTypes = {
  // iri: T.string.isRequired,
  // permissions: T.arrayOf(T.object).isRequired,
  // defaultPermissions: T.arrayOf(T.object).isRequired,
  // dataset: T.object.isRequired,
};

export default ResourceSharing;
