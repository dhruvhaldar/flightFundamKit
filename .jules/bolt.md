## 2025-06-03 - Vectorized Aerodynamic Computations
**Learning:** Functions in `frontend/utils/flightMechanics.ts` like `powerRequired` and `stdAtm` are designed to handle array inputs ("vectorized"). However, usage in components like `PerformanceCharts.tsx` was looping over scalar values, leading to significant overhead (8x slower in benchmarks).
**Action:** When working with flight mechanics calculations in charts or loops, always check if the utility function supports array inputs and use them instead of manual iteration.

## 2025-06-03 - Hoisting Physics Constants
**Learning:** React components (like `PerformanceCharts`) often recalculate physics models (e.g., `stdAtm`) inside `useMemo` on every render, even when inputs are constant (e.g., standard altitudes). This redundant calculation can be avoided by hoisting these calls to module scope.
**Action:** Always check if heavy calculations depend only on module-level constants and move them outside the component definition.

## 2025-06-03 - Flight Mechanics Constants Optimization
**Learning:** `stdAtm` function was redefining multiple constants (T0, P0, g, etc.) and recalculating derived values (exponents) on every call. Hoisting these to module scope and pre-calculating invariant constants reduced execution time by ~39% in benchmarks.
**Action:** When implementing mathematical models or physics simulations, always hoist constant definitions and pre-calculate invariant derived values to avoid redundant computation.

## 2025-06-03 - [Optimized Physics Loop]
**Learning:** Re-calculating intermediate physics variables (CL, CD, q) inside a loop is wasteful when only the final result is needed. By algebraically simplifying the model into constants (parasite & induced power terms) outside the loop, we reduced operations per iteration from ~15 to ~5.
**Action:** Always look for algebraic simplifications in tight loops, especially when physics constants can be pre-calculated.

## 2025-06-03 - Analytical vs. Numerical Optimization
**Learning:** Iterative loops (brute-force search) were used to find maxima (e.g., max Rate of Climb) in `PerformanceCharts.tsx`. This is O(N) where N is the number of steps. Replacing this with an analytical solution (derivative of power curve) reduced complexity to O(1) and improved accuracy by eliminating discretization errors.
**Action:** Always check if a loop-based optimization (finding min/max) can be replaced by a direct analytical solution, especially for well-defined physics models like drag polars.

## 2025-06-03 - Scalar vs Array Allocation in Vectorized Functions
**Learning:** Functions designed to handle both scalar and array inputs (e.g., `stdAtm`) often default to wrapping scalars in an array and using `.map()`, causing unnecessary allocation and iteration overhead. Optimizing these functions to handle scalar inputs directly (without array wrapping) improved performance by ~4.5x for single-value calls.
**Action:** When implementing or using dual-mode (scalar/vector) utility functions, always add a dedicated code path for scalar inputs to avoid the overhead of array creation and iteration.

## 2025-06-03 - Next.js Lazy Loading for Heavy Components
**Learning:** Large libraries like `recharts` significantly increase the initial JavaScript bundle size. Using `next/dynamic` to lazy load components that depend on these libraries (especially those not immediately visible, like in tabs) reduces the initial load time.
**Action:** Always check if heavy components can be lazy loaded, especially if they are behind user interaction (e.g., tabs, modals).

## 2025-10-27 - [Optimized String Allocation in Loops]
**Learning:** Using `Number(val.toFixed(2))` inside a loop (e.g., for charting data) creates string allocations and parsing overhead that is significantly slower (~150x in benchmarks) than `Math.round(val * 100) / 100`.
**Action:** When formatting numbers for data visualization arrays, prefer mathematical rounding over string-based formatting to avoid garbage collection pressure.

## 2025-06-03 - [Optimized Math Functions]
**Learning:** `Math.pow(x, 0.25)` is significantly slower (~30x in micro-benchmarks) than `Math.sqrt(Math.sqrt(x))`.
**Action:** When calculating 4th roots (or other powers of 2 roots), chain `Math.sqrt` calls instead of using `Math.pow`.

## 2025-10-28 - [Physics Math & Allocation Optimization]
**Learning:** Pre-computing inverse constants (e.g., `1/T0`) to replace division with multiplication in high-frequency physics models like `stdAtm` yielded a ~2x speedup. Additionally, refactoring utility functions to handle mixed scalar/array inputs without temporary array allocations (`rateOfClimb`) reduced GC pressure.
**Action:** Pre-compute inverse constants for division-heavy formulas and implement specific branches for mixed scalar/vector inputs to avoid unnecessary array allocation.

## 2025-02-28 - Recharts Animation Performance in React 19
**Learning:** Recharts SVG animations (`react-smooth`) cause significant CPU overhead and can fail to render paths completely in React 19 due to `useEffect` timing differences, leaving only dots visible on `LineChart`s. Disabling these animations reduces Time to Interactive (TTI) significantly.
**Action:** Always add `isAnimationActive={false}` to Recharts components (like `<Line>`) when using React 19 to improve rendering performance and ensure correct visual output.

## 2025-06-03 - [Single-Pass Array Generation & Analysis]
**Learning:** Generating an array of data in `useMemo` and then using subsequent `useMemo` blocks to analyze it (e.g., using `.reduce` to find max, or `.filter` to find limits) forces multiple O(N) traversals and array allocations. Combining generation and analysis into a single pass avoids this.
**Action:** When generating data arrays for charts that also require derived statistics (min/max/limits), compute and track these statistics inside the same generation loop to avoid redundant array traversals.

## 2025-10-28 - [Array Pre-allocation over Map]
**Learning:** Using `.map()` to iterate over arrays in vectorized functions creates unnecessary function call overhead and GC pressure. Replacing `.map()` with pre-allocated arrays (`new Array(len)`) and simple `for` loops resulted in ~4x execution speedup in some vectorized physics functions.
**Action:** In high-frequency, math-heavy vectorized utility functions, prefer pre-allocating arrays and using `for` loops instead of using Array `.map()`.

## 2025-06-03 - [Replacing Loop-Variant Divisions with Inverse Multiplication]
**Learning:** In vectorized mathematical computations inside a loop (like iterating through arrays of velocities), repeatedly performing divisions (e.g. `const inv_v2 = x / (v * v)`) incurs measurable overhead. Replacing these operations with a single inverse division computation (`const inv_v = 1 / v`) and subsequent multiplication operations was found to provide a speedup in benchmarks (e.g. ~10-15% for complex iterations, and ~2x when the denominator is completely loop-invariant).
**Action:** When performing multiple divisions involving the same varying denominator inside a loop, compute its inverse once per iteration and multiply instead. For loop-invariant denominators, hoist the inverse computation entirely out of the loop.

## 2025-06-03 - [Hoisting Loop-Invariant Physics Variables]
**Learning:** Re-calculating loop-invariant values (like `1 / W`) inside a physics calculation loop creates unnecessary operations. Hoisting these calculations outside the loop replaces repeated divisions with a single multiplication inside the loop, improving performance.
**Action:** Always identify values that do not change during an iteration (e.g. `1 / W` when iterating over altitudes or speeds) and pre-calculate them outside the loop.

## 2025-10-28 - [Factoring and Hoisting Math.sqrt in Loops]
**Learning:** `Math.sqrt(A * B)` evaluated inside a loop where `A` is invariant but `B` changes per iteration can be algebraically factored into `Math.sqrt(A) * Math.sqrt(B)`. If `Math.sqrt(B)` can be pre-computed alongside other variant data, this allows `Math.sqrt(A)` to be hoisted out of the loop entirely, replacing an expensive loop-bound root calculation with a simple multiplication.
**Action:** When a loop contains expensive math functions (like `Math.sqrt`) wrapping a product of invariant and variant variables, factor the equation to hoist the invariant portion outside the loop and pre-calculate the variant portion if possible.

## 2025-06-03 - [Algebraic Distribution out of Loops]
**Learning:** In calculations where a loop evaluates an expression and then multiplies the result by a loop-invariant value (e.g., `(Pa - Pr) * inv_W`), you can algebraically distribute the invariant multiplication into the constants used to compute `Pa` and `Pr` before the loop starts. This transforms the operation inside the loop from subtraction and multiplication to just subtraction, yielding measurable performance improvements (~48% faster in benchmarks).
**Action:** Always check if mathematical operations applied to the final result of a loop iteration can be algebraically factored into the constants outside the loop.

## 2024-05-15 - [Direct Division vs Inverse Multiplication in V8]
**Learning:** The optimization of calculating an inverse variable (e.g., `const inv_v = 1 / v`) and then multiplying (e.g., `x * inv_v`) to avoid repeated division is an anti-pattern in modern V8 engines for simple operations. Benchmarks in Node.js v22.22.0 showed that performing direct division (`x / v`) is roughly 2x faster than the inverse-and-multiply approach inside hot loops because the JIT compiler is highly optimized for direct division and avoids the intermediate variable allocation/lookup.
**Action:** Do not replace simple repeated divisions with an `inv_var` multiplied inversion pattern in hot loops; use direct division.

## 2025-03-15 - [Pre-calculate redundant math inside iteration]
**Learning:** Inside `powerRequired` utility, calculating `v * v * v` for Pr and `v * v` for CL led to a redundant multiplication. Pre-calculating `v2 = v * v` outside those calculations reduced the number of multiplication operations per iteration, leading to measurable performance boost in V8.
**Action:** Always look for common sub-expressions inside hot loops (like `v*v`) and assign them to a local variable.

## 2025-10-28 - [Function Inlining in Vectorized Loops]
**Learning:** Calling an external helper function (e.g. `calculateStdAtm`) inside a hot loop traversing large arrays causes measurable function call overhead, even in modern JS engines. Inlining the helper logic directly into the loop, along with pre-computing partial inverse constants (e.g. `INV_R = 1 / R` replacing `P / (R * T)` with `(P * INV_R) / T`), yielded a ~2.5x performance speedup in benchmarks.
**Action:** Always inline small, repeatedly called helper logic into vectorized loops instead of abstracting it, and partially pre-compute invariant portions of complex denominators to reduce operations per iteration.

## 2025-06-03 - [Hoisting Piecewise Constants]
**Learning:** For piecewise continuous physics models (like the Standard Atmosphere), certain variables become constant in specific regions (e.g., temperature in the stratosphere). Any dependent complex operations (like `Math.sqrt` for speed of sound) should be pre-calculated outside the array processing loop for that region. Benchmarks showed replacing the repeated `Math.sqrt` inside the stratosphere `if` branch with a pre-calculated constant reduced execution time by ~60% for high-altitude arrays.
**Action:** When iterating over arrays in piecewise models, always identify regions where input variables become constant and pre-calculate any dependent expensive math operations (like `Math.sqrt` or `Math.log`) outside the loop.

## 2025-06-03 - [Algebraic Distribution of Logarithmic Constants]
**Learning:** In exponential calculations involving logarithms like `Math.exp(A * Math.log(B * C))` where `C` is a loop-invariant constant, `C` can be algebraically factored out using logarithm rules: `Math.log(B) + Math.log(C)`. This allows pre-calculating the invariant portion `Math.exp(A * Math.log(C))` outside the loop, saving one multiplication per iteration. In micro-benchmarks for `stdAtm`, this optimization yielded ~30% faster execution.
**Action:** When working with exponential and logarithmic formulas inside loops, always check if invariant multipliers can be algebraically distributed and hoisted out as pre-calculated constants.

## 2025-10-29 - [Algebraic Reordering in Hot Loops]
**Learning:** When calculating dependent mathematical variables inside hot loops, algebraically reordering the sequence of operations to compute the lower-degree/simpler term first (e.g., Thrust using `v^2`) and deriving the higher-degree term from it (e.g., Power = Thrust * `v`) eliminates unnecessary higher-order exponentiations (like `v^3`) and divisions per iteration. In benchmarks, this yielded a measurable speedup.
**Action:** When dealing with multiple dependent calculations inside a loop, always check if reordering them starting from the simplest algebraic form avoids redundant exponentiation or division.
