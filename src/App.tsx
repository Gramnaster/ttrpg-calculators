import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router";
import "./App.css";
import { CalculatorErrorBoundary } from "./shared/CalculatorErrorBoundary";

const OpposedRollCalculator = lazy(() => import("./calculators/opposed-roll"));

export function App() {
  return (
    <div className="app-shell">
      <nav className="calculator-nav" aria-label="Calculators">
        <h1>TTRPG Calculators</h1>
        <ul>
          <li>
            <Link to="/opposed-roll" viewTransition>
              Opposed Roll
            </Link>
          </li>
        </ul>
      </nav>
      <main>
        <Routes>
          <Route
            path="/"
            element={<h2>Select a calculator to get started.</h2>}
          />
          <Route
            path="/opposed-roll"
            element={
              <CalculatorErrorBoundary>
                <Suspense fallback={<p>Loading calculator…</p>}>
                  <OpposedRollCalculator />
                </Suspense>
              </CalculatorErrorBoundary>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
