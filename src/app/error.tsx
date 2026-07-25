"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-destructive">500</h1>
          <h2 className="text-2xl font-heading font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            We&apos;ve encountered an unexpected error and our engineering team has been notified.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
