"use client"

import { createContext, useContext, useState } from "react"

type Tab = "sources" | "archived" | "payouts" | "analytics"

interface TabContextValue {
  activeTab: Tab
  setActiveTab: (t: Tab) => void
}

const TabContext = createContext<TabContextValue | undefined>(undefined)

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("sources")

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error("useTabs must be used inside <TabProvider>")
  return ctx
}
