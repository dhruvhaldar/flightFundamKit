function R = range_breguet(Wi, Wf, CL, CD, SFC, V, is_prop, eta)
    % RANGE_BREGUET - Calculate Range using Breguet Range Equation
    %
    % Usage:
    %   R = range_breguet(Wi, Wf, CL, CD, SFC, V, is_prop, eta)
    %
    % Inputs:
    %   Wi      - Initial weight (N)
    %   Wf      - Final weight (N)
    %   CL      - Lift Coefficient
    %   CD      - Drag Coefficient
    %   SFC     - Specific Fuel Consumption
    %             For Prop: Power SFC (N / (W * s) or 1/m)
    %             For Jet:  Thrust SFC (N / (N * s) or 1/s)
    %   V       - Velocity (m/s) (Required for Jet, ignored for Prop if eta provided)
    %   is_prop - Boolean (true for propeller, false for jet)
    %   eta     - Propeller efficiency (0 to 1). Default is 1.0. 
    %             Only used if is_prop is true.
    %
    % Outputs:
    %   R       - Range (meters)
    
    if nargin < 8
        eta = 1.0;
    end

    L_D = CL ./ CD;
    
    if is_prop
        % Breguet Range for Propeller Aircraft
        % R = (eta / c_p) * (CL/CD) * ln(Wi / Wf)
        % SFC assumed to be c_p in units of [1/m] (Newtons of fuel per Joule of energy)
        
        R = (eta / SFC) * L_D * log(Wi / Wf);
    else
        % Breguet Range for Jet Aircraft
        % R = (V / c_t) * (CL/CD) * ln(Wi / Wf)
        % SFC assumed to be c_t in units of [1/s] (Newtons of fuel per Newton of thrust per second)
        
        R = (V / SFC) * L_D * log(Wi / Wf);
    end
end
