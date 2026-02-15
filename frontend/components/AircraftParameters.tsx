"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AircraftParams } from "@/types"

interface AircraftParametersProps {
  params: AircraftParams
  setParams: (params: AircraftParams) => void
}

export default function AircraftParameters({ params, setParams }: AircraftParametersProps) {
  // Local state for immediate input feedback
  const [localParams, setLocalParams] = useState<AircraftParams>(params)

  // Debounce effect: Update parent state only after user stops typing for 500ms
  // This prevents expensive recalculations in PerformanceCharts on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      // Avoid redundant updates if values haven't changed
      if (JSON.stringify(localParams) !== JSON.stringify(params)) {
        setParams(localParams)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localParams, params, setParams])

  // Sync local state if parent params update externally
  useEffect(() => {
    setLocalParams(params)
  }, [params])

  const handleChange = (key: keyof AircraftParams, value: number) => {
    setLocalParams(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aircraft Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="m">Mass (kg)</Label>
            <Input
              id="m"
              type="number"
              value={localParams.m}
              onChange={(e) => handleChange("m", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="S">Wing Area (m²)</Label>
            <Input
              id="S"
              type="number"
              value={localParams.S}
              onChange={(e) => handleChange("S", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="b">Wingspan (m)</Label>
            <Input
              id="b"
              type="number"
              value={localParams.b}
              onChange={(e) => handleChange("b", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="e">Oswald Efficiency (e)</Label>
            <Input
              id="e"
              type="number"
              step="0.01"
              value={localParams.e}
              onChange={(e) => handleChange("e", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="CD0">Zero-Lift Drag (CD0)</Label>
            <Input
              id="CD0"
              type="number"
              step="0.001"
              value={localParams.CD0}
              onChange={(e) => handleChange("CD0", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="P_bhp">Power (hp)</Label>
            <Input
              id="P_bhp"
              type="number"
              value={localParams.P_bhp}
              onChange={(e) => handleChange("P_bhp", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="eta_prop">Prop Efficiency</Label>
            <Input
              id="eta_prop"
              type="number"
              step="0.01"
              value={localParams.eta_prop}
              onChange={(e) => handleChange("eta_prop", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="CL_max">Max Lift Coeff (CL_max)</Label>
            <Input
              id="CL_max"
              type="number"
              step="0.1"
              value={localParams.CL_max}
              onChange={(e) => handleChange("CL_max", Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="SFC">SFC (lb/hp/hr)</Label>
            <Input
              id="SFC"
              type="number"
              step="0.01"
              value={localParams.SFC}
              onChange={(e) => handleChange("SFC", Number(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
