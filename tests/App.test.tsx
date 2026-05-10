import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";

describe("App", () => {
  it("renders the core screening surfaces", () => {
    render(<App />);

    expect(screen.getByText("Scénario seed de référence")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Agent Assistant Recrutement" }),
    ).toBeTruthy();
    expect(screen.queryByText("Classement des candidatures")).toBeNull();
  });
});
