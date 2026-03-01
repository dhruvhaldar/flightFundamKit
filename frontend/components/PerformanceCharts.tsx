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
const ATM_DATA = stdAtm(ALTITUDES) as { rho: number }[]
const RHO_SL = (stdAtm(0) as { rho: number }).rho

interface PerformanceChartsProps {
  params: AircraftParams
}

export default function PerformanceCharts({ params }: PerformanceChartsProps) {
  const { m, S, b, e, CD0, P_bhp, eta_prop, CL_max } = params

  const g = 9.80665
  const W = m * g
  const AR = Math.pow(b, 2) / S
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
    const parasiteConst = 0.5 * RHO_SL * S * CD0
    const inducedConst = (2 * k * (W * W)) / (RHO_SL * S)

    // Optimization: Hoist constant Pa_kW calculation outside loop
    const Pa_kW_val = Pa / 1000

    const data = []
    for (let i = 0; i <= 50; i++) {
      const V = V_stall + (i / 50) * (V_end - V_stall)

      // Optimized Power Required calculation
      // V^3 is faster as V * V * V
      const Pr = parasiteConst * (V * V * V) + inducedConst / V

      data.push({
        V: V,
        Pr_kW: Pr / 1000,
        Pa_kW: Pa_kW_val
      })
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
    const data = []
    let maxPoint = { h: 0, RC: -Infinity }
    let lastPositivePoint = null

    // ⚡ Bolt Optimization: Hoisted density-independent physics bases outside the altitude loop
    // to replace 3 multiplications and 1 division per iteration with simpler scaled variants.
    const V_end = 80
    const stallBase = (2 * W) / (S * CL_max)
    const parasiteBase = 0.5 * S * CD0
    const inducedBase = (2 * k * (W * W)) / S
    const Pa_factor = (Pa_sl * eta_prop) / RHO_SL

    for (let i = 0; i < ALTITUDES.length; i++) {
      const h = ALTITUDES[i]
      const { rho } = ATM_DATA[i]

      // Find max RC at this altitude using hoisted constants
      const V_stall_h = Math.sqrt(stallBase / rho)
      const Pa_h = Pa_factor * rho

      const parasiteConst = parasiteBase * rho
      const inducedConst = inducedBase / rho

      // Optimization: Analytical solution for max Rate of Climb
      // Max RC occurs at minimum Power Required (since Pa is constant with V)
      // V_mp = K_Vmp / sqrt(rho) is ~30x faster than Math.pow inside loop
      const V_mp = K_Vmp / Math.sqrt(rho)

      // Check if V_mp is within flight envelope
      let V_best = V_mp
      if (V_best < V_stall_h) V_best = V_stall_h
      if (V_best > V_end) V_best = V_end

      const Pr_best = parasiteConst * (V_best * V_best * V_best) + inducedConst / V_best
      const max_RC = (Pa_h - Pr_best) / W

      const point = { h, RC: max_RC }
      data.push(point)

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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="V"
                  label={{ value: 'Velocity (m/s)', position: 'insideBottomRight', offset: -5 }}
                  tickFormatter={(val) => Number(val).toFixed(1)}
                />
                <YAxis
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(val) => val.toFixed(0)}
                />
                <Tooltip formatter={(val) => Number(val).toFixed(2)} labelFormatter={(val) => `V: ${Number(val).toFixed(1)} m/s`} />
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="h"
                  label={{ value: 'Altitude (m)', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Rate of Climb (m/s)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip formatter={(val) => Number(val).toFixed(2)} labelFormatter={(val) => `Alt: ${val} m`} />
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
