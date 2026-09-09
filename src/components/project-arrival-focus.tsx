"use client";

import { useEffect } from "react";

export function ProjectArrivalFocus() {
  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;

    // Native links restore history themselves. Enhance only a fresh arrival,
    // without overriding an anchor, restored position, or early user input.
    if (
      navigation?.type !== "navigate" ||
      window.location.hash ||
      window.scrollY !== 0 ||
      document.activeElement !== document.body
    ) {
      return;
    }

    document.getElementById("project-heading")?.focus({ preventScroll: true });
  }, []);

  return null;
}
