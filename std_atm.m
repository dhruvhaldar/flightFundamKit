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

    % Pre-computed constants for performance
    g_LR = -g / (L * R);
    T_trop = T0 + L * 11000;
    P_trop = P0 * (T_trop / T0) ^ g_LR;
    exp_factor = -g / (R * T_trop);
    gamma_R = gamma * R;

    % ⚡ Bolt Optimization: Algebraically factor the scalar division (1/T0)
    % out of the element-wise power calculation for the troposphere.
    % Instead of P0 * (T_tropo / T0)^g_LR, we do (P0 / T0^g_LR) * T_tropo^g_LR
    % saving an element-wise division per vector entry.
    const_P_tropo = P0 / (T0 ^ g_LR);

    % ⚡ Bolt Optimization: Vectorize piecewise linear-to-constant T calculation using max()
    % This avoids allocating the T array with zeros and using logical indexing
    % to piece it together. T_trop is the minimum temperature (constant in lower strato),
    % so max() naturally clamps the decreasing temperature at 11000m.
    T = max(T0 + L * h, T_trop);

    % Initialize P array
    P = zeros(size(h));
    
    % Boolean masks for Troposphere and Stratosphere
    tropo_mask = h <= 11000;
    strato_mask = ~tropo_mask;

    % Troposphere calculations
    if any(tropo_mask(:))
        P(tropo_mask) = const_P_tropo * T(tropo_mask) .^ g_LR;
    end

    % Stratosphere calculations
    if any(strato_mask(:))
        h_strato = h(strato_mask);
        P(strato_mask) = P_trop * exp(exp_factor * (h_strato - 11000));
    end

    rho = P ./ (R * T);
    a = sqrt(gamma_R * T);
end
