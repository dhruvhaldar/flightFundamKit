// Standard Atmosphere Constants
const T0 = 288.15;       // Sea level temperature (K)
const P0 = 101325;       // Sea level pressure (Pa)
// rho0 is 1.225 kg/m^3
const g = 9.80665;       // Gravity acceleration (m/s^2)
const R = 287.05;        // Gas constant for air (J/(kg*K))
const L = -0.0065;       // Temperature lapse rate (K/m)
const gamma = 1.4;       // Ratio of specific heats for air

// Pre-calculated constants for optimization
const G_over_LR = -g / (L * R);
const T_trop = T0 + L * 11000;
const P_trop = P0 * Math.pow(T_trop / T0, G_over_LR);
const G_over_RT_trop = -g / (R * T_trop);

// Optimization: Precompute constants to avoid repeated divisions and multiplications
const INV_T0 = 1 / T0;
const RT_trop = R * T_trop;
const INV_RT_trop = 1 / RT_trop;
const GAMMA_R = gamma * R;

export function stdAtm(h: number | number[]) {
  // ⚡ Bolt Optimization: Replaced .map() with pre-allocated for loop.
  // Avoids callback function overhead and reduces GC pressure for large arrays.
  if (Array.isArray(h)) {
    const len = h.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
      res[i] = calculateStdAtm(h[i]);
    }
    return res;
  }
  return calculateStdAtm(h);
}

function calculateStdAtm(curr_h: number) {
  let T, P, rho;

  if (curr_h <= 11000) {
    // Troposphere
    T = T0 + L * curr_h;
    // Optimization: Use multiplication by inverse (T / T0 -> T * INV_T0)
    P = P0 * Math.pow(T * INV_T0, G_over_LR);
    rho = P / (R * T);
  } else {
    // Stratosphere (Lower) - Simplified: Isothermal
    T = T_trop;
    P = P_trop * Math.exp(G_over_RT_trop * (curr_h - 11000));
    // Optimization: Use precomputed inverse for R * T_trop to avoid division
    rho = P * INV_RT_trop;
  }

  // Optimization: Use precomputed GAMMA_R
  const a = Math.sqrt(GAMMA_R * T);
  return { T, P, rho, a };
}

export function stallSpeed(W: number, rho: number, S: number, CL_max: number) {
  return Math.sqrt((2 * W) / (rho * S * CL_max));
}

export function dragPolar(CL: number | number[], CD0: number, k: number) {
  // ⚡ Bolt Optimization: Replaced .map() with pre-allocated for loop.
  if (Array.isArray(CL)) {
    const len = CL.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
      const cl = CL[i];
      res[i] = CD0 + k * cl * cl;
    }
    return res;
  }
  return CD0 + k * CL * CL;
}

export function liftCoeff(W: number, rho: number, V: number | number[], S: number) {
  // ⚡ Bolt Optimization: Replaced .map() with pre-allocated for loop and hoisted constants.
  // Reverted inverse multiplication optimization as modern V8 optimizes direct division faster (~2x).
  if (Array.isArray(V)) {
    const len = V.length;
    const res = new Array(len);
    const factor = W / (0.5 * rho * S);
    for (let i = 0; i < len; i++) {
      const v = V[i];
      // ⚡ Bolt Optimization: Use direct division (factor / (v*v)) which benchmarked
      // faster than calculating an intermediate `inv_v` and multiplying in V8.
      res[i] = factor / (v * v);
    }
    return res;
  }
  const q = 0.5 * rho * V * V;
  return W / (q * S);
}

export function powerRequired(rho: number, V: number | number[], S: number, CD0: number, k: number, W: number) {
  // ⚡ Bolt Optimization: Replaced .map() with pre-allocated for loop and hoisted constants.
  // Reverted inverse multiplication optimization as direct division is faster in V8.
  if (Array.isArray(V)) {
    const len = V.length;
    const res = new Array(len);
    const parasiteConst = 0.5 * rho * S * CD0;
    const inducedConst = (2 * k * W * W) / (rho * S);
    const W_over_05rhoS = W / (0.5 * rho * S);

    for (let i = 0; i < len; i++) {
      const v = V[i];
      const v2 = v * v;
      // ⚡ Bolt Optimization: Pre-calculate v^2 to reduce multiplication operations.
      // Direct division is used instead of calculating `inv_v` because JIT handles it efficiently.
      const Pr = parasiteConst * (v2 * v) + inducedConst / v;
      const Tr = Pr / v;
      const CL = W_over_05rhoS / v2;
      const CD = CD0 + k * CL * CL;
      res[i] = { Pr, Tr, CL, CD };
    }
    return res;
  }
  const q = 0.5 * rho * V * V;
  const CL = W / (q * S);
  const CD = CD0 + k * CL * CL;
  const Tr = q * S * CD;
  const Pr = Tr * V;
  return { Pr, Tr, CL, CD };
}

export function rateOfClimb(Pa: number | number[], Pr: number | number[], W: number) {
  const isPaArray = Array.isArray(Pa);
  const isPrArray = Array.isArray(Pr);

  // Optimized: Handle scalar inputs directly to avoid array allocation overhead
  if (!isPaArray && !isPrArray) {
    return ((Pa as number) - (Pr as number)) / W;
  }

  // ⚡ Bolt Optimization: Replaced division with multiplication by an inverse
  // to avoid redundant division overhead inside loops.
  const invW = 1 / W;

  // ⚡ Bolt Optimization: Replaced .map() with pre-allocated for loops.
  if (isPaArray && !isPrArray) {
    const prVal = Pr as number;
    const paArr = Pa as number[];
    const len = paArr.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
      res[i] = (paArr[i] - prVal) * invW;
    }
    return res;
  }

  if (!isPaArray && isPrArray) {
    const paVal = Pa as number;
    const prArr = Pr as number[];
    const len = prArr.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
      res[i] = (paVal - prArr[i]) * invW;
    }
    return res;
  }

  // Both are arrays (assuming matched length)
  const PaArray = Pa as number[];
  const PrArray = Pr as number[];
  const len = Math.min(PaArray.length, PrArray.length);
  const res = new Array(len);
  for (let i = 0; i < len; i++) {
    res[i] = (PaArray[i] - PrArray[i]) * invW;
  }
  return res;
}

export function glidingRange(h_start: number, h_end: number, CL: number, CD: number) {
  const L_D = CL / CD;
  return (h_start - h_end) * L_D;
}

export function rangeBreguet(Wi: number, Wf: number, CL: number, CD: number, SFC: number, V: number, is_prop: boolean, eta: number = 1.0) {
  const L_D = CL / CD;

  if (is_prop) {
    // Breguet Range for Propeller Aircraft
    return (eta / SFC) * L_D * Math.log(Wi / Wf);
  } else {
    // Breguet Range for Jet Aircraft
    return (V / SFC) * L_D * Math.log(Wi / Wf);
  }
}
