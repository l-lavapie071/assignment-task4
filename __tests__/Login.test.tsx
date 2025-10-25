import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../src/pages/Login";
import { AuthenticationContext } from "../src/context/AuthenticationContext";
import * as api from "../src/services/api";
import { Alert } from "react-native";

// Mock the API module
jest.mock("../src/services/api");

// Mock the navigation
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useIsFocused: () => true,
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock Alert
jest.spyOn(Alert, "alert");

describe("Login Screen", () => {
  const setValue = jest.fn();

  const renderLogin = () =>
    render(
      <AuthenticationContext.Provider value={{ value: null, setValue }}>
        <Login navigation={{ navigate: mockNavigate } as any} />
      </AuthenticationContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads login page with email and password fields", () => {
    const { getByPlaceholderText } = renderLogin();

    expect(getByPlaceholderText(/email/i)).toBeTruthy();
    expect(getByPlaceholderText(/password/i)).toBeTruthy();
  });

  it("shows error for Luigi and John emails", async () => {
    (api.authenticateUser as jest.Mock).mockImplementation((email) => {
      if (email === "luigi@carluccio.it" || email === "john@silva.com.br") {
        return Promise.reject({ response: { data: "Invalid email" } });
      }
      return Promise.resolve({
        data: { user: { name: "Test User" }, accessToken: "token" },
      });
    });

    const { getByText, getByLabelText } = renderLogin();

    // Luigi test
    fireEvent.changeText(getByLabelText("Email"), "luigi@carluccio.it");
    fireEvent.changeText(getByLabelText("Password"), "validpassword");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Authentication Error",
        "Invalid email",
        expect.any(Array)
      );
    });

    // John test
    fireEvent.changeText(getByLabelText("Email"), "john@silva.com.br");
    fireEvent.changeText(getByLabelText("Password"), "validpassword");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Authentication Error",
        "Invalid email",
        expect.any(Array)
      );
    });
  });

  it("logs in other users successfully", async () => {
    (api.authenticateUser as jest.Mock).mockResolvedValue({
      data: { user: { name: "Test User" }, accessToken: "token" },
    });

    const { getByText, getByLabelText } = renderLogin();

    fireEvent.changeText(getByLabelText("Email"), "anotheruser@example.com");
    fireEvent.changeText(getByLabelText("Password"), "validpassword");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => {
      expect(setValue).toHaveBeenCalledWith({ name: "Test User" });
      expect(mockNavigate).toHaveBeenCalledWith("EventsMap");
    });
  });
});
