import { Route, Routes } from "react-router";
import "./App.css";

export function App() {
  return (
    <div className="app-shell">
      <nav className="calculator-nav" aria-label="Calculators">
        <h1>TTRPG Calculators</h1>
        <p>No calculators yet — check back soon.</p>
      </nav>
      <main>
        <Routes>
          <Route
            path="/"
            element={<h2>Select a calculator to get started.</h2>}
          />
        </Routes>
      </main>
    </div>
  );
}
