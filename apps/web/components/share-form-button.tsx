"use client";

import { useState } from "react";
import { IconCheck, IconShare } from "@tabler/icons-react";

import { Button } from "~/components/ui/button";

export function ShareFormButton({
  formId,
  disabled,
}: {
  formId: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = `${window.location.origin}/form/${formId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      onClick={onShare}
      disabled={disabled}
      title={disabled ? "Publish the form to share it" : undefined}
    >
      {copied ? <IconCheck /> : <IconShare />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
