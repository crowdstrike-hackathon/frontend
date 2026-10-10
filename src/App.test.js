import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the Riposte brand", async () => {
  render(<App />);
  const brand = await screen.findAllByText(/RIPOSTE/i);
  expect(brand.length).toBeGreaterThan(0);
});
