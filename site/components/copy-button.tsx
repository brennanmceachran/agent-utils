"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleCopy}>
      {copied ? "Copied" : label}
    </Button>
  );
}
