% Test Suite for Flight Fundamentals Toolkit

% Add current directory to path if running from within the folder
if ~exist('std_atm', 'file')
    addpath(pwd);
end

% If still not found, try adding 'flight_fundamentals' (running from parent)
if ~exist('std_atm', 'file') && exist('flight_fundamentals', 'dir')
    addpath('flight_fundamentals');
end

disp('Running Flight Fundamentals Tests...');

% Test 1: Atmosphere
[T, P, rho, a] = std_atm(0);
assert(abs(T - 288.15) < 1e-4, 'Sea Level Temperature Incorrect');
assert(abs(P - 101325) < 1e-1, 'Sea Level Pressure Incorrect');
assert(abs(rho - 1.225) < 1e-4, 'Sea Level Density Incorrect');

[T, P, rho, a] = std_atm(11000);
% T at 11km = 288.15 - 0.0065 * 11000 = 216.65
assert(abs(T - 216.65) < 1e-4, 'Tropopause Temperature Incorrect');

% Test 2: Aerodynamics
% Stall Speed
W = 10000; S = 20; CL_max = 1.5; rho = 1.225;
V_stall = stall_speed(W, rho, S, CL_max);
expected_V_stall = sqrt(2*W / (rho*S*CL_max));
assert(abs(V_stall - expected_V_stall) < 1e-4, 'Stall Speed Incorrect');

% Drag Polar
CD0 = 0.02; k = 0.05; CL = 0.5;
CD = drag_polar(CL, CD0, k);
expected_CD = 0.02 + 0.05 * 0.5^2;
assert(abs(CD - expected_CD) < 1e-6, 'Drag Polar Incorrect');

% Test 3: Performance
% Rate of Climb
Pa = 100000; Pr = 80000; W = 10000;
RC = rate_of_climb(Pa, Pr, W);
expected_RC = (100000 - 80000) / 10000; % 2 m/s
assert(abs(RC - 2.0) < 1e-4, 'Rate of Climb Incorrect');

% Range (Jet)
Wi = 10000; Wf = 8000; CL = 0.5; CD = 0.04; SFC = 1e-4; V = 100;
R = range_breguet(Wi, Wf, CL, CD, SFC, V, false);
expected_R = (V/SFC) * (CL/CD) * log(Wi/Wf);
assert(abs(R - expected_R) < 1e-1, 'Jet Range Incorrect');

disp('All tests passed successfully!');
