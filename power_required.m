function [Pr, Tr] = power_required(rho, V, S, CD0, k, W)
    % POWER_REQUIRED - Calculate Power Required
    %
    % Usage:
    %   [Pr, Tr] = power_required(rho, V, S, CD0, k, W)
    %
    % Inputs:
    %   rho - Air density (kg/m^3)
    %   V   - Velocity (m/s)
    %   S   - Wing area (m^2)
    %   CD0 - Zero-lift drag coefficient
    %   k   - Induced drag factor
    %   W   - Weight (N)
    %
    % Outputs:
    %   Pr  - Power Required (Watts)
    %   Tr  - Thrust Required (Newtons)
    
    % ⚡ Bolt Optimization: Algebraically expand and simplify Tr formula
    % to avoid intermediate vector allocations (q, CL, CD) and redundant operations.
    % Tr = q * S * CD0 + q * S * k * (W / (q * S))^2
    % Tr = (0.5 * rho * S * CD0) * V^2 + (2 * k * W^2 / (rho * S)) * (1 / V^2)
    % ⚡ Bolt Optimization: Group scalar operations into single constants.
    % By factoring out scalars, we reduce the number of redundant array multiplications
    % and avoid matrix right division bugs when `rho` is passed as a column vector.
    const_parasite = 0.5 * S * CD0;
    const_induced = (2 * k * W^2) / S;

    parasiteConst = const_parasite .* rho;
    inducedConst = const_induced ./ rho;
    
    V2 = V.^2;
    Tr = parasiteConst .* V2 + inducedConst ./ V2;
    Pr = Tr .* V;
end
