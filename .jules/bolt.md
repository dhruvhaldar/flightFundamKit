## 2024-06-06 - MATLAB Scalar Vector Multiplication Vector Allocation Overhead
**Learning:** In MATLAB/Octave, expressions like `(scalar1 * array) / scalar2` can cause performance issues because `scalar1 * array` allocates an intermediate vector. By rewriting it to group the scalars first, e.g., `(scalar1 / scalar2) * array`, you can reduce the number of N-element array allocations and math operations.
**Action:** Always algebraically group constant scalar calculations before applying them to a vector to eliminate unnecessary O(N) memory allocations and element-wise operations.
