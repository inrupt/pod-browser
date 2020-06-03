import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import { login } from "../../../lib/solid-auth-fetcher/dist";

import getProviders from "../../../constants/provider";
import getConfig from "../../../constants/config";

import ProviderLogin, { loginWithProvider } from "./index";

jest.mock("../../../lib/solid-auth-fetcher/dist");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = shallow(<ProviderLogin />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("loginWithProvider", () => {
  test("Calls login with clientId if useClientId is true", async () => {
    const oidcIssuer = getProviders()[0];
    const clientId = getConfig().idpClientId;

    await loginWithProvider({
      ...oidcIssuer,
      useClientId: true,
    });

    expect(login).toHaveBeenCalledWith({
      clientId,
      oidcIssuer: oidcIssuer.value,
      redirect: "/loginSuccess",
    });
  });

  test("Calls login without clientId if useClientId is true", async () => {
    const oidcIssuer = getProviders()[0];
    const clientId = getConfig().idpClientId;

    await loginWithProvider({
      ...oidcIssuer,
      useClientId: false,
    });

    expect(login).toHaveBeenCalledWith({
      oidcIssuer: oidcIssuer.value,
      redirect: "/loginSuccess",
    });
  });
});
