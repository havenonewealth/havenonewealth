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
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="max-w-sm p-6">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="border-gray-300"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={onConfirm}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Confirm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
