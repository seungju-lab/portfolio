"use client";

import { useEffect, useRef } from "react";
import { FINE_POINTER_QUERY } from "@/components/pointer-interactions";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const fine = matchMedia(FINE_POINTER_QUERY);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const print = matchMedia("print");
    let frame = 0;
    let x = 0;
    let y = 0;
    const hide = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      delete layer.dataset.active;
    };
    const disable = () => {
      hide();
      layer.dataset.suppressed = "";
    };
    const move = (event: PointerEvent) => {
      if (
        !fine.matches ||
        reduced.matches ||
        print.matches ||
        event.pointerType === "touch" ||
        document.hidden ||
        !document.hasFocus()
      ) {
        disable();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          layer.style.setProperty("--glow-x", `${x}px`);
          layer.style.setProperty("--glow-y", `${y}px`);
          delete layer.dataset.suppressed;
          layer.dataset.active = "";
        });
      }
    };
    const touch = (event: PointerEvent) => {
      if (event.pointerType === "touch") disable();
    };
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) hide();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", touch, { passive: true });
    document.addEventListener("pointerout", leave);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("resize", disable);
    window.addEventListener("pagehide", disable);
    for (const media of [fine, reduced, print])
      media.addEventListener("change", disable);
    return () => {
      disable();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", touch);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("resize", disable);
      window.removeEventListener("pagehide", disable);
      for (const media of [fine, reduced, print])
        media.removeEventListener("change", disable);
    };
  }, []);
  return (
    <div
      ref={ref}
      className="cursor-glow"
      aria-hidden="true"
      data-suppressed=""
    />
  );
}
