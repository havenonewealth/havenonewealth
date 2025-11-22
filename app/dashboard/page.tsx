"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useTabs } from "./TabContext"
import { IncomeSource, Payout, MonthlyTrend } from "@/lib/types"

import {
  getActiveSources,
  getArchivedSources,
  archiveSource,
  unarchiveSource,
  getSourceById
} from "@/lib/supabase/sources"

import { getPayouts } from "@/lib/supabase/payouts"

import SourceList from "@/components/sources/SourceList"
import ArchivedList from "@/components/sources/ArchivedList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {

  const { toast } = useToast()
  const router = useRouter()
  const { activeTab } = useTabs()

  const [user, setUser] = useState<any>(null)
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [archivedSources, setArchivedSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])

  const [slideOpen, setSlideOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiveId, setArchiveId] = useState<string | null>(null)

  const [confirmUnarchive, setConfirmUnarchive] = useState(false)
  const [unarchiveId, setUnarchiveId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getUser()
      if (!session.user) return router.push("/login")

      setUser(session.user)
      const uid = session.user.id

      setSources(await getActiveSources(uid))
      setArchivedSources(await getArchivedSources(uid))
      setPayouts(await getPayouts(uid))
    }
    load()
  }, [])

  async function refresh() {
    const uid = user.id
    setSources(await getActiveSources(uid))
    setArchivedSources(await getArchivedSources(uid))
  }

  async function doArchive() {
    if (!archiveId) return
    await archiveSource(archiveId)
    toast({ title: "Archived" })
    setConfirmArchive(false)
    refresh()
  }

  async function doUnarchive() {
    if (!unarchiveId) return
    await unarchiveSource(unarchiveId)
    toast({ title: "Restored" })
    setConfirmUnarchive(false)
    refresh()
  }

  return (
    <div className="mt-6">

      <ConfirmDialog
        open={confirmArchive}
        title="Archive Source"
        description="Are you sure?"
        onCancel={() => setConfirmArchive(false)}
        onConfirm={doArchive}
      />

      <ConfirmDialog
        open={confirmUnarchive}
        title="Restore Source"
        description="Restore this item?"
        onCancel={() => setConfirmUnarchive(false)}
        onConfirm={doUnarchive}
      />

      <SourceSlideOver
        sourceId={editingId}
        userId={user?.id}
        open={slideOpen}
        onClose={() => { setEditingId(null); setSlideOpen(false) }}
        onSaved={refresh}
      />

      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          onAdd={() => { setEditingId(null); setSlideOpen(true) }}
          onEdit={(id) => { setEditingId(id); setSlideOpen(true) }}
          onArchive={(id) => { setArchiveId(id); setConfirmArchive(true) }}
        />
      )}

      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(s) => { setUnarchiveId(s.id); setConfirmUnarchive(true) }}
        />
      )}

      {/* payouts + analytics omitted for brevity since not part of bug */}
    </div>
  )
}
