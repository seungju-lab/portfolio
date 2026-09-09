"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, TextLink } from "@/components/portfolio";

type PrintSession = {
  x: number;
  y: number;
  focus: HTMLElement | null;
  entered: boolean;
};

export function PrintToolbar() {
  const button = useRef<HTMLButtonElement>(null);
  const start = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const media = matchMedia("print");
    let session: PrintSession | null = null;
    let frame = 0;
    let present = true;
    const capture = (focus: HTMLElement | null): PrintSession => ({
      x: scrollX,
      y: scrollY,
      focus,
      entered: false,
    });
    const finish = () => {
      const completed = session;
      session = null;
      if (!present || !completed) return;
      setBusy(false);
      cancelAnimationFrame(frame);
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
    const before = () => {
      if (!present) return;
      session ??= capture(
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      );
      session.entered = true;
      setBusy(true);
    };
    const mediaChange = () => {
      if (media.matches) before();
      else finish();
    };
    const leave = () => {
      present = false;
      session = null;
      cancelAnimationFrame(frame);
    };
    const returnToPage = () => {
      present = true;
      setBusy(false);
    };
    start.current = () => {
      if (!present || session || media.matches) return;
      cancelAnimationFrame(frame);
      const requested = capture(button.current);
      session = requested;
      setError(false);
      setBusy(true);
      try {
        if (typeof window.print !== "function") throw new Error("Unavailable");
        window.print();
        // Blocking implementations without print events return after closing.
        if (session === requested && !requested.entered) finish();
      } catch {
        finish();
        setError(true);
      }
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", finish);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", returnToPage);
    media.addEventListener("change", mediaChange);
    const readyFrame = requestAnimationFrame(() => setReady(true));
    return () => {
      cancelAnimationFrame(readyFrame);
      leave();
      start.current = null;
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", finish);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", returnToPage);
      media.removeEventListener("change", mediaChange);
    };
  }, []);

  return (
    <header className="print-toolbar">
      <TextLink href="/" icon="back">
        홈으로
      </TextLink>
      <div className="print-action">
        <button
          ref={button}
          className="text-link print-button"
          type="button"
          disabled={!ready}
          aria-disabled={busy || undefined}
          aria-describedby="print-help"
          onClick={() => start.current?.()}
        >
          <Icon name="print" />
          <span>PDF로 저장</span>
        </button>
        <p id="print-help">브라우저 인쇄에서 PDF로 저장할 수 있습니다.</p>
        <p className="print-error" role="alert">
          {error &&
            "인쇄 창을 열지 못했습니다. 브라우저 메뉴의 인쇄 기능을 이용해 주세요."}
        </p>
        <noscript>브라우저 메뉴의 인쇄 기능을 이용해 주세요.</noscript>
      </div>
    </header>
  );
}
