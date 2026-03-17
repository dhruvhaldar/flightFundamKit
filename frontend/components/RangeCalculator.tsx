"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AircraftParams } from "@/types"
import { glidingRange, rangeBreguet } from "@/utils/flightMechanics"
import { Map } from "lucide-react"

const ALTITUDE_PRESETS = [
  { label: "Sea Level", value: "0" },
  { label: "Cruise (2km)", value: "2000" },
  { label: "High (5km)", value: "5000" },
]

interface RangeCalculatorProps {
  params: AircraftParams
}

export default function RangeCalculator({ params }: RangeCalculatorProps) {
  const [fuelMassStr, setFuelMassStr] = useState<string>("150")
  const [cruiseAltitudeStr, setCruiseAltitudeStr] = useState<string>("2000")

  const [isFuelTouched, setIsFuelTouched] = useState(false)
  const [isAltTouched, setIsAltTouched] = useState(false)

  // Validation
  const fuelMass = parseFloat(fuelMassStr)
  const cruiseAltitude = parseFloat(cruiseAltitudeStr)

  const isFuelEmpty = fuelMassStr.trim() === ""
  const isAltEmpty = cruiseAltitudeStr.trim() === ""

  const validationError = useMemo(() => {
    if (isFuelEmpty) return isFuelTouched ? "Required" : null
    if (isNaN(fuelMass)) return isFuelTouched ? "Invalid number" : null
    if (fuelMass < 0) return "Fuel mass cannot be negative."
    if (fuelMass >= params.m) {
      return `Fuel mass must be less than aircraft mass (${params.m} kg).`
    }
    return null
  }, [fuelMass, params.m, isFuelEmpty, isFuelTouched])

  const altValidationError = useMemo(() => {
    if (isAltEmpty) return isAltTouched ? "Required" : null
    if (isNaN(cruiseAltitude)) return isAltTouched ? "Invalid number" : null
    if (cruiseAltitude < 0) return "Cruise altitude cannot be negative."
    return null
  }, [cruiseAltitude, isAltEmpty, isAltTouched])

  const isValidFuel = !isFuelEmpty && !isNaN(fuelMass) && !validationError
  const isValidAlt = !isAltEmpty && !isNaN(cruiseAltitude) && !altValidationError

  // Reactive calculation
  const result = useMemo(() => {
    if (!isValidFuel || !isValidAlt) return null

    const { m, S, b, e, CD0, SFC, eta_prop } = params
    const g = 9.80665

    // Induced drag factor k
    // ⚡ Bolt Optimization: Replace Math.pow with multiplication for performance
    const AR = (b * b) / S
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

    return {
      glideRange: glideRangeVal,
      breguetRange: breguetRangeVal,
      LDmax: LDmax
    }
  }, [params, fuelMass, cruiseAltitude, isValidFuel, isValidAlt])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Range & Endurance Calculator</CardTitle>
        <p className="text-xs text-muted-foreground">All parameters are required.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="fuelMass" className={validationError ? "text-destructive" : ""}>
              Fuel Mass (kg) <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              type="number"
              step="any"
              id="fuelMass"
              value={fuelMassStr}
              onChange={(e) => setFuelMassStr(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setIsFuelTouched(true)}
              className={validationError ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "fuel-error fuel-helper" : "fuel-helper"}
              placeholder={`e.g. 150`}
              required
            />
            {validationError && (
              <p id="fuel-error" className="text-sm text-destructive font-medium">
                {validationError}
              </p>
            )}
            <div id="fuel-helper" className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fuel Load</span>
                <span>{!isNaN(fuelMass) && fuelMass >= 0 ? `${((Math.min(fuelMass, params.m) / params.m) * 100).toFixed(1)}% of MTOW` : "0%"}</span>
              </div>
              <div
                className="h-2 w-full bg-secondary rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={!isNaN(fuelMass) && fuelMass >= 0 ? Math.min((fuelMass / params.m) * 100, 100) : 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Fuel mass capacity"
              >
                <div
                  className={`h-full transition-all duration-300 ${validationError ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${!isNaN(fuelMass) && fuelMass >= 0 ? Math.min((fuelMass / params.m) * 100, 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Max available: {params.m} kg</p>
              <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Fuel mass presets">
                {[0.25, 0.5, 0.75, 1].map((frac) => {
                  const valStr = (params.m * frac).toFixed(0)
                  return (
                    <Button
                      key={frac}
                      type="button"
                      variant={fuelMassStr === valStr ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFuelMassStr(valStr)}
                      aria-label={`Set fuel mass to ${frac * 100}% of MTOW`}
                      aria-pressed={fuelMassStr === valStr}
                      className="h-7 text-xs"
                    >
                      {frac * 100}%
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cruiseAltitude" className={altValidationError ? "text-destructive" : ""}>
              Cruise Altitude (m) <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              type="number"
              step="any"
              id="cruiseAltitude"
              value={cruiseAltitudeStr}
              placeholder="e.g. 2000"
              onChange={(e) => setCruiseAltitudeStr(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setIsAltTouched(true)}
              className={altValidationError ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!altValidationError}
              aria-describedby={altValidationError ? "alt-error alt-helper" : "alt-helper"}
              required
            />
            {altValidationError && (
              <p id="alt-error" className="text-sm text-destructive font-medium">
                {altValidationError}
              </p>
            )}
            <p id="alt-helper" className="sr-only">
              Enter cruise altitude in meters.
            </p>
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Cruise altitude presets">
              {ALTITUDE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={cruiseAltitudeStr === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCruiseAltitudeStr(preset.value)}
                  aria-label={`Set cruise altitude to ${preset.label}`}
                  aria-pressed={cruiseAltitudeStr === preset.value}
                  className="h-7 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {result ? (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3" aria-live="polite">
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
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
            <Map className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
            <p className="text-sm">Please enter valid fuel and altitude parameters to see range estimates.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setFuelMassStr("150"); setCruiseAltitudeStr("2000"); }}
              className="mt-2"
            >
              Load Example Values
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
