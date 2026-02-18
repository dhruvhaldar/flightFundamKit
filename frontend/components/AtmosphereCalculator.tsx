"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { stdAtm } from "@/utils/flightMechanics"

const ALTITUDE_PRESETS = [
  { label: "Sea Level", value: "0" },
  { label: "1,000 m", value: "1000" },
  { label: "5,000 m", value: "5000" },
  { label: "Cruise (11 km)", value: "11000" },
]

export default function AtmosphereCalculator() {
  const [altitudeStr, setAltitudeStr] = useState<string>("0")

  // Derive result directly from input state
  let result: { T: number; P: number; rho: number; a: number } | null = null
  const val = parseFloat(altitudeStr)

  // Treat empty string or just whitespace as invalid.
  // parseFloat("   ") is NaN, so !isNaN(val) handles that too?
  // No, parseFloat("  12 ") is 12. parseFloat("") is NaN.
  // We want to allow "0" and "-100".
  if (altitudeStr.trim() !== "" && !isNaN(val)) {
    result = stdAtm(val) as { T: number; P: number; rho: number; a: number }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atmosphere Calculator (ISA)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="altitude">Altitude (m)</Label>
            <Input
              type="number"
              id="altitude"
              value={altitudeStr}
              onChange={(e) => setAltitudeStr(e.target.value)}
              placeholder="e.g. 0 (Sea Level)"
              aria-describedby="altitude-desc"
            />
            <p id="altitude-desc" className="text-sm text-muted-foreground">
              Enter altitude in meters to see atmospheric properties.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALTITUDE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setAltitudeStr(preset.value)}
                  aria-label={`Set altitude to ${preset.label}`}
                  className="h-8 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {result ? (
            <div className="mt-6 border-t pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Temperature</dt>
                  <dd className="text-2xl font-bold tracking-tight">
                    {result.T.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">K</span>
                  </dd>
                  <p className="text-xs text-muted-foreground">
                    {(result.T - 273.15).toFixed(1)} °C
                  </p>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Pressure</dt>
                  <dd className="text-2xl font-bold tracking-tight">
                    {(result.P / 100).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">hPa</span>
                  </dd>
                  <p className="text-xs text-muted-foreground">
                    {result.P.toFixed(0)} Pa
                  </p>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Density</dt>
                  <dd className="text-2xl font-bold tracking-tight">
                    {result.rho.toFixed(4)} <span className="text-sm font-normal text-muted-foreground">kg/m³</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Speed of Sound</dt>
                  <dd className="text-2xl font-bold tracking-tight">
                    {result.a.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">m/s</span>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-6 border-t pt-4 text-center text-muted-foreground">
              <p>Enter a valid altitude to see results.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
