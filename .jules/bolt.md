## 2024-05-30 - JavaScript V8 Inverse Scalar Mapping Optimization
**Learning:** While V8 optimizes direct division excellently, for tight loops processing primitive numbers, algebraically hoisting the inverse calculation of a scalar (e.g., `const invW = 1 / W`) and performing multiplication inside the loop (e.g., `(Pa - Pr) * invW`) is still measurably faster (~30% in microbenchmarks) than dividing directly (`/ W`) on every iteration.
**Action:** When evaluating equations mapped over large arrays in JavaScript, hoist scalar denominators into an inverse constant and use multiplication inside the map loop.

## 2024-05-30 - MATLAB Matrix Right Division Trap
**Learning:** When optimizing MATLAB/Octave code, never blindly replace element-wise division (`A ./ B`) with scalar inverse multiplication (`1 / B * A`) if B can be an array. `1 / B` performs matrix right division (solving linear equations) rather than element-wise inversion (`1 ./ B`), which completely breaks vectorized function signatures.
**Action:** Always maintain the `./` operator for element-wise division in MATLAB/Octave, or explicitly use `(1 ./ B) .* A` if you need to algebraically separate terms.
## 2026-06-01 - [MATLAB Inverse Array Multiplication Anti-Pattern]
**Learning:** In MATLAB/Octave, replacing direct element-wise division (`A ./ B`) with element-wise inversion and multiplication (`A .* (1 ./ B)`) is an anti-optimization. It forces the allocation of an intermediate array for the inverted values and adds unnecessary mathematical operations, degrading performance compared to native direct division.
**Action:** Always prefer direct element-wise division (`A ./ B`) over algebraically hoisted inversion in MATLAB/Octave code to avoid unnecessary allocations and operation overhead.
## 2026-06-01 - [MATLAB Array/Scalar Multiplication]
**Learning:** In MATLAB/Octave, explicitly grouping scalar operations into a single pre-calculated constant variable (e.g. `(0.5 * S * CD0) .* rho`) before multiplying against a large array reduces the number of O(N) array-scalar multiplications, improving performance significantly over sequential scalar-array multiplications (e.g. `0.5 * rho * S * CD0`).
**Action:** Group invariant scalar operations algebraically and assign them to a constant before multiplying or dividing against large arrays to minimize redundant element-wise operations.
