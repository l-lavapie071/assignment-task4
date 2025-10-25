import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../src/pages/Login";
import { AuthenticationContext } from "../src/context/AuthenticationContext";
import * as api from "../src/services/api";
import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native";
import * as caching from "../src/services/caching";

// --- Mocks ---
// Mock API
jest.mock("../src/services/api");
const mockAuthenticateUser = api.authenticateUser as jest.Mock;

// Mock caching
jest.spyOn(caching, "getFromCache").mockResolvedValue(undefined);
jest.spyOn(caching, "setInCache").mockResolvedValue(undefined);

// Mock Alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

// Mock navigation
const mockNavigate = jest.fn();

// Helper to render Login with context and navigation
const renderLogin = () =>
  render(
    <AuthenticationContext.Provider
      value={{ value: null, setValue: jest.fn() }}
    >
      <NavigationContainer>
        <Login navigation={{ navigate: mockNavigate } as any} />
      </NavigationContainer>
    </AuthenticationContext.Provider>
  );

describe("Login Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const users = [
    { email: "luigi@carluccio.it" },
    { email: "john@silva.com.br" },
    { email: "mario@example.com" },
  ];

  users.forEach(({ email }) => {
    it(`logs in successfully for ${email}`, async () => {
      // Mock API always resolves now
      mockAuthenticateUser.mockResolvedValueOnce({
        data: {
          user: { id: 1, email },
          accessToken: "token123",
        },
      });

      const { getByText, getByTestId } = renderLogin();

      fireEvent.changeText(getByTestId("email-input"), email);
      fireEvent.changeText(getByTestId("password-input"), "validpassword");
      fireEvent.press(getByText(/log in/i));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("EventsMap");
      });
    });
  });
});
