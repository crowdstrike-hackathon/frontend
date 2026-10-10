import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the Sentinel brand", async () => {
  render(<App />);
  const brand = await screen.findAllByText(/SENTINEL/i);
  expect(brand.length).toBeGreaterThan(0);
});
