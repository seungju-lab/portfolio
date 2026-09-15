"use client";

import { useEffect } from "react";
import { TextLink } from "@/components/portfolio";

type PrintSession = { x: number; y: number; focus: HTMLElement | null };

export function PrintToolbar() {
  useEffect(() => {
    let session: PrintSession | null = null;
    let frame = 0;
    let present = true;
    const before = () => {
      if (!present) return;
      cancelAnimationFrame(frame);
      session ??= {
        x: scrollX,
        y: scrollY,
        focus:
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null,
      };
    };
    const finish = () => {
      const completed = session;
      session = null;
      if (!present || !completed) return;
      frame = requestAnimationFrame(() => {
        if (!present) return;
        window.scrollTo({
          left: completed.x,
          top: completed.y,
          behavior: "instant",
        });
        if (completed.focus?.isConnected)
          completed.focus.focus({ preventScroll: true });
      });
    };
    const leave = () => {
      present = false;
      session = null;
      cancelAnimationFrame(frame);
    };
    const returnToPage = () => {
      present = true;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", finish);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", returnToPage);
    return () => {
      leave();
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", finish);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", returnToPage);
    };
  }, []);

  return (
    <header className="print-toolbar">
      <TextLink href="/" icon="back">
        홈으로
      </TextLink>
    </header>
  );
}
