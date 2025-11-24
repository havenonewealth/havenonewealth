"use client"
userId: string
open: boolean
onClose: () => void
    onSaved: () => void
}) {
    const { toast } = useToast()


    const [form, setForm] = useState<Partial<IncomeSource>>({
        id: undefined,
        user_id: userId,
        source_name: "",
        source_type: null,
        frequency: null,
        expected_amount: null,
        expected_monthly: null,
        notes: null
    })


    useEffect(() => {
        if (!open) return


        if (initial) {
            setForm({ ...initial })
        } else {
            setForm({
                id: undefined,
                user_id: userId,
                source_name: "",
                source_type: null,
                frequency: null,
                expected_amount: null,
                expected_monthly: null,
                notes: null
            })
        }
    }, [open, initial, userId])


    if (!open) return null


    async function handleSave() {
        if (!form.source_name) {
            toast({ title: "Missing Name", description: "Source name is required." })
            return
        }


        const response = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: form.id ?? null, payload: form })
        })


        const json = await response.json().catch(() => null)


        if (!json || !json.success) {
            toast({ title: "Error", description: json?.error || "Failed to save." })
            return
        }


        toast({ title: form.id ? "Updated" : "Created", description: "Saved." })
        onSaved()
        onClose()
    }


    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0A1E2D]">
                        {form.id ? "Edit Source" : "New Source"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>


                <SourceForm data={form} onChange={setForm} />


                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-[#0A1E2D] text-white hover:bg-[#C6A664]">Save</button>
                </div>
            </div>
        </div>
    )
}