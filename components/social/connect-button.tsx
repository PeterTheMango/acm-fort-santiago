"use client"

import * as React from "react"

export function ConnectButton({ targetUserId, initialConnected = false, initialRequested = false }: { targetUserId: string; initialConnected?: boolean; initialRequested?: boolean }) {
  const [connected, setConnected] = React.useState(initialConnected)
  const [requested, setRequested] = React.useState(initialRequested)
  const [busy, setBusy] = React.useState(false)

  async function connect() {
    setBusy(true)
    try {
      const res = await fetch("/api/connections/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ toUserId: targetUserId }),
      })
      if (!res.ok) throw new Error("Failed to send request")
      setRequested(true)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    try {
      const res = await fetch(`/api/connections?otherId=${encodeURIComponent(targetUserId)}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to remove connection")
      setConnected(false)
    } finally {
      setBusy(false)
    }
  }

  if (connected) {
    return (
      <button onClick={remove} disabled={busy} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">
        {busy ? "Removing..." : "Remove Connection"}
      </button>
    )
  }
  if (requested) {
    async function cancel() {
      setBusy(true)
      try {
        const res = await fetch(`/api/connections/requests?toUserId=${encodeURIComponent(targetUserId)}`, {
          method: "DELETE",
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to cancel request")
        setRequested(false)
      } finally { setBusy(false) }
    }
    return (
      <button onClick={cancel} disabled={busy} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">
        {busy ? "Cancelling..." : "Requested (Cancel)"}
      </button>
    )
  }
  return (
    <button onClick={connect} disabled={busy} className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm">
      {busy ? "Sending..." : "Connect"}
    </button>
  )
}
