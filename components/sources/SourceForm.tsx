"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { IncomeSource } from "@/lib/types"
import { saveSource } from "@/lib/supabase/sources"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    source_name: z.string().min(1, "Required"),
    source_type: z.string().nullable(),
    frequency: z.string().nullable(),
    expected_amount: z.number().nullable(),
    notes: z.string().nullable()
})

export type SourceFormValues = z.infer<typeof formSchema>

export default function SourceForm({
    initial,
    userId,
    onClose,
    onSaved
}: {
    initial?: IncomeSource | null
    userId: string
    onClose: () => void
    onSaved: () => void
}) {
    const [loading, setLoading] = useState(false)

    const form = useForm<SourceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            source_name: initial?.source_name ?? "",
            source_type: initial?.source_type ?? "",
            frequency: initial?.frequency ?? "",
            expected_amount: initial?.expected_amount ?? null,
            notes: initial?.notes ?? ""
        }
    })

    async function onSubmit(values: SourceFormValues) {
        setLoading(true)

        const payload = {
            user_id: userId,
            ...values
        }

        await saveSource(payload, initial?.id)

        onSaved()
        onClose()
        setLoading(false)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label>Source Name</Label>
                <Input {...form.register("source_name")} />
            </div>

            <div className="space-y-2">
                <Label>Type</Label>
                <Select
                    defaultValue={form.getValues("source_type") ?? ""}
                    onValueChange={(v) => form.setValue("source_type", v)}
                >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Royalty">Royalty</SelectItem>
                        <SelectItem value="Commission">Commission</SelectItem>
                        <SelectItem value="Rental">Rental</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                    defaultValue={form.getValues("frequency") ?? ""}
                    onValueChange={(v) => form.setValue("frequency", v)}
                >
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                        <SelectItem value="Varies">Varies</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Expected Amount</Label>
                <Input type="number" step="0.01" {...form.register("expected_amount", { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea rows={4} {...form.register("notes")} />
            </div>

            <Button className="w-full bg-[#0A1E2D] text-white" disabled={loading}>
                {loading ? "Saving…" : initial ? "Update Source" : "Create Source"}
            </Button>
        </form>
    )
}
