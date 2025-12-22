import { useState, type FormEvent } from "react"
import { presignEvidence } from "../lib/api"
import { useCommitEvidence, useEvidenceList } from "../hooks/evidence"
import type { EvidenceEntry } from "@trustfy/shared"

const hashFile = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export const EvidenceUploader = ({ escrowId }: { escrowId: string }) => {
  const { data: list, isLoading } = useEvidenceList(escrowId)
  const mutation = useCommitEvidence(escrowId)
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return
    setStatus("saving")
    try {
      const sha256 = await hashFile(file)
      const presign = await presignEvidence(escrowId, {
        filename: file.name,
        size: file.size,
        mime: file.type || "application/octet-stream",
        sha256,
      })

      await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      })

      await mutation.mutateAsync({
        key: presign.key,
        uri: presign.uri,
        sha256,
        mime: file.type || "application/octet-stream",
        size: file.size,
        description,
      })

      setFile(null)
      setDescription("")
      setStatus("success")
    } catch (error) {
      console.error("evidence upload failed", error)
      setStatus("error")
    }
  }

  return (
    <section className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Evidence</p>
        {list?.length ? (
          <span className="badge-soft">{list.length} files</span>
        ) : null}
      </div>

      <form className="space-y-4 rounded-2xl border border-[color:var(--line)] bg-slate-900/60 p-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
            Upload file
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="input"
          />
          {file && (
            <div className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-slate-900/70 px-3 py-2 text-xs text-[color:var(--muted)]">
              <span>{file.name}</span>
              <button
                type="button"
                className="btn btn-ghost text-[0.6rem] uppercase tracking-[0.25em]"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe the evidence"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full text-xs uppercase tracking-[0.25em] disabled:opacity-50"
          disabled={mutation.isPending || !file}
        >
          {mutation.isPending ? "Uploading…" : "Upload evidence"}
        </button>
        {status === "success" && (
          <p className="text-xs text-[color:var(--accent)]">Evidence recorded.</p>
        )}
        {status === "error" && (
          <p className="text-xs text-[#b13636]">Upload failed. Check your setup.</p>
        )}
      </form>

      <div className="space-y-3">
        {isLoading && (
          <p className="text-xs text-[color:var(--muted)]">Loading evidence…</p>
        )}
        {!isLoading && !list?.length && (
          <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-4 text-center text-xs text-[color:var(--muted)]">
            No evidence uploaded yet.
          </div>
        )}
        {list?.map((item: EvidenceEntry) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[color:var(--line)] bg-slate-900/60 px-3 py-2 text-xs text-[color:var(--muted)]"
          >
            <div>
              <p className="text-xs font-semibold text-[color:var(--ink)]">{item.description || "Evidence"}</p>
              <p className="text-[0.7rem] text-[color:var(--muted)]">{item.uploader}</p>
              <p className="text-[0.65rem] text-[color:var(--muted)]">
                {item.mime} · {item.size} bytes
              </p>
              <p className="text-[0.65rem] text-[color:var(--muted)]">
                SHA256 {item.sha256.slice(0, 16)}…{item.sha256.slice(-8)}
              </p>
            </div>
            <a
              href={item.uri}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline text-[0.6rem] uppercase tracking-[0.3em]"
            >
              View
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
