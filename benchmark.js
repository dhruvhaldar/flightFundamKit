const iterations = 10000000;
let V = 15;
const parasiteConst_kW = 0.05;
const inducedConst_kW = 1500;

console.time("V * V * V");
let sum1 = 0;
for (let i = 0; i < iterations; i++) {
  const v = V + (i % 50);
  sum1 += parasiteConst_kW * (v * v * v) + inducedConst_kW / v;
}
console.timeEnd("V * V * V");

console.time("v2 = v * v; v2 * v");
let sum2 = 0;
for (let i = 0; i < iterations; i++) {
  const v = V + (i % 50);
  const v2 = v * v;
  sum2 += parasiteConst_kW * (v2 * v) + inducedConst_kW / v;
}
console.timeEnd("v2 = v * v; v2 * v");
