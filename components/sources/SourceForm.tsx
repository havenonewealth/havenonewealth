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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

// --------------------------------------------------
//  VALIDATION SCHEMA (matches your DB schema now)
// --------------------------------------------------
const formSchema = z.object({
    source_name: z.string().min(1, "Required"),
    source_type: z.string().nullable(),
    frequency: z.string().nullable(),
    expected_amount: z.number().nullable(),
    notes: z.string().nullable()
})

export type SourceFormValues = z.infer<typeof formSchema>

// --------------------------------------------------
//  COMPONENT
// --------------------------------------------------
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

    // --------------------------------------------------
    //  SUBMIT HANDLER
    // --------------------------------------------------
    async function onSubmit(values: SourceFormValues) {
        try {
            setLoading(true)

            const payload = {
                source_name: values.source_name,
                source_type: values.source_type,
                frequency: values.frequency,
                expected_amount: values.expected_amount,
                notes: values.notes
            }

            await saveSource(userId, initial?.id ?? null, payload)

            onSaved()
            onClose()

        } catch (err) {
            console.error("Save error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* NAME */}
            <div className="space-y-2">
                <Label>Source Name</Label>
                <Input
                    {...form.register("source_name")}
                    placeholder="e.g. Amazon KDP, Rental Income"
                />
            </div>

            {/* TYPE */}
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

            {/* FREQUENCY */}
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

            {/* EXPECTED AMOUNT */}
            <div className="space-y-2">
                <Label>Expected Amount</Label>
                <Input
                    type="number"
                    step="0.01"
                    {...form.register("expected_amount", { valueAsNumber: true })}
                />
            </div>

            {/* NOTES */}
            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                    {...form.register("notes")}
                    rows={4}
                />
            </div>

            {/* SUBMIT */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A1E2D] text-white"
            >
                {loading ? "Saving…" : initial ? "Update Source" : "Create Source"}
            </Button>
        </form>
    )
}
