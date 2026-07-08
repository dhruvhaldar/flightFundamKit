## 2024-05-24 - Implicit Expansion vs Explicit Matrix Allocation in MATLAB/Octave
**Learning:** When performing element-wise arithmetic operations between vectors (e.g., column vector) and matrices, explicitly expanding the vector into a matrix (e.g., using `ones()`) before the operation is much slower and uses more memory than simply relying on MATLAB/Octave's native implicit expansion (broadcasting) feature.
**Action:** Avoid explicit dimension matching using `repmat` or `ones()` when applying operations across different dimensions. Trust and utilize implicit expansion for better performance.
## 2024-07-08 - Implicit Expansion for Matrix Operations
**Learning:** In MATLAB/Octave, using explicit `ones()` matrices to duplicate arrays for vectorized calculations creates unnecessary memory allocation and copy overhead. Octave/MATLAB has support for implicit expansion (broadcasting) where array sizes mismatch but can be broadcast element-wise.
**Action:** Replace `ones()` padding logic with direct element-wise evaluation using implicit expansion, reducing execution time and saving memory.
