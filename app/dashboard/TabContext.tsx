"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Tab =
  | "sources"
  | "archived"
  | "trash"        // ADDED
  | "payouts"
  | "analytics"
  | "admin"
  | "user"

interface TabContextType {
  activeTab: Tab
  setActiveTab: (t: Tab) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
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
