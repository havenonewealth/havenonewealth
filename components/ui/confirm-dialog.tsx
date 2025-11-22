"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    description,
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) onCancel()
        }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex justify-end gap-4">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>

                    <Button
                        className="bg-red-600 text-white"
                        onClick={() => {
                            // DO NOT auto-close here
                            // Let DashboardPage close the dialog AFTER archive completes
                            onConfirm()
                        }}
                    >
                        Confirm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
