function [T, P, rho, a] = std_atm(h)
    % STD_ATM - International Standard Atmosphere model
    %
    % Usage:
    %   [T, P, rho, a] = std_atm(h)
    %
    % Inputs:
    %   h   - Geopotential altitude (meters). Can be a scalar or a vector.
    %
    % Outputs:
    %   T   - Temperature (Kelvin)
    %   P   - Pressure (Pascal)
    %   rho - Density (kg/m^3)
    %   a   - Speed of sound (m/s)
    %
    % Note: Simplified model valid up to 11,000 meters (Troposphere).
    % Beyond 11km, the temperature is constant in the lower stratosphere.

    % Standard Atmosphere Constants
    T0 = 288.15;       % Sea level temperature (K)
    P0 = 101325;       % Sea level pressure (Pa)
    rho0 = 1.225;      % Sea level density (kg/m^3)
    g = 9.80665;       % Gravity acceleration (m/s^2)
    R = 287.05;        % Gas constant for air (J/(kg*K))
    L = -0.0065;       % Temperature lapse rate (K/m)
    gamma = 1.4;       % Ratio of specific heats for air

    % Initialize output arrays with same size as input
    T = zeros(size(h));
    P = zeros(size(h));
    rho = zeros(size(h));
    a = zeros(size(h));
    
    % Loop over each altitude element to handle vectors
    for i = 1:numel(h)
        curr_h = h(i);
        
        if curr_h <= 11000
            % Troposphere
            T(i) = T0 + L * curr_h;
            P(i) = P0 * (T(i) / T0) ^ (-g / (L * R));
            rho(i) = P(i) / (R * T(i));
        else
            % Stratosphere (Lower) - Simplified: Isothermal
            % Calculate properties at tropopause (11km)
            T_trop = T0 + L * 11000;
            P_trop = P0 * (T_trop / T0) ^ (-g / (L * R));
            
            T(i) = T_trop;
            % For isothermal layer: P = P_base * exp(-g/(R*T) * (h - h_base))
            P(i) = P_trop * exp(-g / (R * T_trop) * (curr_h - 11000));
            rho(i) = P(i) / (R * T(i));
        end
        
        % Speed of Sound
        a(i) = sqrt(gamma * R * T(i));
    end
end
