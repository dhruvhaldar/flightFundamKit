Pa = linspace(100000, 200000, 10000);
Pr = linspace(80000, 180000, 10000);
W = 10000;
tic
for i = 1:1000
    RC = rate_of_climb(Pa, Pr, W);
end
toc
