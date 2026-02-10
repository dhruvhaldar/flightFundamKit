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
  powerRequired,
  rateOfClimb,
  stdAtm
} from "@/utils/flightMechanics"

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
    const { rho: rho_sl } = stdAtm(0) as { rho: number }
    const V_stall = stallSpeed(W, rho_sl, S, CL_max)
    const V_end = 80 // m/s, arbitrary upper limit like in main_project.m

    const data = []
    // Generate 50 points
    for (let i = 0; i <= 50; i++) {
      const V = V_stall + (i / 50) * (V_end - V_stall)
      const { Pr } = powerRequired(rho_sl, V, S, CD0, k, W) as { Pr: number }
      const Pa = Pa_sl * eta_prop // Constant for prop

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
    const altitudes = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]

    for (const h of altitudes) {
      const { rho } = stdAtm(h) as { rho: number }
      const { rho: rho_sl } = stdAtm(0) as { rho: number }

      // Find max RC at this altitude
      const V_stall_h = stallSpeed(W, rho, S, CL_max)
      const V_scan_end = 80

      let max_RC = -Infinity

      // Simple scan to find max RC
      for (let j = 0; j <= 20; j++) {
        const V = V_stall_h + (j / 20) * (V_scan_end - V_stall_h)
        const { Pr } = powerRequired(rho, V, S, CD0, k, W) as { Pr: number }

        const sigma = rho / rho_sl
        const Pa_h = Pa_sl * sigma * eta_prop

        const rc = rateOfClimb(Pa_h, Pr, W) as number
        if (rc > max_RC) max_RC = rc
      }

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
