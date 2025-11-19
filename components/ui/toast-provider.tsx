"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ToastAction {
    label: string
    onClick: () => void
}

export interface ToastMessage {
    id: string
    title?: string
    description?: string
    action?: ToastAction
    duration?: number
}

interface ToastContextState {
    toasts: ToastMessage[]
    showToast: (msg: Omit<ToastMessage, "id">) => void
}

const ToastContext = createContext<ToastContextState | null>(null)

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used inside ToastProvider")
    return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    function showToast(msg: Omit<ToastMessage, "id">) {
        const id = Math.random().toString(36).slice(2)

        const toast = {
            id,
            duration: 5000,
            ...msg
        }

        setToasts((prev) => [...prev, toast])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, toast.duration)
    }

    return (
        <ToastContext.Provider value={{ toasts, showToast }}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
    return (
        <div className="fixed bottom-6 right-6 space-y-3 z-[99999]">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="bg-white shadow-xl border rounded-lg p-4 w-80 animate-slide-up"
                >
                    {t.title && <p className="font-semibold">{t.title}</p>}
                    {t.description && (
                        <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                    )}
                    {t.action && (
                        <button
                            onClick={t.action.onClick}
                            className="mt-2 text-[#0A1E2D] font-semibold text-sm"
                        >
                            {t.action.label}
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}
