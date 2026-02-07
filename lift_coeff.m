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
    
    q = 0.5 * rho .* V.^2; % Dynamic pressure
    CL = W ./ (q * S);
end
