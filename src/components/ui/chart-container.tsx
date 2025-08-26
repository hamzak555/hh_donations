"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: {
      light?: string
      dark?: string
    }
  }
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactElement
  className?: string
  width?: string | number
  height?: string | number
  aspect?: number
  minWidth?: number
  minHeight?: number
  maxHeight?: number
  debounce?: number
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ config, children, className, width = "100%", height = "100%", ...props }, ref) => {
  const id = React.useId()
  const [chart] = React.useState(() => {
    // Generate CSS variables from config
    const styles: Record<string, string> = {}
    
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        styles[`--color-${key}`] = value.color
      }
      if (value.theme?.light) {
        styles[`--color-${key}`] = value.theme.light
      }
    })
    
    return { id, styles }
  })

  return (
    <div
      ref={ref}
      className={cn("flex aspect-video justify-center text-xs", className)}
      style={
        {
          ...chart.styles,
          "--color-background": "hsl(var(--background))",
        } as React.CSSProperties
      }
    >
      <ResponsiveContainer width={width} height={height} {...props}>
        {children}
      </ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

export { ChartContainer }