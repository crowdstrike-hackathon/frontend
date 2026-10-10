import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the Sentinel brand", () => {
  render(<App />);
  expect(screen.getAllByText(/SENTINEL/i).length).toBeGreaterThan(0);
});
