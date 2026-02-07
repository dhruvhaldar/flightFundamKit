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

    RC = (Pa - Pr) ./ W;
end
