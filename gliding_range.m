function R_glide = gliding_range(h_start, h_end, CL, CD)
    % GLIDING_RANGE - Calculate Glide Range
    %
    % Usage:
    %   R_glide = gliding_range(h_start, h_end, CL, CD)
    %
    % Inputs:
    %   h_start - Starting altitude (m)
    %   h_end   - Ending altitude (m)
    %   CL      - Lift Coefficient
    %   CD      - Drag Coefficient
    %
    % Outputs:
    %   R_glide - Glide Range (m)

    L_D = CL ./ CD;
    R_glide = (h_start - h_end) .* L_D;
end
