rho = 1.225;
V = linspace(10, 100, 10000);
S = 20;
CD0 = 0.02;
k = 0.05;
W = 10000;
tic
for i = 1:1000
    [Pr, Tr] = power_required(rho, V, S, CD0, k, W);
end
toc
