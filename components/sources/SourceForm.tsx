"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { IncomeSource } from "@/lib/types"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const Schema = z.object({
    source_name: z.string().min(1, "Required"),
    source_type: z.string().nullable(),
    frequency: z.string().nullable(),
    expected_amount: z.number().nullable(),
    expected_monthly: z.number().nullable(),
    notes: z.string().nullable()
})

export type SourceFormValues = z.infer<typeof Schema>

interface Props {
    initial: IncomeSource | null
    onSubmit: (values: SourceFormValues) => void
}

export default function SourceForm({ initial, onSubmit }: Props) {
    const form = useForm<SourceFormValues>({
        resolver: zodResolver(Schema),
        defaultValues: {
            source_name: "",
            source_type: null,
            frequency: null,
            expected_amount: null,
            expected_monthly: null,
            notes: null
        }
    })

    useEffect(() => {
        if (initial) {
            form.reset({
                source_name: initial.source_name,
                source_type: initial.source_type,
                frequency: initial.frequency,
                expected_amount: initial.expected_amount,
                expected_monthly: initial.expected_monthly,
                notes: initial.notes
            })
        } else {
            form.reset({
                source_name: "",
                source_type: null,
                frequency: null,
                expected_amount: null,
                expected_monthly: null,
                notes: null
            })
        }
    }, [initial])

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div>
                <Label>Source Name</Label>
                <Input {...form.register("source_name")} />
            </div>

            <div>
                <Label>Type</Label>
                <Input {...form.register("source_type")} />
            </div>

            <div>
                <Label>Frequency</Label>
                <Input {...form.register("frequency")} />
            </div>

            <div>
                <Label>Expected Amount</Label>
                <Input type="number" step="0.01" {...form.register("expected_amount", { valueAsNumber: true })} />
            </div>

            <div>
                <Label>Expected Monthly</Label>
                <Input type="number" step="0.01" {...form.register("expected_monthly", { valueAsNumber: true })} />
            </div>

            <div>
                <Label>Notes</Label>
                <Textarea rows={4} {...form.register("notes")} />
            </div>

            <button type="submit" className="w-full bg-[#0A1E2D] text-white py-2 rounded">
                Save
            </button>

        </form>
    )
}
