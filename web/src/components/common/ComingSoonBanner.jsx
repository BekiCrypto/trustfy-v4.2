import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock } from "lucide-react"

export default function ComingSoonBanner({
  title = "Coming Soon",
  description = "This module is available for preview only. Core escrow flows remain operational.",
}) {
  return (
    <Alert className="bg-slate-900/60 border-slate-700/60 mb-6">
      <Clock className="h-4 w-4 text-slate-300" />
      <AlertDescription className="text-slate-300 text-sm">
        <strong className="text-white">{title}:</strong> {description}
      </AlertDescription>
    </Alert>
  )
}
