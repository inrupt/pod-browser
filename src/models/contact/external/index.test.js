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

import { getThing, mockThingFrom, setUrl } from "@inrupt/solid-client";
import { EXTERNAL_CONTACT } from "./index";
import {
  aliceName,
  alicePhoto,
  aliceWebIdUrl,
  mockPersonDatasetAlice,
} from "../../../../__testUtils/mockPersonResource";

const dataset = mockPersonDatasetAlice();
const thing = getThing(dataset, aliceWebIdUrl);
const contact = {
  dataset,
  thing,
  type: EXTERNAL_CONTACT,
};

describe("EXTERNAL_CONTACT", () => {
  describe("isOfType", () => {
    it("checks whether thing is of type vcard.Individual", () => {
      expect(EXTERNAL_CONTACT.isOfType(thing)).toBe(true);
    });
  });

  describe("getOriginalUrl", () => {
    it("returns the original URL", () => {
      expect(EXTERNAL_CONTACT.getOriginalUrl(contact)).toEqual(aliceWebIdUrl);
    });
  });

  describe("getName", () => {
    it("returns name for contact", () =>
      expect(EXTERNAL_CONTACT.getName(contact)).toEqual(aliceName));
  });

  describe("getAvatarProps", () => {
    it("returns props for Avatar component", () => {
      expect(EXTERNAL_CONTACT.getAvatarProps(contact)).toEqual({
        icon: "user",
        src: alicePhoto,
      });
    });
  });
});
