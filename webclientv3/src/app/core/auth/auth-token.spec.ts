import { AUTH_TOKEN_KEY, clearAuthToken, getAuthToken } from "./auth-token";

describe("auth-token", () => {
  beforeEach(() => localStorage.clear());

  it("uses the same storage key as the Vue app", () => {
    expect(AUTH_TOKEN_KEY).toEqual("auth-token");
  });

  it("returns null when there is no token", () => {
    expect(getAuthToken()).toEqual(null);
  });

  it("reads the token from local storage", () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "abc");

    expect(getAuthToken()).toEqual("abc");
  });

  it("clears the token", () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "abc");

    clearAuthToken();

    expect(getAuthToken()).toEqual(null);
  });
});
