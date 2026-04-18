"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw, Check, Info } from "lucide-react"
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

const PARAM_CONFIG: Record<keyof AircraftParams, { label: string; step?: string; desc: string }> = {
  m: { label: "Mass (kg)", step: "1", desc: "Total aircraft mass including payload and fuel." },
  S: { label: "Wing Area (m²)", step: "0.1", desc: "Total planform area of the wings." },
  b: { label: "Wingspan (m)", step: "0.1", desc: "Distance from left to right wingtip." },
  e: { label: "Oswald Efficiency (e)", step: "0.01", desc: "Correction factor for non-ideal lift distribution (typically 0.7 - 0.85)." },
  CD0: { label: "Zero-Lift Drag (CD0)", step: "0.001", desc: "Parasite drag coefficient at zero lift." },
  P_bhp: { label: "Power (hp)", step: "1", desc: "Maximum engine shaft brake horsepower." },
  eta_prop: { label: "Prop Efficiency", step: "0.01", desc: "Propeller efficiency factor (typically 0.75 - 0.85)." },
  CL_max: { label: "Max Lift Coeff (CL_max)", step: "0.1", desc: "Maximum lift coefficient before aerodynamic stall." },
  SFC: { label: "SFC (lb/hp/hr)", step: "0.01", desc: "Specific Fuel Consumption (mass of fuel per hour per hp)." }
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
  const [isResetting, setIsResetting] = useState(false)
  const [openHelps, setOpenHelps] = useState<Partial<Record<keyof AircraftParams, boolean>>>({})

  const isDefault = Object.keys(DEFAULT_PARAMS).every(
    (key) => params[key as keyof AircraftParams] === DEFAULT_PARAMS[key as keyof AircraftParams]
  )

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
      if (valStr.trim() === "") {
        errors[key] = "Required"
        hasErrors = true
      } else {
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

  useEffect(() => {
    if (isResetting) {
      const timeout = setTimeout(() => setIsResetting(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [isResetting])

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
    setIsResetting(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Aircraft Parameters</CardTitle>
          <p className="text-xs text-muted-foreground">
            All parameters are required for accurate simulation.
          </p>
        </div>
        <span
          title={isDefault && !isResetting ? "Already at default values" : "Reset to Standard C172 Defaults"}
          className={isDefault && !isResetting ? "inline-block cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md" : "inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"}
          tabIndex={isDefault && !isResetting ? 0 : undefined}
          aria-label={isDefault && !isResetting ? "Reset button is disabled because values are already at default" : undefined}
        >
          <Button
            variant={isResetting ? "secondary" : "outline"}
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3 transition-all"
            disabled={isDefault && !isResetting}
            aria-disabled={isResetting}
          >
            {isResetting ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" aria-hidden="true" />
                Restored
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Reset Defaults
              </>
            )}
          </Button>
        </span>
        <span aria-live="polite" className="sr-only">
          {isResetting ? "Aircraft parameters reset to default values" : ""}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[
            { title: "Geometry & Mass", keys: ["m", "S", "b"] as Array<keyof AircraftParams> },
            { title: "Aerodynamics", keys: ["CD0", "e", "CL_max"] as Array<keyof AircraftParams> },
            { title: "Propulsion", keys: ["P_bhp", "eta_prop", "SFC"] as Array<keyof AircraftParams> },
          ].map((group) => (
            <fieldset key={group.title} className="space-y-4 rounded-md border p-4">
              <legend className="px-1 text-sm font-medium text-foreground">{group.title}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.keys.map((key) => (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Label
                        htmlFor={key}
                        className={errors[key] ? "text-destructive" : ""}
                      >
                        {PARAM_CONFIG[key].label} <span className="text-destructive" aria-hidden="true">*</span>
                      </Label>
                      <button
                        type="button"
                        title={PARAM_CONFIG[key].desc}
                        className="text-muted-foreground hover:text-foreground cursor-help transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm inline-flex items-center justify-center"
                        aria-label={`Toggle help for ${PARAM_CONFIG[key].label}`}
                        aria-expanded={!!openHelps[key]}
                        aria-controls={`${key}-desc`}
                        onClick={() => setOpenHelps((prev) => ({ ...prev, [key]: !prev[key] }))}
                      >
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <Input
                      id={key}
                      type="number"
                      required
                      step={PARAM_CONFIG[key].step}
                      value={localParams[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur()
                        }
                      }}
                      className={errors[key] ? "border-destructive focus-visible:ring-destructive" : ""}
                      aria-invalid={!!errors[key]}
                      aria-describedby={`${errors[key] ? `${key}-error ` : ''}${key}-desc`}
                      placeholder={`e.g. ${DEFAULT_PARAMS[key]}`}
                    />
                    <p
                      id={`${key}-desc`}
                      className={openHelps[key] ? "text-xs text-muted-foreground mt-1.5 animate-in fade-in slide-in-from-top-1" : "sr-only"}
                    >
                      {PARAM_CONFIG[key].desc}
                    </p>
                    {errors[key] && (
                      <p id={`${key}-error`} className="text-xs text-destructive mt-1 font-medium" role="alert">
                        {errors[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
