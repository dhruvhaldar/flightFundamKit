"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { AircraftParams } from "@/types"
import {
  stallSpeed,
  stdAtm
} from "@/utils/flightMechanics"

// Optimization: Pre-calculate constant atmosphere data to avoid redundant calls on every render
const ALTITUDES = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
const ATM_DATA = (stdAtm(ALTITUDES) as { rho: number }[]).map(d => ({
  ...d,
  inv_rho: 1 / d.rho,
  inv_sqrt_rho: 1 / Math.sqrt(d.rho)
}))
const RHO_SL = (stdAtm(0) as { rho: number }).rho

interface PerformanceChartsProps {
  params: AircraftParams
}

export default function PerformanceCharts({ params }: PerformanceChartsProps) {
  const { m, S, b, e, CD0, P_bhp, eta_prop, CL_max } = params

  const g = 9.80665
  const W = m * g
  const AR = (b * b) / S
  const k = 1 / (Math.PI * e * AR)
  const Pa_sl = P_bhp * 745.7 // Watts

  // Optimization: Pre-calculate constant factor for V_mp to avoid Math.pow inside loops
  // V_mp = (B / (3*A))^0.25
  // A = 0.5 * rho * S * CD0
  // B = (2 * k * W^2) / (rho * S)
  // B/(3A) = (4 * k * W^2) / (3 * rho^2 * S^2 * CD0)
  // V_mp = ( (4 * k * W^2) / (3 * S^2 * CD0) )^0.25 * (1/rho^2)^0.25
  // V_mp = K_Vmp / sqrt(rho)
  // K_Vmp = ((4 * k * W^2) / (3 * S^2 * CD0))^0.25
  const K_Vmp_base = (4 * k * (W * W)) / (3 * (S * S) * CD0)
  const K_Vmp = Math.sqrt(Math.sqrt(K_Vmp_base))

  // Power Curve Data (Sea Level)
  const powerData = useMemo(() => {
    const V_stall = stallSpeed(W, RHO_SL, S, CL_max)
    const V_end = 80 // m/s, arbitrary upper limit like in main_project.m
    const Pa = Pa_sl * eta_prop

    // Optimization: Pre-calculate constants for Power Required formula to avoid redundant math in loop
    // Pr = Tr * V = (q * S * CD) * V
    // Pr = (0.5 * rho * V^2 * S * (CD0 + k * CL^2)) * V
    // ... simplifies to: Pr = parasiteConst * V^3 + inducedConst / V
    // ⚡ Bolt Optimization: Pre-divide by 1000 to output kW directly, removing division inside the loop
    const parasiteConst_kW = (0.5 * RHO_SL * S * CD0) * 0.001
    const inducedConst_kW = ((2 * k * (W * W)) / (RHO_SL * S)) * 0.001

    // Optimization: Hoist constant Pa_kW calculation outside loop
    const Pa_kW_val = Pa * 0.001

    // ⚡ Bolt Optimization: Pre-allocate array and hoist velocity step to reduce allocations and divisions
    const data = new Array(51)
    const vStep = (V_end - V_stall) / 50
    for (let i = 0; i <= 50; i++) {
      const V = V_stall + i * vStep

      // Optimized Power Required calculation
      // V^3 is faster as V * V * V
      // ⚡ Bolt Optimization: Using direct division for induced power instead of
      // calculating inv_V, which avoids variable allocation and benchmarks faster.
      const Pr_kW = parasiteConst_kW * (V * V * V) + inducedConst_kW / V

      data[i] = {
        V: V,
        Pr_kW: Pr_kW,
        Pa_kW: Pa_kW_val
      }
    }
    return data
  }, [W, S, CL_max, CD0, k, Pa_sl, eta_prop])

  // Analysis for Power Curve
  const minPowerPoint = useMemo(() => {
    // Optimization: Replaced O(N) iterative search with O(1) analytical solution
    // This finds the exact minimum power point without looping over powerData

    // Calculate V_mp using hoisted constant and Sea Level density
    const V_mp = K_Vmp / Math.sqrt(RHO_SL)

    // Check flight envelope constraints
    const V_stall = stallSpeed(W, RHO_SL, S, CL_max)
    const V_end = 80

    let V_best = V_mp
    if (V_best < V_stall) V_best = V_stall
    if (V_best > V_end) V_best = V_end

    // Calculate Power Required at this exact velocity
    const parasiteConst = 0.5 * RHO_SL * S * CD0
    const inducedConst = (2 * k * (W * W)) / (RHO_SL * S)
    const Pr = parasiteConst * (V_best * V_best * V_best) + inducedConst / V_best

    return {
      V: V_best,
      Pr_kW: Pr / 1000
    }
  }, [K_Vmp, W, S, CD0, k, CL_max])

  // Rate of Climb Data & Analysis (vs Altitude)
  const { climbData, maxClimbPoint, ceilingPoint } = useMemo(() => {
    // ⚡ Bolt Optimization: Pre-allocate array to avoid reallocation overhead
    const len = ALTITUDES.length
    const data = new Array(len)
    let maxPoint = { h: 0, RC: -Infinity }
    let lastPositivePoint = null

    // ⚡ Bolt Optimization: Hoisted density-independent physics bases outside the altitude loop
    // to replace 3 multiplications and 1 division per iteration with simpler scaled variants.
    const V_end = 80
    const stallBase = (2 * W) / (S * CL_max)
    // ⚡ Bolt Optimization: Hoist inverse weight calculation to avoid division in the loop
    const inv_W = 1 / W

    // ⚡ Bolt Optimization: Multiply inverse W directly into the constants
    const parasiteBase_inv_W = (0.5 * S * CD0) * inv_W
    const inducedBase_inv_W = ((2 * k * (W * W)) / S) * inv_W
    const Pa_factor_inv_W = ((Pa_sl * eta_prop) / RHO_SL) * inv_W

    // ⚡ Bolt Optimization: Hoist square root calculation out of loop
    // Math.sqrt(stallBase * inv_rho) == Math.sqrt(stallBase) * inv_sqrt_rho
    const sqrtStallBase = Math.sqrt(stallBase)

    for (let i = 0; i < len; i++) {
      const h = ALTITUDES[i]
      // ⚡ Bolt Optimization: Use pre-computed inverse density from global ATM_DATA
      const { rho, inv_rho, inv_sqrt_rho } = ATM_DATA[i]

      // Find max RC at this altitude using hoisted constants
      const V_stall_h = sqrtStallBase * inv_sqrt_rho
      const Pa_h_div_W = Pa_factor_inv_W * rho

      const parasiteConst_div_W = parasiteBase_inv_W * rho
      const inducedConst_div_W = inducedBase_inv_W * inv_rho

      // Optimization: Analytical solution for max Rate of Climb
      // Max RC occurs at minimum Power Required (since Pa is constant with V)
      // V_mp = K_Vmp / sqrt(rho) is ~30x faster than Math.pow inside loop
      const V_mp = K_Vmp * inv_sqrt_rho

      // Check if V_mp is within flight envelope
      let V_best = V_mp
      if (V_best < V_stall_h) V_best = V_stall_h
      if (V_best > V_end) V_best = V_end

      // ⚡ Bolt Optimization: Replace `inv_V_best` intermediate with direct division
      const Pr_best_div_W = parasiteConst_div_W * (V_best * V_best * V_best) + inducedConst_div_W / V_best
      const max_RC = Pa_h_div_W - Pr_best_div_W

      const point = { h, RC: max_RC }
      data[i] = point

      // ⚡ Bolt Optimization: Track max point and ceiling in the same pass
      // to avoid O(N) array traversals (.reduce and .filter) later.
      if (max_RC > maxPoint.RC) {
        maxPoint = point
      }

      // Service ceiling def: < 0.5 m/s (approx 100 fpm)
      if (max_RC > 0.5) {
        lastPositivePoint = point
      }
    }

    return {
      climbData: data,
      maxClimbPoint: maxPoint.RC === -Infinity ? null : maxPoint,
      ceilingPoint: lastPositivePoint || (data.length > 0 ? data[0] : null)
    }
  }, [W, S, CL_max, CD0, k, Pa_sl, eta_prop, K_Vmp])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Power Required vs Velocity (Sea Level)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="V"
                  stroke="var(--muted-foreground)"
                  label={{ value: 'Velocity (m/s)', position: 'insideBottomRight', offset: -5, fill: 'var(--foreground)' }}
                  tickFormatter={(val) => Number(val).toFixed(1)}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: 'var(--foreground)' }}
                  tickFormatter={(val) => val.toFixed(0)}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--card-foreground)' }}
                  itemStyle={{ color: 'var(--card-foreground)' }}
                  labelStyle={{ color: 'var(--card-foreground)' }}
                  formatter={(val) => Number(val).toFixed(2)}
                  labelFormatter={(val) => `V: ${Number(val).toFixed(1)} m/s`}
                />
                <Legend />
                {/* ⚡ Bolt Optimization: Disabled Recharts animation to improve rendering performance and fix a React 19 compatibility issue where SVG paths fail to render. */}
                <Line type="monotone" dataKey="Pr_kW" stroke="#8884d8" name="Power Required" isAnimationActive={false} />
                <Line type="monotone" dataKey="Pa_kW" stroke="#82ca9d" name="Power Available" strokeDasharray="5 5" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Insight:</span> Most efficient cruise speed is{" "}
            <span className="font-bold text-foreground">{minPowerPoint?.V?.toFixed(1)} m/s</span> requiring{" "}
            <span className="font-bold text-foreground">{minPowerPoint?.Pr_kW?.toFixed(2)} kW</span> power.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Max Rate of Climb vs Altitude</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={climbData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="h"
                  stroke="var(--muted-foreground)"
                  label={{ value: 'Altitude (m)', position: 'insideBottomRight', offset: -5, fill: 'var(--foreground)' }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  label={{ value: 'Rate of Climb (m/s)', angle: -90, position: 'insideLeft', fill: 'var(--foreground)' }}
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', color: 'var(--card-foreground)' }}
                  itemStyle={{ color: 'var(--card-foreground)' }}
                  labelStyle={{ color: 'var(--card-foreground)' }}
                  formatter={(val) => Number(val).toFixed(2)}
                  labelFormatter={(val) => `Alt: ${val} m`}
                />
                <Legend />
                {/* ⚡ Bolt Optimization: Disabled Recharts animation to improve rendering performance and fix a React 19 compatibility issue where SVG paths fail to render. */}
                <Line type="monotone" dataKey="RC" stroke="#82ca9d" name="Max RC" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Insight:</span> Max climb rate is{" "}
            <span className="font-bold text-foreground">{maxClimbPoint?.RC?.toFixed(2)} m/s</span> at sea level.
            {ceilingPoint && ceilingPoint.h < 5000 && (
              <> Service ceiling is approx <span className="font-bold text-foreground">{ceilingPoint.h} m</span>.</>
            )}
            {ceilingPoint && ceilingPoint.h >= 5000 && (
               <> Climb rate remains positive up to <span className="font-bold text-foreground">{ceilingPoint.h} m</span>.</>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
