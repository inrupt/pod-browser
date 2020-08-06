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

import { createContext, ReactElement } from "react";
import useAuthenticatedProfile from "../../hooks/useAuthenticatedProfile";
import usePodRoot from "../../hooks/usePodRoot";

export interface PodLocation {
  baseUri?: string | null;
  currentUri: string;
}

const PodLocationContext = createContext<PodLocation>({
  currentUri: "",
});

interface Props {
  children: ReactElement | ReactElement[] | undefined;
  currentUri: string;
}

function PodLocationProvider({ children, currentUri }: Props): ReactElement {
  const profile = useAuthenticatedProfile();
  const baseUri = usePodRoot(currentUri, profile);
  return (
    <PodLocationContext.Provider value={{ baseUri, currentUri }}>
      {children}
    </PodLocationContext.Provider>
  );
}

export { PodLocationProvider };
export default PodLocationContext;
