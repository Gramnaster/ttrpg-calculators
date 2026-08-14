import { lazy, Suspense } from "react";
import { NavLink, Route, Routes } from "react-router";
import { CalculatorErrorBoundary } from "./shared/CalculatorErrorBoundary";

const OpposedRollCalculator = lazy(() => import("./calculators/opposed-roll"));
const DifferentialRollCalculator = lazy(
  () => import("./calculators/differential-roll"),
);
const TorRollCalculator = lazy(() => import("./calculators/tor-roll"));
const ComplexArmourCalculator = lazy(
  () => import("./calculators/complex-armour"),
);

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "block border-l-2 px-3 py-2 text-sm font-medium tracking-wide uppercase outline-none transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    isActive
      ? "border-accent text-accent"
      : "border-transparent text-ink-muted hover:border-rule hover:text-ink",
  ].join(" ");

export function App() {
  return (
    <div className="mx-auto grid min-h-svh w-full max-w-7xl grid-cols-[240px_1fr]">
      <nav
        aria-label="Calculators"
        className="flex flex-col gap-8 border-r border-rule px-6 py-8"
      >
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
            TTRPG Calculators
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Dice &amp; probability tools for tabletop RPGs.
          </p>
        </div>
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink
              to="/opposed-roll"
              viewTransition
              className={navLinkClassName}
            >
              Opposed Roll
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/differential-roll"
              viewTransition
              className={navLinkClassName}
            >
              Differential Roll
            </NavLink>
          </li>
          <li>
            <NavLink to="/tor-roll" viewTransition className={navLinkClassName}>
              TOR Roll
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/complex-armour"
              viewTransition
              className={navLinkClassName}
            >
              Complex Armour
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="flex items-start justify-center px-8 py-10">
        <Routes>
          <Route
            path="/"
            element={
              <h2 className="font-display text-lg text-ink-muted">
                Select a calculator to get started.
              </h2>
            }
          />
          <Route
            path="/opposed-roll"
            element={
              <CalculatorErrorBoundary>
                <Suspense
                  fallback={
                    <p className="text-ink-muted">Loading calculator…</p>
                  }
                >
                  <OpposedRollCalculator />
                </Suspense>
              </CalculatorErrorBoundary>
            }
          />
          <Route
            path="/differential-roll"
            element={
              <CalculatorErrorBoundary>
                <Suspense
                  fallback={
                    <p className="text-ink-muted">Loading calculator…</p>
                  }
                >
                  <DifferentialRollCalculator />
                </Suspense>
              </CalculatorErrorBoundary>
            }
          />
          <Route
            path="/tor-roll"
            element={
              <CalculatorErrorBoundary>
                <Suspense
                  fallback={
                    <p className="text-ink-muted">Loading calculator…</p>
                  }
                >
                  <TorRollCalculator />
                </Suspense>
              </CalculatorErrorBoundary>
            }
          />
          <Route
            path="/complex-armour"
            element={
              <CalculatorErrorBoundary>
                <Suspense
                  fallback={
                    <p className="text-ink-muted">Loading calculator…</p>
                  }
                >
                  <ComplexArmourCalculator />
                </Suspense>
              </CalculatorErrorBoundary>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
