"use client"

import { useState, useEffect, memo, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { stdAtm } from "@/utils/flightMechanics"
import { Check, Copy, Cloud } from "lucide-react"

const ALTITUDE_PRESETS = [
  { label: "Sea Level", value: "0" },
  { label: "1,000 m", value: "1000" },
  { label: "5,000 m", value: "5000" },
  { label: "Cruise (11 km)", value: "11000" },
]

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ml-2 transition-all ${copied ? "text-foreground scale-110" : "text-muted-foreground hover:text-foreground hover:scale-105"}`}
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy to clipboard"}
        aria-label={copied ? `Copied ${label} to clipboard` : `Copy ${label} value of ${value}`}
      >
        {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? `Copied ${label} to clipboard` : ""}
      </span>
    </>
  )
}

// ⚡ Bolt Optimization: Added React.memo() to prevent unnecessary re-renders.
// Since AtmosphereCalculator takes no props and maintains its own isolated state,
// wrapping it in memo() prevents it from re-rendering every time the parent (page.tsx)
// updates the global `params` state (e.g., when a user edits an aircraft parameter).
// This saves React from needlessly evaluating this component tree.
const AtmosphereCalculator = memo(function AtmosphereCalculator() {
  const [altitudeStr, setAltitudeStr] = useState<string>("0")
  const [isTouched, setIsTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Derive result directly from input state
  let result: { T: number; P: number; rho: number; a: number } | null = null
  const val = parseFloat(altitudeStr)

  // Treat empty string or just whitespace as invalid.
  // parseFloat("   ") is NaN, so !isNaN(val) handles that too?
  // No, parseFloat("  12 ") is 12. parseFloat("") is NaN.
  // We want to allow "0" and "-100".
  const isAltitudeEmpty = altitudeStr.trim() === ""
  const showError = isAltitudeEmpty && isTouched

  if (!isAltitudeEmpty && !isNaN(val)) {
    result = stdAtm(val) as { T: number; P: number; rho: number; a: number }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atmosphere Calculator (ISA)</CardTitle>
        <p className="text-xs text-muted-foreground">All parameters are required.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="altitude" className={showError ? "text-destructive" : ""}>
              Altitude (m) <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              type="number"
              step="any"
              id="altitude"
              ref={inputRef}
              value={altitudeStr}
              onChange={(e) => setAltitudeStr(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setIsTouched(true)}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur()
                }
              }}
              placeholder="e.g. 0 (Sea Level)"
              className={showError ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={showError}
              aria-describedby={showError ? "altitude-error altitude-desc" : "altitude-desc"}
              required
            />
            {showError && (
              <p id="altitude-error" className="text-xs text-destructive font-medium" role="alert">
                Required
              </p>
            )}
            <p id="altitude-desc" className="text-sm text-muted-foreground">
              Enter altitude in meters to see atmospheric properties.
            </p>
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Altitude presets">
              {ALTITUDE_PRESETS.map((preset) => {
                const targetVal = parseFloat(preset.value)
                const isActive = !isNaN(val) && val === targetVal
                return (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAltitudeStr(preset.value)}
                    aria-label={`Set altitude to ${preset.label}`}
                    aria-pressed={isActive}
                    className="h-8 text-xs"
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {result ? (
            <div className="mt-6 border-t pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Temperature</dt>
                  <dd className="text-2xl font-bold tracking-tight flex items-center">
                    {result.T.toFixed(2)} <span className="text-sm font-normal text-muted-foreground ml-1">K</span>
                    <CopyButton value={result.T.toFixed(2)} label="Temperature" />
                  </dd>
                  <dd className="text-xs text-muted-foreground">
                    {(result.T - 273.15).toFixed(1)} °C
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Pressure</dt>
                  <dd className="text-2xl font-bold tracking-tight flex items-center">
                    {(result.P / 100).toFixed(2)} <span className="text-sm font-normal text-muted-foreground ml-1">hPa</span>
                    <CopyButton value={(result.P / 100).toFixed(2)} label="Pressure (hPa)" />
                  </dd>
                  <dd className="text-xs text-muted-foreground flex items-center gap-1">
                    {result.P.toFixed(0)} Pa
                    <CopyButton value={result.P.toFixed(0)} label="Pressure (Pa)" />
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Density</dt>
                  <dd className="text-2xl font-bold tracking-tight flex items-center">
                    {result.rho.toFixed(4)} <span className="text-sm font-normal text-muted-foreground ml-1">kg/m³</span>
                    <CopyButton value={result.rho.toFixed(4)} label="Density" />
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Speed of Sound</dt>
                  <dd className="text-2xl font-bold tracking-tight flex items-center">
                    {result.a.toFixed(1)} <span className="text-sm font-normal text-muted-foreground ml-1">m/s</span>
                    <CopyButton value={result.a.toFixed(1)} label="Speed of Sound" />
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-6 border-t pt-8 pb-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
              <Cloud className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p>Enter a valid altitude to see results.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAltitudeStr("0")
                  setTimeout(() => inputRef.current?.focus(), 0)
                }}
                className="mt-2"
              >
                Use Sea Level
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export default AtmosphereCalculator
