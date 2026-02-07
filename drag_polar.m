function CD = drag_polar(CL, CD0, k)
    % DRAG_POLAR - Calculate Drag Coefficient from Lift Coefficient
    %
    % Usage:
    %   CD = drag_polar(CL, CD0, k)
    %
    % Inputs:
    %   CL  - Lift Coefficient (scalar or vector)
    %   CD0 - Zero-lift drag coefficient
    %   k   - Induced drag factor (1 / (pi * e * AR))
    %
    % Outputs:
    %   CD  - Drag Coefficient

    CD = CD0 + k * CL.^2;
end
