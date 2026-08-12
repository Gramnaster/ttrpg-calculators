import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TorRollCalculator } from "./TorRollCalculator";

describe("TorRollCalculator", () => {
  it("renders the outcome breakdown for the default roll", () => {
    render(<TorRollCalculator />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Any success/);
    expect(status).toHaveTextContent(/Failure/);
    expect(status).toHaveTextContent(/Success \(0 icons\)/);
    expect(status).toHaveTextContent(/Great success \(1 icon\)/);
    expect(status).toHaveTextContent(/Extraordinary \(2\+ icons\)/);
  });

  it("updates the result when the rating changes", () => {
    render(<TorRollCalculator />);

    const before = screen.getByRole("status").textContent;
    const ratingInput = screen.getByLabelText("Rating");
    fireEvent.change(ratingInput, { target: { value: "6" } });

    expect(screen.getByRole("status").textContent).not.toBe(before);
  });

  it("hides the reference grid and zeroes failure when Magical Success is enabled", () => {
    render(<TorRollCalculator />);

    fireEvent.click(screen.getByLabelText(/Magical Success/));

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const failureLabel = screen.getByText("Failure");
    expect(failureLabel.nextElementSibling).toHaveTextContent("0.00%");
  });

  it("shows a validation message instead of results when the rating is out of range", () => {
    render(<TorRollCalculator />);

    const ratingInput = screen.getByLabelText("Rating");
    fireEvent.change(ratingInput, { target: { value: "10" } });

    expect(screen.getByRole("alert")).toHaveTextContent(/Rating must be/);
  });

  it("marks the grid cell matching the current Target Number and Success Dice pool", () => {
    render(<TorRollCalculator />);

    // Default rating 2 / attribute 7 / base 20 -> TN 13, pool 2.
    const rows = screen.getAllByRole("row");
    const currentRow = rows.find((row) => row.textContent?.includes("TN 13"));
    expect(currentRow).toBeDefined();

    const currentCell = within(currentRow as HTMLElement)
      .getAllByRole("cell")
      .find((cell) => cell.getAttribute("aria-current") === "true");
    expect(currentCell).toBeDefined();
  });
});
