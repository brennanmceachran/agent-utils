"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
  title?: string;
  iconOnly?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

export function CopyButton({
  value,
  label = "Copy",
  title,
  iconOnly = false,
  variant = "outline",
  size,
  className,
}: CopyButtonProps) {
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

  const visibleLabel = copied ? "Copied" : label;
  const buttonTitle = copied ? "Copied" : (title ?? label);
  const buttonSize = size ?? (iconOnly ? "icon" : "sm");

  return (
    <Button
      size={buttonSize}
      variant={variant}
      onClick={handleCopy}
      className={className}
      title={buttonTitle}
      aria-label={visibleLabel}
      type="button"
    >
      {iconOnly ? (
        <>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">{visibleLabel}</span>
        </>
      ) : (
        visibleLabel
      )}
    </Button>
  );
}
