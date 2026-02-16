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
  // Local state as strings for immediate input feedback (prevents cursor jumping and decimal issues)
  const [localParams, setLocalParams] = useState<Record<keyof AircraftParams, string>>(() => {
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ) as Record<keyof AircraftParams, string>
  })

  // Debounce effect: Update parent state only after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      // Parse local strings to numbers
      const nextParams = { ...params }
      let hasChanges = false

      ;(Object.keys(localParams) as Array<keyof AircraftParams>).forEach((key) => {
        const val = localParams[key]
        // Allow empty string to be treated as 0 or keep previous value?
        // For now, treat as 0 if empty, otherwise parse float.
        const num = val === "" ? 0 : parseFloat(val)

        if (!isNaN(num) && num !== params[key]) {
          nextParams[key] = num
          hasChanges = true
        }
      })

      if (hasChanges) {
        setParams(nextParams)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localParams, params, setParams])

  // Sync local state if parent params update externally (but respect user typing)
  useEffect(() => {
    // eslint-disable-next-line
    setLocalParams((prev) => {
      const next = { ...prev }
      let needsUpdate = false

      ;(Object.keys(params) as Array<keyof AircraftParams>).forEach((key) => {
        const paramValue = params[key]
        const localValue = prev[key]

        // Only update local string if the numeric values mismatch
        // This preserves "0." or "1.00" when the value is numerically equivalent
        // Also handles the case where local is empty string (parsed as NaN or 0)
        const parsedLocal = localValue === "" ? 0 : parseFloat(localValue)

        if (isNaN(parsedLocal) || parsedLocal !== paramValue) {
          // If mismatch, take the parent value
          // Exception: if user is typing "0." and param is 0, parsedLocal is 0. 0 === 0. No update.
          // So "0." is preserved. Correct.
          next[key] = String(paramValue)
          needsUpdate = true
        }
      })

      return needsUpdate ? next : prev
    })
  }, [params])

  const handleChange = (key: keyof AircraftParams, value: string) => {
    setLocalParams((prev) => ({ ...prev, [key]: value }))
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
              onChange={(e) => handleChange("m", e.target.value)}
              aria-label="Aircraft Mass in kg"
            />
          </div>
          <div>
            <Label htmlFor="S">Wing Area (m²)</Label>
            <Input
              id="S"
              type="number"
              value={localParams.S}
              onChange={(e) => handleChange("S", e.target.value)}
              aria-label="Wing Area in square meters"
            />
          </div>
          <div>
            <Label htmlFor="b">Wingspan (m)</Label>
            <Input
              id="b"
              type="number"
              value={localParams.b}
              onChange={(e) => handleChange("b", e.target.value)}
              aria-label="Wingspan in meters"
            />
          </div>
          <div>
            <Label htmlFor="e">Oswald Efficiency (e)</Label>
            <Input
              id="e"
              type="number"
              step="0.01"
              value={localParams.e}
              onChange={(e) => handleChange("e", e.target.value)}
              aria-label="Oswald Efficiency Factor"
            />
          </div>
          <div>
            <Label htmlFor="CD0">Zero-Lift Drag (CD0)</Label>
            <Input
              id="CD0"
              type="number"
              step="0.001"
              value={localParams.CD0}
              onChange={(e) => handleChange("CD0", e.target.value)}
              aria-label="Zero-Lift Drag Coefficient"
            />
          </div>
          <div>
            <Label htmlFor="P_bhp">Power (hp)</Label>
            <Input
              id="P_bhp"
              type="number"
              value={localParams.P_bhp}
              onChange={(e) => handleChange("P_bhp", e.target.value)}
              aria-label="Power in brake horsepower"
            />
          </div>
          <div>
            <Label htmlFor="eta_prop">Prop Efficiency</Label>
            <Input
              id="eta_prop"
              type="number"
              step="0.01"
              value={localParams.eta_prop}
              onChange={(e) => handleChange("eta_prop", e.target.value)}
              aria-label="Propeller Efficiency"
            />
          </div>
          <div>
            <Label htmlFor="CL_max">Max Lift Coeff (CL_max)</Label>
            <Input
              id="CL_max"
              type="number"
              step="0.1"
              value={localParams.CL_max}
              onChange={(e) => handleChange("CL_max", e.target.value)}
              aria-label="Maximum Lift Coefficient"
            />
          </div>
          <div>
            <Label htmlFor="SFC">SFC (lb/hp/hr)</Label>
            <Input
              id="SFC"
              type="number"
              step="0.01"
              value={localParams.SFC}
              onChange={(e) => handleChange("SFC", e.target.value)}
              aria-label="Specific Fuel Consumption in lb per hp per hour"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
