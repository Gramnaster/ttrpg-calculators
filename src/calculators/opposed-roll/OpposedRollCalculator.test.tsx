import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OpposedRollCalculator } from "./OpposedRollCalculator";

describe("OpposedRollCalculator", () => {
  it("renders default win probabilities for two equal sides on initial render", () => {
    render(<OpposedRollCalculator />);

    expect(screen.getByRole("status")).toHaveTextContent(/Side A wins/);
    expect(screen.getByRole("status")).toHaveTextContent(/Side B wins/);
  });

  it("updates the result when Side A's skill value changes", () => {
    render(<OpposedRollCalculator />);

    const skillAInput = screen.getByLabelText("Skill %", {
      selector: "#side-a-skill",
    });
    fireEvent.change(skillAInput, { target: { value: "100" } });

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Side A wins/);
  });

  it("shows a validation message instead of results when input is invalid", () => {
    render(<OpposedRollCalculator />);

    const skillAInput = screen.getByLabelText("Skill %", {
      selector: "#side-a-skill",
    });
    fireEvent.change(skillAInput, { target: { value: "0" } });

    expect(screen.getByRole("alert")).toHaveTextContent(/Side A skill must be/);
  });
});
