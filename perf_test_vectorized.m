h = linspace(0, 20000, 10000);
tic
for i = 1:1000
    [T, P, rho, a] = std_atm_vectorized(h);
end
toc
