"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copiar enlace",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy}>
      {copied ? "✅ Copiado" : `🔗 ${label}`}
    </Button>
  );
}