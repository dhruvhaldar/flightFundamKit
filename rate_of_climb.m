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

    % ⚡ Bolt Optimization: Use direct element-wise division.
    % In MATLAB/Octave, direct division (./) is natively optimized. Replacing
    % it with inverse multiplication (.* (1 ./ W)) is an anti-optimization
    % because it forces the allocation of an intermediate array and adds
    % unnecessary mathematical operations, degrading performance.
    RC = (Pa - Pr) ./ W;
end
