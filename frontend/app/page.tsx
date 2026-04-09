"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AtmosphereCalculator from "@/components/AtmosphereCalculator"
import AircraftParameters from "@/components/AircraftParameters"
import RangeCalculator from "@/components/RangeCalculator"
import { AircraftParams } from "@/types"
import { Loader2, Cloud, SlidersHorizontal, TrendingUp, Map as MapIcon } from "lucide-react"

// Lazy load PerformanceCharts to reduce initial bundle size as it contains heavy Recharts library
// and is not visible on initial load.
const PerformanceCharts = dynamic(() => import("@/components/PerformanceCharts"), {
  loading: () => (
    <div className="space-y-8" role="status" aria-label="Loading performance charts">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[400px] flex items-center justify-center flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="text-muted-foreground animate-pulse">Loading Power Curve...</p>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[400px] flex items-center justify-center flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="text-muted-foreground animate-pulse">Loading Climb Rate...</p>
      </div>
    </div>
  ),
  ssr: false,
})

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

  const [activeTab, setActiveTab] = useState("atmosphere")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (["atmosphere", "parameters", "performance", "range"].includes(hash)) {
        setActiveTab(hash)
      }
    }

    // Set initial tab based on hash
    handleHashChange()

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Dynamically update document title based on active tab for better accessibility and bookmarking
  useEffect(() => {
    const tabTitles: Record<string, string> = {
      "atmosphere": "Atmosphere Calculator - Flight Toolkit",
      "parameters": "Aircraft Parameters - Flight Toolkit",
      "performance": "Performance Charts - Flight Toolkit",
      "range": "Range Calculator - Flight Toolkit"
    }
    if (tabTitles[activeTab]) {
      document.title = tabTitles[activeTab]
    }
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    window.location.hash = value
  }

  return (
    <main id="main-content" className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Flight Fundamentals Toolkit</h1>
        <p className="text-muted-foreground">
          Interactive tools for atmospheric flight, aerodynamics, and aircraft performance analysis.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1" aria-label="Flight Calculator Tools">
          <TabsTrigger value="atmosphere" className="gap-2 py-2">
            <Cloud className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">Atmosphere</span>
          </TabsTrigger>
          <TabsTrigger value="parameters" className="gap-2 py-2">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">Aircraft Params</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2 py-2">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="range" className="gap-2 py-2">
            <MapIcon className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">Range & Endurance</span>
          </TabsTrigger>
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
