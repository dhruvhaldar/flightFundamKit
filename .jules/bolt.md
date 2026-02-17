## 2025-06-03 - Vectorized Aerodynamic Computations
**Learning:** Functions in `frontend/utils/flightMechanics.ts` like `powerRequired` and `stdAtm` are designed to handle array inputs ("vectorized"). However, usage in components like `PerformanceCharts.tsx` was looping over scalar values, leading to significant overhead (8x slower in benchmarks).
**Action:** When working with flight mechanics calculations in charts or loops, always check if the utility function supports array inputs and use them instead of manual iteration.

## 2025-06-03 - Hoisting Physics Constants
**Learning:** React components (like `PerformanceCharts`) often recalculate physics models (e.g., `stdAtm`) inside `useMemo` on every render, even when inputs are constant (e.g., standard altitudes). This redundant calculation can be avoided by hoisting these calls to module scope.
**Action:** Always check if heavy calculations depend only on module-level constants and move them outside the component definition.
