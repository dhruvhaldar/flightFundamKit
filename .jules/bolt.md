## 2024-05-30 - JavaScript V8 Inverse Scalar Mapping Optimization
**Learning:** While V8 optimizes direct division excellently, for tight loops processing primitive numbers, algebraically hoisting the inverse calculation of a scalar (e.g., `const invW = 1 / W`) and performing multiplication inside the loop (e.g., `(Pa - Pr) * invW`) is still measurably faster (~30% in microbenchmarks) than dividing directly (`/ W`) on every iteration.
**Action:** When evaluating equations mapped over large arrays in JavaScript, hoist scalar denominators into an inverse constant and use multiplication inside the map loop.

## 2024-05-30 - MATLAB Matrix Right Division Trap
**Learning:** When optimizing MATLAB/Octave code, never blindly replace element-wise division (`A ./ B`) with scalar inverse multiplication (`1 / B * A`) if B can be an array. `1 / B` performs matrix right division (solving linear equations) rather than element-wise inversion (`1 ./ B`), which completely breaks vectorized function signatures.
**Action:** Always maintain the `./` operator for element-wise division in MATLAB/Octave, or explicitly use `(1 ./ B) .* A` if you need to algebraically separate terms.
