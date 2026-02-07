% Flight Fundamentals Project - Main Analysis Script
% This script demonstrates the use of the Flight Fundamentals Toolkit
% to analyze the performance of a hypothetical light aircraft (Cessna 172-like).

% --- 1. Define Aircraft Parameters ---
m = 1100;              % Mass (kg)
g = 9.80665;           % Gravity (m/s^2)
W = m * g;             % Weight (N)
S = 16.2;              % Wing Area (m^2)
b = 11.0;              % Wingspan (m)
AR = b^2 / S;          % Aspect Ratio
e = 0.8;               % Oswald Efficiency Factor
CD0 = 0.027;           % Zero-lift drag coefficient
k = 1 / (pi * e * AR); % Induced drag factor

P_bhp = 160;           % Engine Power (hp)
Pa_sl = P_bhp * 745.7; % Power Available at Sea Level (Watts)
eta_prop = 0.8;        % Propeller Efficiency

CL_max = 1.6;          % Maximum Lift Coefficient (with flaps maybe, or clean stall)

% --- 2. Atmosphere & Stall Speed ---
disp('--- 1. Atmosphere & Basic Limits ---');
h_sl = 0;
[T_sl, P_sl, rho_sl, a_sl] = std_atm(h_sl);
fprintf('Sea Level Density: %.4f kg/m^3\n', rho_sl);

V_stall = stall_speed(W, rho_sl, S, CL_max);
fprintf('Stall Speed (Sea Level): %.2f m/s (%.2f km/h)\n', V_stall, V_stall * 3.6);

% --- 3. Power Required Curve (Sea Level) ---
disp('--- 2. Power Required Analysis ---');
V = linspace(V_stall, 80, 50); % Velocity range from stall to ~80 m/s
[Pr, Tr] = power_required(rho_sl, V, S, CD0, k, W);
Pa = Pa_sl * eta_prop * ones(size(V)); % Simplified constant power available (propeller)

% Calculate Max Speed (where Pa = Pr)
% Simple interpolation or finding zero crossing
diff_P = Pa - Pr;
% Find indices where difference crosses zero
idx = find(diff_P < 0, 1);
if ~isempty(idx)
    V_max = V(idx);
    fprintf('Max Speed (Sea Level): %.2f m/s (%.2f km/h)\n', V_max, V_max * 3.6);
else
    fprintf('Max Speed not found in range.\n');
end

% Plot Power Required
figure(1);
plot(V, Pr / 1000, 'b-', 'LineWidth', 2); hold on;
plot(V, Pa / 1000, 'r--', 'LineWidth', 2);
xlabel('Velocity (m/s)');
ylabel('Power (kW)');
title('Power Required vs Power Available (Sea Level)');
legend('Power Required', 'Power Available');
grid on;
print('plot_power_curve.png', '-dpng');
fprintf('Generated plot: plot_power_curve.png\n');

% --- 4. Rate of Climb vs Altitude ---
disp('--- 3. Climb Performance ---');
altitudes = 0:500:5000; % 0 to 5000 meters
RC_max_vec = zeros(size(altitudes));

for i = 1:length(altitudes)
    h = altitudes(i);
    [~, ~, rho, ~] = std_atm(h);
    
    % Recalculate Power Required curve for this altitude
    % Assume Best Climb Speed is usually where excess power is max
    % We scan velocities to find max RC
    V_scan = linspace(stall_speed(W, rho, S, CL_max), 80, 50);
    [Pr_h, ~] = power_required(rho, V_scan, S, CD0, k, W);
    
    % Power Available drops with density (approx for unsupercharged piston)
    sigma = rho / rho_sl;
    Pa_h = Pa_sl * sigma * eta_prop; 
    
    RC_vec = rate_of_climb(Pa_h, Pr_h, W);
    RC_max_vec(i) = max(RC_vec);
end

figure(2);
plot(RC_max_vec, altitudes, 'g-', 'LineWidth', 2);
xlabel('Max Rate of Climb (m/s)');
ylabel('Altitude (m)');
title('Max Rate of Climb vs Altitude');
grid on;
print('plot_climb_performance.png', '-dpng');
fprintf('Generated plot: plot_climb_performance.png\n');

% Calculate Service Ceiling (where RC = 0.5 m/s or 100 ft/min ~ 0.5 m/s)
service_ceiling_idx = find(RC_max_vec < 0.5, 1);
if ~isempty(service_ceiling_idx)
    h_sc = altitudes(service_ceiling_idx);
    fprintf('Service Ceiling (approx): %.0f m\n', h_sc);
end

% --- 5. Range & Gliding ---
disp('--- 4. Range & Gliding ---');
h_cruise = 2000; % 2000 m
[~, ~, rho_cr, ~] = std_atm(h_cruise);

% Best L/D for Glide
CL_md = sqrt(CD0 / k);
CD_md = 2 * CD0;
L_D_max = CL_md / CD_md;
fprintf('Max L/D Ratio: %.2f\n', L_D_max);

% Glide from 2000m
R_glide = gliding_range(h_cruise, 0, CL_md, CD_md);
fprintf('Best Glide Range from %.0f m: %.2f km\n', h_cruise, R_glide / 1000);

% Breguet Range (Propeller)
fuel_mass = 150; % kg
Wi = W; 
Wf = W - fuel_mass * g;
% Assume cruise at V_md (min drag) for best range (approximation for prop)
% Actually for prop, best range is at CL = sqrt(CD0 / 3k) -> C_Di = 1/3 C_D0 ?
% Or actually max L/D?
% For propeller: Range ~ eta/SFC * L/D * ln(Wi/Wf). So max L/D is best range.
SFC_power = 0.45 * 0.453592 / 745.7 / 3600 * g; % lb/hp/hr -> kg/W/s * g -> 1/m ?
% Let's convert SFC carefully:
% 0.45 lb/hp/hr
% = 0.45 * 0.453592 kg / (1 hp * 1 hr)
% = 0.2041 kg / (745.7 W * 3600 s)
% = 7.6e-8 kg / (W * s)
% But my function expects SFC in N / (W*s) or similar?
% Let's check range_breguet.m inputs.
% "For Prop: Power SFC (N / (W * s) or 1/m)"
% So input SFC should be (kg/Ws) * g.
SFC_si = (0.2041 / (745.7 * 3600)) * g; 

R_max = range_breguet(Wi, Wf, CL_md, CD_md, SFC_si, 0, true, eta_prop);
fprintf('Max Range (at 2000m): %.2f km\n', R_max / 1000);

disp('--- Analysis Complete ---');
