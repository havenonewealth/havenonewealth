export function exportToCSV(filename: string, rows: any[]) {
    if (!rows || rows.length === 0) {
        alert("No data available for export.")
        return
    }

    const headers = Object.keys(rows[0])
    const csvContent = [
        headers.join(","),
        ...rows.map(row =>
            headers.map(h =>
                `"${String(row[h] ?? "").replace(/"/g, '""')}"`
            ).join(",")
        )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `${filename}.csv`)
    link.click()
}
