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
    
    % ⚡ Bolt Optimization: Algebraically factor calculation of Tr to avoid intermediate CL and CD matrices.
    % Tr = q * S * CD0 + (k * W^2) / (q * S) where q*S = 0.5 * S * rho * V^2
    qS = (0.5 * S) .* (rho .* V.^2);
    Tr = qS .* CD0 + (k * W.^2) ./ qS;
    
    Pr = Tr .* V;
end
