function V_stall = stall_speed(W, rho, S, CL_max)
    % STALL_SPEED - Calculate stall speed
    %
    % Usage:
    %   V_stall = stall_speed(W, rho, S, CL_max)
    %
    % Inputs:
    %   W      - Aircraft weight (Newtons)
    %   rho    - Air density (kg/m^3)
    %   S      - Wing surface area (m^2)
    %   CL_max - Maximum lift coefficient
    %
    % Outputs:
    %   V_stall - Stall speed (m/s)

    % ⚡ Bolt Optimization: Group invariant factors to reduce element-wise division complexity
    const_factor = (2 .* W) ./ (S .* CL_max);
    V_stall = sqrt(const_factor ./ rho);
end
