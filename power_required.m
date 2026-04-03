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
    
    % Combine formulas to reduce matrix allocations and element-wise operations:
    % q = 0.5 * rho * V^2
    % CL = W / (q * S)
    % CD = CD0 + k * CL^2
    % Tr = q * S * CD = q * S * (CD0 + k * (W / (q * S))^2)
    % Tr = q * S * CD0 + k * W^2 / (q * S)

    qS = (0.5 * rho * S) .* V.^2;
    Tr = qS .* CD0 + (k * W.^2) ./ qS;
    
    Pr = Tr .* V;
end
