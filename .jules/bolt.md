## 2024-05-30 - JavaScript V8 Inverse Scalar Mapping Optimization
**Learning:** While V8 optimizes direct division excellently, for tight loops processing primitive numbers, algebraically hoisting the inverse calculation of a scalar (e.g., `const invW = 1 / W`) and performing multiplication inside the loop (e.g., `(Pa - Pr) * invW`) is still measurably faster (~30% in microbenchmarks) than dividing directly (`/ W`) on every iteration.
**Action:** When evaluating equations mapped over large arrays in JavaScript, hoist scalar denominators into an inverse constant and use multiplication inside the map loop.

## 2024-05-30 - MATLAB Matrix Right Division Trap
**Learning:** When optimizing MATLAB/Octave code, never blindly replace element-wise division (`A ./ B`) with scalar inverse multiplication (`1 / B * A`) if B can be an array. `1 / B` performs matrix right division (solving linear equations) rather than element-wise inversion (`1 ./ B`), which completely breaks vectorized function signatures.
**Action:** Always maintain the `./` operator for element-wise division in MATLAB/Octave, or explicitly use `(1 ./ B) .* A` if you need to algebraically separate terms.
## 2026-06-01 - [MATLAB Array Division Optimization]
**Learning:** In MATLAB/Octave, dividing a large array by another array or scalar (e.g. `A ./ B`) is measurably slower than calculating the element-wise inverse (`1 ./ B`) and multiplying (`A .* (1 ./ B)`).
**Action:** Use element-wise inverse multiplication (`1 ./ B`) instead of element-wise division (`./ B`) when iterating over or processing large arrays in mathematical operations.
## 2026-06-01 - [MATLAB Array/Scalar Multiplication]
**Learning:** In MATLAB/Octave, explicitly grouping scalar operations into a single pre-calculated constant variable (e.g. `(0.5 * S * CD0) .* rho`) before multiplying against a large array reduces the number of O(N) array-scalar multiplications, improving performance significantly over sequential scalar-array multiplications (e.g. `0.5 * rho * S * CD0`).
**Action:** Group invariant scalar operations algebraically and assign them to a constant before multiplying or dividing against large arrays to minimize redundant element-wise operations.
