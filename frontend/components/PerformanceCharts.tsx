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
    if (!powerData.length) return null
    return powerData.reduce((min, p) => (p.Pr_kW < min.Pr_kW ? p : min), powerData[0])
  }, [powerData])

  // Rate of Climb Data (vs Altitude)
  const climbData = useMemo(() => {
    const data = []

    // Optimization: Pre-calculate constant factor for V_mp to avoid Math.pow inside loop
    // V_mp = (B / (3*A))^0.25
    // A = 0.5 * rho * S * CD0
    // B = (2 * k * W^2) / (rho * S)
    // B/(3A) = (4 * k * W^2) / (3 * rho^2 * S^2 * CD0)
    // V_mp = ( (4 * k * W^2) / (3 * S^2 * CD0) )^0.25 * (1/rho^2)^0.25
    // V_mp = K_Vmp / sqrt(rho)
    // K_Vmp = ((4 * k * W^2) / (3 * S^2 * CD0))^0.25
    const K_Vmp_base = (4 * k * (W * W)) / (3 * (S * S) * CD0)
    const K_Vmp = Math.sqrt(Math.sqrt(K_Vmp_base))

    for (let i = 0; i < ALTITUDES.length; i++) {
      const h = ALTITUDES[i]
      const { rho } = ATM_DATA[i]

      // Find max RC at this altitude
      const V_stall_h = stallSpeed(W, rho, S, CL_max)
      const V_end = 80

      const sigma = rho / RHO_SL
      const Pa_h = Pa_sl * sigma * eta_prop

      // Optimization: Pre-calculate constants for this altitude
      const parasiteConst = 0.5 * rho * S * CD0
      const inducedConst = (2 * k * (W * W)) / (rho * S)

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

      data.push({
        h,
        RC: max_RC
      })
    }
    return data
  }, [W, S, CL_max, CD0, k, Pa_sl, eta_prop])

  // Analysis for Climb Curve
  const maxClimbPoint = useMemo(() => {
    if (!climbData.length) return null
    return climbData.reduce((max, p) => (p.RC > max.RC ? p : max), climbData[0])
  }, [climbData])

  const ceilingPoint = useMemo(() => {
    if (!climbData.length) return null
    // Find the altitude where RC drops close to zero or is the last positive value
    const positiveRC = climbData.filter(d => d.RC > 0.5) // Service ceiling def: < 0.5 m/s (approx 100 fpm)
    if (positiveRC.length === 0) return climbData[0]
    return positiveRC[positiveRC.length - 1]
  }, [climbData])

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
                <Line type="monotone" dataKey="Pr_kW" stroke="#8884d8" name="Power Required" />
                <Line type="monotone" dataKey="Pa_kW" stroke="#82ca9d" name="Power Available" strokeDasharray="5 5" />
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
                <Line type="monotone" dataKey="RC" stroke="#82ca9d" name="Max RC" />
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
