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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
    const inducedConst = (2 * k * Math.pow(W, 2)) / (RHO_SL * S)

    const data = []
    for (let i = 0; i <= 50; i++) {
      const V = V_stall + (i / 50) * (V_end - V_stall)

      // Optimized Power Required calculation
      const Pr = parasiteConst * Math.pow(V, 3) + inducedConst / V

      data.push({
        V: Number(V.toFixed(1)),
        Pr_kW: Number((Pr / 1000).toFixed(2)),
        Pa_kW: Number((Pa / 1000).toFixed(2))
      })
    }
    return data
  }, [W, S, CL_max, CD0, k, Pa_sl, eta_prop])

  // Rate of Climb Data (vs Altitude)
  const climbData = useMemo(() => {
    const data = []

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
      const inducedConst = (2 * k * Math.pow(W, 2)) / (rho * S)

      // Optimization: Analytical solution for max Rate of Climb
      // Max RC occurs at minimum Power Required (since Pa is constant with V)
      // Pr = A*V^3 + B/V => dPr/dV = 3*A*V^2 - B/V^2 = 0 => V_mp = (B / (3*A))^0.25
      const V_mp = Math.pow(inducedConst / (3 * parasiteConst), 0.25)

      // Check if V_mp is within flight envelope
      let V_best = V_mp
      if (V_best < V_stall_h) V_best = V_stall_h
      if (V_best > V_end) V_best = V_end

      const Pr_best = parasiteConst * Math.pow(V_best, 3) + inducedConst / V_best
      const max_RC = (Pa_h - Pr_best) / W

      data.push({
        h,
        RC: Number(max_RC.toFixed(2))
      })
    }
    return data
  }, [W, S, CL_max, CD0, k, Pa_sl, eta_prop])

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
                />
                <YAxis
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pr_kW" stroke="#8884d8" name="Power Required" />
                <Line type="monotone" dataKey="Pa_kW" stroke="#82ca9d" name="Power Available" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
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
                />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="RC" stroke="#82ca9d" name="Max RC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
