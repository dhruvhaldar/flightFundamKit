"use client"

import { useState } from "react"
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
  const [fuelMass, setFuelMass] = useState<number>(150)
  const [cruiseAltitude, setCruiseAltitude] = useState<number>(2000)
  const [result, setResult] = useState<{ glideRange: number; breguetRange: number; LDmax: number } | null>(null)

  const calculate = () => {
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

    // SFC Conversion: lb/hp/hr -> N / (W*s) * g ?
    // Wait, range_breguet expects SFC in "Power SFC (N / (W * s) or 1/m)" for prop.
    // MATLAB code: SFC_si = (0.2041 / (745.7 * 3600)) * g;
    // 0.45 lb/hp/hr -> 0.2041 kg/hp/hr -> ...
    // Let's replicate the conversion factor.
    // 1 lb = 0.453592 kg
    // 1 hp = 745.7 W
    // 1 hr = 3600 s
    // SFC (lb/hp/hr) * 0.453592 / 745.7 / 3600 -> kg/(W*s)
    // Then multiply by g to get N/(W*s) ?? Or does range_breguet expect kg based?
    // range_breguet docs: "SFC ... For Prop: Power SFC (N / (W * s) or 1/m)"
    // If SFC is mass flow per power (kg/W/s), then * g gives weight flow per power (N/W/s).
    // So yes, multiply by g.

    const SFC_kg_Ws = (SFC * 0.453592) / (745.7 * 3600)
    const SFC_si = SFC_kg_Ws * g

    const breguetRangeVal = rangeBreguet(Wi, Wf, CL_md, CD_md, SFC_si, 0, true, eta_prop)

    setResult({
      glideRange: glideRangeVal,
      breguetRange: breguetRangeVal,
      LDmax: LDmax
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Range & Endurance Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="fuelMass">Fuel Mass (kg)</Label>
          <Input
            type="number"
            id="fuelMass"
            value={fuelMass}
            onChange={(e) => setFuelMass(Number(e.target.value))}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="cruiseAltitude">Cruise Altitude (m)</Label>
          <Input
            type="number"
            id="cruiseAltitude"
            value={cruiseAltitude}
            onChange={(e) => setCruiseAltitude(Number(e.target.value))}
          />
        </div>
        <Button onClick={calculate}>Calculate</Button>

        {result && (
          <div className="mt-4 space-y-2">
            <p><strong>Max L/D Ratio:</strong> {result.LDmax.toFixed(2)}</p>
            <p><strong>Best Glide Range:</strong> {(result.glideRange / 1000).toFixed(2)} km</p>
            <p><strong>Max Range (Breguet):</strong> {(result.breguetRange / 1000).toFixed(2)} km</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
