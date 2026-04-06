rho = 1.225;
V = linspace(10, 100, 10000);
S = 20;
CD0 = 0.02;
k = 0.05;
W = 10000;
tic
for i = 1:1000
    % Original logic
    q = 0.5 * rho .* V.^2;
    CL = W ./ (q * S);
    CD = CD0 + k * CL.^2;
    Tr = q .* S .* CD;
    Pr = Tr .* V;
end
t1 = toc;
fprintf('Original: %f s\n', t1);

tic
for i = 1:1000
    parasiteConst = 0.5 * rho * S * CD0;
    inducedConst = (2 * k * W * W) / (rho * S);
    V2 = V.^2;
    Tr = parasiteConst .* V2 + inducedConst ./ V2;
    Pr = Tr .* V;
end
t2 = toc;
fprintf('Optimized inside loop: %f s\n', t2);

parasiteConst = 0.5 * rho * S * CD0;
inducedConst = (2 * k * W * W) / (rho * S);
tic
for i = 1:1000
    V2 = V.^2;
    Tr = parasiteConst .* V2 + inducedConst ./ V2;
    Pr = Tr .* V;
end
t3 = toc;
fprintf('Optimized (hoisted): %f s\n', t3);
