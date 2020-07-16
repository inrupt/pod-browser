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

/* eslint-disable camelcase, @typescript-eslint/no-explicit-any */

import useSWR from "swr";
import {
  fetchLitDataset,
  getThingOne,
  getIriAll,
  unstable_Access,
  unstable_fetchResourceInfoWithAcl,
  unstable_getAgentAccessAll,
  isContainer, Iri, stringAsIri,
} from "@solid/lit-pod";
import { LDP } from "@solid/lit-vocab-common";
import { WS } from "@solid/lit-vocab-solid";
import {
  fetchResourceWithAcl,
  getIriPath,
  normalizePermissions,
  ResourceDetails,
} from "../../lit-solid-helpers";

export async function fetchContainerResourceIris(
  containerIri: Iri
): Promise<Iri[]> {
  const litDataset = await fetchLitDataset(containerIri);
  const container = getThingOne(litDataset, containerIri);
  const iris = getIriAll(container, LDP.contains);
  return iris;
}

export const GET_CONTAINER_RESOURCE_IRIS = stringAsIri("getContainerResourceIris");
export function useFetchContainerResourceIris(iri: Iri): any {
  return useSWR<Iri[]>(
    [iri, GET_CONTAINER_RESOURCE_IRIS],
    fetchContainerResourceIris
  );
}

export async function fetchResourceDetails(
  iri: Iri
): Promise<ResourceDetails> {
  const name = getIriPath(iri) as string;
  const resourceInfo = await unstable_fetchResourceInfoWithAcl(iri);
  const accessModeList = unstable_getAgentAccessAll(resourceInfo);
  const permissions = await normalizePermissions(
    accessModeList as Record<string, unstable_Access>
  );

  let types = [] as string[];
  const contentType = resourceInfo?.resourceInfo?.contentType;

  if (contentType) types = [contentType];
  if (isContainer(resourceInfo)) types = ["Container"];

  return {
    iri,
    permissions,
    types,
    name,
  };
}

export const FETCH_RESOURCE_DETAILS = stringAsIri("fetchResourceDetails");
export function useFetchResourceDetails(iri: Iri): any {
  return useSWR([iri, FETCH_RESOURCE_DETAILS], fetchResourceDetails);
}

export const FETCH_RESOURCE_WITH_ACL = stringAsIri("fetchResourceWithAcl");
export function useFetchResourceWithAcl(iri: Iri): any {
  return useSWR([iri, stringAsIri("fetchResourceWithAcl")], fetchResourceWithAcl);
}

export async function fetchPodIrisFromWebId(webId: Iri): Promise<Iri[]> {
  const profileDoc = await fetchLitDataset(webId);
  const profile = getThingOne(profileDoc, webId);

  return getIriAll(profile, WS.storage);
}
export const FETCH_POD_IRIS_FROM_WEB_ID = stringAsIri("fetchPodIrisFromWebId");
export function useFetchPodIrisFromWebId(webId: Iri): any {
  return useSWR([webId, FETCH_POD_IRIS_FROM_WEB_ID], fetchPodIrisFromWebId);
}
