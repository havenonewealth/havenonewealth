"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
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
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button className="bg-red-600 text-white" onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
