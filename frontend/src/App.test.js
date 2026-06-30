import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

test("renders CareerOS landing headline", () => {
  render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  );
  expect(screen.getByText(/CareerOS/i)).toBeInTheDocument();
  expect(screen.getByText(/AI career operating system/i)).toBeInTheDocument();
});
