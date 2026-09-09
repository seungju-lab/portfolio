"use client";

import { useEffect } from "react";

export const FINE_POINTER_QUERY =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export function PointerInteractions() {
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".portfolio-shell");
    if (!shell) return;
    const media = matchMedia(FINE_POINTER_QUERY);
    const clear = () => delete shell.dataset.pointerInput;
    const update = (event: PointerEvent) => {
      if (media.matches && event.pointerType !== "touch") {
        shell.dataset.pointerInput = "fine";
      } else {
        clear();
      }
    };
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) clear();
    };
    document.addEventListener("pointerover", update);
    document.addEventListener("pointermove", update, { passive: true });
    document.addEventListener("pointerdown", update, { passive: true });
    document.addEventListener("pointerout", leave);
    document.addEventListener("visibilitychange", clear);
    window.addEventListener("blur", clear);
    window.addEventListener("pagehide", clear);
    media.addEventListener("change", clear);
    return () => {
      clear();
      document.removeEventListener("pointerover", update);
      document.removeEventListener("pointermove", update);
      document.removeEventListener("pointerdown", update);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("visibilitychange", clear);
      window.removeEventListener("blur", clear);
      window.removeEventListener("pagehide", clear);
      media.removeEventListener("change", clear);
    };
  }, []);
  return null;
}
