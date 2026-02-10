"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { stdAtm } from "@/utils/flightMechanics"

export default function AtmosphereCalculator() {
  const [altitude, setAltitude] = useState<number>(0)
  const [result, setResult] = useState<{ T: number; P: number; rho: number; a: number } | null>(null)

  const calculate = () => {
    const res = stdAtm(altitude) as { T: number; P: number; rho: number; a: number }
    setResult(res)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atmosphere Calculator (ISA)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="altitude">Altitude (m)</Label>
          <Input
            type="number"
            id="altitude"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
          />
        </div>
        <Button onClick={calculate}>Calculate</Button>

        {result && (
          <div className="mt-4 space-y-2">
            <p><strong>Temperature:</strong> {result.T.toFixed(2)} K</p>
            <p><strong>Pressure:</strong> {result.P.toFixed(2)} Pa</p>
            <p><strong>Density:</strong> {result.rho.toFixed(4)} kg/m³</p>
            <p><strong>Speed of Sound:</strong> {result.a.toFixed(2)} m/s</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
