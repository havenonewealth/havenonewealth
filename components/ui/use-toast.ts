"use client"

import * as React from "react"
import { ToastContext } from "./toast"

export function useToast() {
    return React.useContext(ToastContext)
}
