"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AtmosphereCalculator from "@/components/AtmosphereCalculator"
import AircraftParameters from "@/components/AircraftParameters"
import PerformanceCharts from "@/components/PerformanceCharts"
import RangeCalculator from "@/components/RangeCalculator"
import { AircraftParams } from "@/types"

export default function Home() {
  const [params, setParams] = useState<AircraftParams>({
    m: 1100,
    S: 16.2,
    b: 11.0,
    e: 0.8,
    CD0: 0.027,
    P_bhp: 160,
    eta_prop: 0.8,
    CL_max: 1.6,
    SFC: 0.45
  })

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Flight Fundamentals Toolkit</h1>
        <p className="text-muted-foreground">
          Interactive tools for atmospheric flight, aerodynamics, and aircraft performance analysis.
        </p>
      </div>

      <Tabs defaultValue="atmosphere" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="atmosphere">Atmosphere</TabsTrigger>
          <TabsTrigger value="parameters">Aircraft Params</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="range">Range & Endurance</TabsTrigger>
        </TabsList>

        <TabsContent value="atmosphere" className="space-y-4">
          <AtmosphereCalculator />
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <AircraftParameters params={params} setParams={setParams} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceCharts params={params} />
        </TabsContent>

        <TabsContent value="range" className="space-y-4">
          <RangeCalculator params={params} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
