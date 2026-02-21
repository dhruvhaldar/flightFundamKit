"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { AircraftParams } from "@/types"

interface AircraftParametersProps {
  params: AircraftParams
  setParams: (params: AircraftParams) => void
}

const DEFAULT_PARAMS: AircraftParams = {
  m: 1100,
  S: 16.2,
  b: 11.0,
  e: 0.8,
  CD0: 0.027,
  P_bhp: 160,
  eta_prop: 0.8,
  CL_max: 1.6,
  SFC: 0.45
}

const PARAM_CONFIG: Record<keyof AircraftParams, { label: string; step?: string }> = {
  m: { label: "Mass (kg)", step: "1" },
  S: { label: "Wing Area (m²)", step: "0.1" },
  b: { label: "Wingspan (m)", step: "0.1" },
  e: { label: "Oswald Efficiency (e)", step: "0.01" },
  CD0: { label: "Zero-Lift Drag (CD0)", step: "0.001" },
  P_bhp: { label: "Power (hp)", step: "1" },
  eta_prop: { label: "Prop Efficiency", step: "0.01" },
  CL_max: { label: "Max Lift Coeff (CL_max)", step: "0.1" },
  SFC: { label: "SFC (lb/hp/hr)", step: "0.01" }
}

const validateParam = (key: keyof AircraftParams, val: number): string | null => {
  if (isNaN(val)) return "Invalid number"
  if (val < 0) return "Must be positive"

  switch (key) {
    case 'm':
    case 'S':
    case 'b':
    case 'P_bhp':
      if (val === 0) return "Must be > 0"
      break
    case 'e':
    case 'eta_prop':
      if (val > 1) return "Must be ≤ 1"
      if (val === 0) return "Must be > 0"
      break
  }
  return null
}

export default function AircraftParameters({ params, setParams }: AircraftParametersProps) {
  // Local state as strings for immediate input feedback
  const [localParams, setLocalParams] = useState<Record<keyof AircraftParams, string>>(() => {
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ) as Record<keyof AircraftParams, string>
  })

  // Derived validation
  const errors: Partial<Record<keyof AircraftParams, string>> = {}
  let hasErrors = false
  ;(Object.keys(localParams) as Array<keyof AircraftParams>).forEach((key) => {
      const valStr = localParams[key]
      const val = parseFloat(valStr)
      if (valStr.trim() !== "") {
        const error = validateParam(key, val)
        if (error) {
          errors[key] = error
          hasErrors = true
        }
      }
  })

  // Validate and debounce update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasErrors) return // Don't update parent if there are errors

      const nextParams = { ...params }
      let hasChanges = false

      ;(Object.keys(localParams) as Array<keyof AircraftParams>).forEach((key) => {
        const valStr = localParams[key]
        if (valStr.trim() === "") return

        const val = parseFloat(valStr)
        if (!isNaN(val) && val !== params[key]) {
          nextParams[key] = val
          hasChanges = true
        }
      })

      if (hasChanges) {
        setParams(nextParams)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localParams, params, setParams, hasErrors])

  // Sync local state if parent params update externally
  useEffect(() => {
    // eslint-disable-next-line
    setLocalParams((prev) => {
      const next = { ...prev }
      let needsUpdate = false

      ;(Object.keys(params) as Array<keyof AircraftParams>).forEach((key) => {
        const paramValue = params[key]
        const localValue = prev[key]
        const parsedLocal = localValue === "" ? 0 : parseFloat(localValue)

        // Only update if genuinely different and valid number
        if (!isNaN(parsedLocal) && parsedLocal !== paramValue) {
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

  const handleReset = () => {
    const newParams = { ...DEFAULT_PARAMS }
    setParams(newParams)
    // We also explicitly reset local params to ensure UI updates immediately
    // although the sync effect would handle it, doing it here is snappier
    setLocalParams(
      Object.fromEntries(
        Object.entries(newParams).map(([k, v]) => [k, String(v)])
      ) as Record<keyof AircraftParams, string>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Aircraft Parameters</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 lg:px-3"
          title="Reset to Standard C172 Defaults"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Defaults
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(PARAM_CONFIG) as Array<keyof AircraftParams>).map((key) => (
            <div key={key}>
              <Label
                htmlFor={key}
                className={errors[key] ? "text-destructive" : ""}
              >
                {PARAM_CONFIG[key].label}
              </Label>
              <Input
                id={key}
                type="number"
                step={PARAM_CONFIG[key].step}
                value={localParams[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className={errors[key] ? "border-destructive focus-visible:ring-destructive" : ""}
                aria-invalid={!!errors[key]}
                aria-errormessage={`${key}-error`}
              />
              {errors[key] && (
                <p id={`${key}-error`} className="text-xs text-destructive mt-1 font-medium">
                  {errors[key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
