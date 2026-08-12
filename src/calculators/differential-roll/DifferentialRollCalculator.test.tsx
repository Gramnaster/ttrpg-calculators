import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DifferentialRollCalculator } from "./DifferentialRollCalculator";

describe("DifferentialRollCalculator", () => {
  it("renders Parry vs. Attack outcomes by default", () => {
    render(<DifferentialRollCalculator />);

    expect(screen.getByRole("status")).toHaveTextContent(/Parry Succeeds/);
    expect(screen.getByRole("status")).not.toHaveTextContent(
      /Both Attacks Hit/,
    );
  });

  it("switches to Counter vs. Attack outcomes when that mode is selected", () => {
    render(<DifferentialRollCalculator />);

    fireEvent.click(screen.getByLabelText("Counter vs. Attack"));

    expect(screen.getByRole("status")).toHaveTextContent(/Both Attacks Hit/);
    expect(screen.getByRole("status")).not.toHaveTextContent(/Parry Succeeds/);
  });

  it("colors a successful parry green even when the attacker still wins the SE exchange", () => {
    render(<DifferentialRollCalculator />);

    const rows = screen.getAllByRole("row");
    const defenderSuccessRow = rows.find((row) =>
      row.textContent?.includes("Defender Success"),
    );
    expect(defenderSuccessRow).toBeDefined();
    const cells = within(defenderSuccessRow as HTMLElement).getAllByRole(
      "cell",
    );
    // Attacker Critical is the first data column.
    const attackerCriticalCell = cells[0];

    expect(attackerCriticalCell).toHaveTextContent(/Parry Succeeds/);
    expect(attackerCriticalCell).toHaveTextContent(/Attacker 1 SE/);
    expect(attackerCriticalCell.className).toMatch(/favor-soft/);
    expect(attackerCriticalCell.className).not.toMatch(/accent-soft/);
  });

  it("shows a validation message instead of results when attacker input is invalid", () => {
    render(<DifferentialRollCalculator />);

    const attackerSkillInput = screen.getByLabelText("Skill %", {
      selector: "#differential-attacker-skill",
    });
    fireEvent.change(attackerSkillInput, { target: { value: "0" } });

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Attacker skill must be/,
    );
  });
});
