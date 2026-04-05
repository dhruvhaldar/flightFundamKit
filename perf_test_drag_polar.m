CL = linspace(0.1, 1.5, 10000);
CD0 = 0.02;
k = 0.05;
tic
for i = 1:1000
    CD = drag_polar(CL, CD0, k);
end
toc
