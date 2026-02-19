"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AircraftParams } from "@/types"
import { glidingRange, rangeBreguet } from "@/utils/flightMechanics"

interface RangeCalculatorProps {
  params: AircraftParams
}

export default function RangeCalculator({ params }: RangeCalculatorProps) {
  const [fuelMassStr, setFuelMassStr] = useState<string>("150")
  const [cruiseAltitudeStr, setCruiseAltitudeStr] = useState<string>("2000")
  const [result, setResult] = useState<{ glideRange: number; breguetRange: number; LDmax: number } | null>(null)

  // Validation
  const fuelMass = parseFloat(fuelMassStr)
  const cruiseAltitude = parseFloat(cruiseAltitudeStr)

  const validationError = useMemo(() => {
    if (isNaN(fuelMass)) return null
    if (fuelMass < 0) return "Fuel mass cannot be negative."
    if (fuelMass >= params.m) {
      return `Fuel mass must be less than aircraft mass (${params.m} kg).`
    }
    return null
  }, [fuelMass, params.m])

  const isValidFuel = !isNaN(fuelMass) && !validationError
  const isValidAlt = !isNaN(cruiseAltitude) && cruiseAltitude >= 0

  const calculate = () => {
    if (!isValidFuel || !isValidAlt) return

    const { m, S, b, e, CD0, SFC, eta_prop } = params
    const g = 9.80665

    // Induced drag factor k
    const AR = Math.pow(b, 2) / S
    const k = 1 / (Math.PI * e * AR)

    // Best L/D conditions (Min Drag)
    const CL_md = Math.sqrt(CD0 / k)
    const CD_md = 2 * CD0
    const LDmax = CL_md / CD_md

    // Glide Range
    const glideRangeVal = glidingRange(cruiseAltitude, 0, CL_md, CD_md)

    // Breguet Range
    const Wi = m * g
    const Wf = (m - fuelMass) * g

    const SFC_kg_Ws = (SFC * 0.453592) / (745.7 * 3600)
    const SFC_si = SFC_kg_Ws * g

    const breguetRangeVal = rangeBreguet(Wi, Wf, CL_md, CD_md, SFC_si, 0, true, eta_prop)

    setResult({
      glideRange: glideRangeVal,
      breguetRange: breguetRangeVal,
      LDmax: LDmax
    })
  }

  const ALTITUDE_PRESETS = [
    { label: "Sea Level", value: "0" },
    { label: "Cruise (2km)", value: "2000" },
    { label: "High (5km)", value: "5000" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Range & Endurance Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="fuelMass">Fuel Mass (kg)</Label>
            <Input
              type="number"
              id="fuelMass"
              value={fuelMassStr}
              onChange={(e) => setFuelMassStr(e.target.value)}
              className={validationError ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "fuel-error" : undefined}
            />
            {validationError && (
              <p id="fuel-error" className="text-sm text-red-500 font-medium">
                {validationError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Max available: {params.m} kg (Total Mass)
            </p>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cruiseAltitude">Cruise Altitude (m)</Label>
            <Input
              type="number"
              id="cruiseAltitude"
              value={cruiseAltitudeStr}
              onChange={(e) => setCruiseAltitudeStr(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {ALTITUDE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setCruiseAltitudeStr(preset.value)}
                  className="h-7 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={calculate}
          disabled={!isValidFuel || !isValidAlt}
          className="w-full sm:w-auto"
        >
          Calculate Range
        </Button>

        {result ? (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Max L/D Ratio</span>
              <span className="font-bold">{result.LDmax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Best Glide Range</span>
              <span className="font-bold">{(result.glideRange / 1000).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Max Range (Breguet)</span>
              <span className="font-bold text-primary">{(result.breguetRange / 1000).toFixed(1)} km</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p className="text-sm">Enter fuel and altitude parameters to estimate aircraft range capabilities.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
