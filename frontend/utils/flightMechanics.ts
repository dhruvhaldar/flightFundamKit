export function stdAtm(h: number | number[]) {
  // Standard Atmosphere Constants
  const T0 = 288.15;       // Sea level temperature (K)
  const P0 = 101325;       // Sea level pressure (Pa)
  // rho0 is 1.225 kg/m^3
  const g = 9.80665;       // Gravity acceleration (m/s^2)
  const R = 287.05;        // Gas constant for air (J/(kg*K))
  const L = -0.0065;       // Temperature lapse rate (K/m)
  const gamma = 1.4;       // Ratio of specific heats for air

  const isArray = Array.isArray(h);
  const altitudes = isArray ? h : [h];

  const results = altitudes.map((curr_h) => {
    let T, P, rho;

    if (curr_h <= 11000) {
      // Troposphere
      T = T0 + L * curr_h;
      P = P0 * Math.pow(T / T0, -g / (L * R));
      rho = P / (R * T);
    } else {
      // Stratosphere (Lower) - Simplified: Isothermal
      const T_trop = T0 + L * 11000;
      const P_trop = P0 * Math.pow(T_trop / T0, -g / (L * R));

      T = T_trop;
      P = P_trop * Math.exp((-g / (R * T_trop)) * (curr_h - 11000));
      rho = P / (R * T);
    }

    const a = Math.sqrt(gamma * R * T);
    return { T, P, rho, a };
  });

  if (isArray) return results;
  return results[0];
}

export function stallSpeed(W: number, rho: number, S: number, CL_max: number) {
  return Math.sqrt((2 * W) / (rho * S * CL_max));
}

export function dragPolar(CL: number | number[], CD0: number, k: number) {
  const isArray = Array.isArray(CL);
  const CLs = isArray ? CL : [CL];

  const results = CLs.map(cl => CD0 + k * Math.pow(cl, 2));

  if (isArray) return results;
  return results[0];
}

export function liftCoeff(W: number, rho: number, V: number | number[], S: number) {
  const isArray = Array.isArray(V);
  const Vs = isArray ? V : [V];

  const results = Vs.map(v => {
    const q = 0.5 * rho * Math.pow(v, 2);
    return W / (q * S);
  });

  if (isArray) return results;
  return results[0];
}

export function powerRequired(rho: number, V: number | number[], S: number, CD0: number, k: number, W: number) {
  const isArray = Array.isArray(V);
  const Vs = isArray ? V : [V];

  const results = Vs.map(v => {
    const q = 0.5 * rho * Math.pow(v, 2);
    const CL = W / (q * S);
    const CD = CD0 + k * Math.pow(CL, 2);
    const Tr = q * S * CD;
    const Pr = Tr * v;
    return { Pr, Tr, CL, CD };
  });

  if (isArray) return results;
  return results[0];
}

export function rateOfClimb(Pa: number | number[], Pr: number | number[], W: number) {
  const isPaArray = Array.isArray(Pa);
  const isPrArray = Array.isArray(Pr);

  // Assuming Pa and Pr are matched in length if both arrays
  const PaArray = isPaArray ? Pa : (isPrArray ? Array(Pr.length).fill(Pa) : [Pa]);
  const PrArray = isPrArray ? Pr : (isPaArray ? Array(Pa.length).fill(Pr) : [Pr]);

  const results = PaArray.map((pa, i) => {
    const pr = PrArray[i];
    return (pa - pr) / W;
  });

  if (isPaArray || isPrArray) return results;
  return results[0];
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
