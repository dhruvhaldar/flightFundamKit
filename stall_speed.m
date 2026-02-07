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

    V_stall = sqrt((2 * W) ./ (rho .* S .* CL_max));
end
