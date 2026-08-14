import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ComplexArmourCalculator } from "./ComplexArmourCalculator";

function equip(itemId: string) {
  const select = screen.getByLabelText("Armour Piece");
  fireEvent.change(select, { target: { value: itemId } });
  fireEvent.click(screen.getByRole("button", { name: "Equip" }));
}

describe("ComplexArmourCalculator", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows zero coverage across all 25 hit locations with no loadout", () => {
    render(<ComplexArmourCalculator />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "0 pieces equipped, covering 0 of 25 hit locations.",
    );
  });

  it("switches the Armour Piece options when a different Armour Type is chosen", () => {
    render(<ComplexArmourCalculator />);

    expect(
      screen.queryByRole("option", { name: "Mail Hauberk" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Armour Type"), {
      target: { value: "Mail" },
    });

    expect(
      screen.getByRole("option", { name: "Mail Hauberk" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Hood" }),
    ).not.toBeInTheDocument();
  });

  it("updates hit location coverage after equipping an item from the picker", () => {
    render(<ComplexArmourCalculator />);

    equip("hood"); // covers Sk, Nk -- a hood doesn't cover the face

    expect(screen.getByRole("status")).toHaveTextContent(
      "1 piece equipped, covering 2 of 25 hit locations.",
    );
  });

  it("shows the conflict message and leaves the loadout unchanged on a blocked equip", () => {
    render(<ComplexArmourCalculator />);
    equip("tunic"); // Cloth/Clothing @ Th, covers 8 locations

    equip("shirt"); // also Cloth/Clothing @ Th -- conflicts with Tunic

    expect(screen.getByRole("alert")).toHaveTextContent(/Tunic/);
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 piece equipped, covering 8 of 25 hit locations.",
    );
  });

  it("removes an item's contribution from coverage after unequipping it", () => {
    render(<ComplexArmourCalculator />);
    equip("hood");

    fireEvent.click(screen.getByRole("button", { name: "Unequip Hood" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "0 pieces equipped, covering 0 of 25 hit locations.",
    );
  });

  it("persists the loadout across a remount via localStorage", () => {
    const { unmount } = render(<ComplexArmourCalculator />);
    equip("hood");
    unmount();

    render(<ComplexArmourCalculator />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "1 piece equipped, covering 2 of 25 hit locations.",
    );
    expect(
      screen.getByRole("button", { name: "Unequip Hood" }),
    ).toBeInTheDocument();
  });
});
