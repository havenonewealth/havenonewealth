"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
    {
        variants: {
            variant: {
                default: "border bg-white text-slate-950",
                destructive:
                    "group destructive border-red-500 bg-red-500 text-white shadow-red-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export const ToastContext = React.createContext({
    toasts: [] as any[],
    toast: (props: any) => { },
    dismiss: (id: string) => { },
})

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = React.useState<any[]>([])

    function toast(props: any) {
        const id = Math.random().toString(36).substring(2, 9)

        setToasts((current) => [...current, { id, ...props }])

        return {
            id,
            dismiss: () => dismiss(id),
        }
    }

    function dismiss(id: string) {
        setToasts((current) => current.filter((t) => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
        </ToastContext.Provider>
    )
}

export const Toast = ({
    children,
    variant,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }) => {
    return (
        <div className={cn(toastVariants({ variant }))} {...props}>
            {children}
        </div>
    )
}

export const ToastTitle = ({ children }: { children?: React.ReactNode }) => (
    <div className="text-sm font-semibold">{children}</div>
)

export const ToastDescription = ({
    children,
}: {
    children?: React.ReactNode
}) => <div className="text-sm opacity-90">{children}</div>

export const ToastClose = () => null

export const ToastViewport = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3" />
)
