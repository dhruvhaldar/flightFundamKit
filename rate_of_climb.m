function RC = rate_of_climb(Pa, Pr, W)
    % RATE_OF_CLIMB - Calculate Rate of Climb
    %
    % Usage:
    %   RC = rate_of_climb(Pa, Pr, W)
    %
    % Inputs:
    %   Pa  - Power Available (Watts)
    %   Pr  - Power Required (Watts)
    %   W   - Weight (Newtons)
    %
    % Outputs:
    %   RC  - Rate of Climb (m/s)

    % ⚡ Bolt Optimization: Replace element-wise division with inverse multiplication.
    % Hoisting the inversion (1 ./ W) and multiplying is significantly faster
    % in MATLAB/Octave than dividing a large array (Pa - Pr) by W directly.
    invW = 1 ./ W;
    RC = (Pa - Pr) .* invW;
end
