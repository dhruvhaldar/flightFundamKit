function CL = lift_coeff(W, rho, V, S)
    % LIFT_COEFF - Calculate Lift Coefficient
    %
    % Usage:
    %   CL = lift_coeff(W, rho, V, S)
    %
    % Inputs:
    %   W   - Aircraft weight (Newtons)
    %   rho - Air density (kg/m^3)
    %   V   - Velocity (m/s)
    %   S   - Wing surface area (m^2)
    %
    % Outputs:
    %   CL  - Lift coefficient
    
    % ⚡ Bolt Optimization: Algebraically expand and simplify CL formula
    % to avoid intermediate vector allocation (q) and redundant operations.
    % CL = W / (0.5 * rho * V^2 * S) = (2 * W / (rho * S)) / V^2
    % Additionally group the scalar math (2 * W / S) first to avoid
    % an element-wise multiplication vector allocation for rho .* S.
    % Finally, group the array denominators to replace one element-wise
    % array division with an element-wise multiplication, which is faster.
    scalar_part = (2 * W) / S;
    CL = scalar_part ./ (rho .* (V.^2));
end
