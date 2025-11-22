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
        <Dialog
            open={open}
            // IMPORTANT: do NOT immediately cancel when open state changes
            onOpenChange={(state) => {
                if (!state) onCancel()
            }}
        >
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="bg-red-600 text-white"
                        onClick={() => {
                            // ENSURE confirm executes first
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
