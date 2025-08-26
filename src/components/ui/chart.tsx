"use client"

import * as React from "react"
import { ChartConfig, ChartContainer } from "./chart-container"

export * from "recharts"

export { ChartContainer, type ChartConfig }

export const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-background p-2 shadow-md ${className}`}
    {...props}
  >
    {children}
  </div>
))
ChartTooltip.displayName = "ChartTooltip"

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    labelKey?: string
    nameKey?: string
  }
>(({ className, hideLabel = false, hideIndicator = false, indicator = "dot", labelKey, nameKey, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`grid min-w-[8rem] items-start gap-1.5 ${className}`}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-center gap-4 ${className}`}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, hideIcon = false, nameKey, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center gap-2 ${className}`}
    {...props}
  />
))
ChartLegendContent.displayName = "ChartLegendContent"