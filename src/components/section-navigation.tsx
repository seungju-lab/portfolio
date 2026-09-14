"use client";

import { useEffect } from "react";

type Section = {
  element: HTMLElement;
  heading: HTMLElement;
  link: HTMLAnchorElement;
};
type Movement = {
  section: Section;
  target: number;
  started: number;
  lastY: number;
  stillFrames: number;
  arrivedFrames: number;
};

export function SectionNavigation() {
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".portfolio-shell");
    const identity = shell?.querySelector<HTMLElement>(".portfolio-identity");
    const nav = shell?.querySelector<HTMLElement>(".section-navigation");
    if (!shell || !identity || !nav) return;
    const sections: Section[] = [];
    for (const link of nav.querySelectorAll<HTMLAnchorElement>(
      'a[href^="#"]',
    )) {
      const element = document.getElementById(link.hash.slice(1));
      const heading = element?.querySelector<HTMLElement>("h2");
      if (element && heading) sections.push({ element, heading, link });
    }
    if (!sections.length) return;
    const isProject = shell.classList.contains("portfolio-shell-project");
    const legacyAnchors: Record<string, string> = isProject
      ? {
          "#scope": "#overview",
          "#implementation": "#challenges",
          "#verification": "#results",
        }
      : {};
    const hashSection = () => {
      const hash = legacyAnchors[location.hash] ?? location.hash;
      return sections.find((section) => section.link.hash === hash);
    };
    const normalizeHash = (section: Section) => {
      if (legacyAnchors[location.hash])
        history.replaceState(history.state, "", section.link.hash);
    };
    const desktop = matchMedia("(min-width: 1024px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const printing = matchMedia("print");
    let pending: Movement | null = null;
    let frame = 0;
    let available = true;
    let disposed = false;
    let interacted = false;
    let restoreFrame = 0;
    let restoring = false;
    let entry = isProject
      ? (history.state?.portfolioEntry ?? crypto.randomUUID())
      : "";
    const positions = new Map<string, { x: number; y: number }>();
    if (isProject) {
      history.replaceState({ ...history.state, portfolioEntry: entry }, "");
      positions.set(entry, { x: scrollX, y: scrollY });
    }
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const destination = (section: Section) =>
      Math.min(
        maxScroll(),
        Math.max(
          0,
          (isProject
            ? section.heading
            : section.element
          ).getBoundingClientRect().top +
            scrollY -
            (desktop.matches ? 96 : 80),
        ),
      );
    const setCurrent = (section: Section) => {
      for (const item of sections) {
        if (item === section) {
          if (!item.link.hasAttribute("aria-current"))
            item.link.setAttribute("aria-current", "location");
        } else item.link.removeAttribute("aria-current");
      }
    };
    const update = () => {
      identity.toggleAttribute(
        "data-sticky",
        desktop.matches && identity.offsetHeight + 192 <= innerHeight,
      );
      let current = sections[0];
      const end = maxScroll();
      if (end <= 1) {
        current =
          sections.find((section) => section.link.hash === location.hash) ??
          current;
      } else if (scrollY > 0 && scrollY >= end - 1) {
        current = sections[sections.length - 1];
      } else {
        const line = desktop.matches ? 128 : 80;
        for (const section of sections) {
          if (section.element.getBoundingClientRect().top <= line + 1)
            current = section;
        }
      }
      setCurrent(current);
    };
    const cancel = (stopScroll = true) => {
      cancelAnimationFrame(restoreFrame);
      restoreFrame = 0;
      restoring = false;
      const moving = pending;
      pending = null;
      if (moving && stopScroll)
        window.scrollTo({ top: scrollY, left: scrollX, behavior: "instant" });
    };
    const finish = (movement: Movement) => {
      if (pending !== movement || !available) return;
      pending = null;
      movement.section.heading.focus({ preventScroll: true });
      update();
    };
    const tick = () => {
      frame = 0;
      if (!available) return;
      update();
      if (pending) {
        const movement = pending;
        if (Math.abs(scrollY - movement.target) <= 1) {
          if (++movement.arrivedFrames >= 2) finish(movement);
        } else {
          movement.arrivedFrames = 0;
          movement.stillFrames =
            Math.abs(scrollY - movement.lastY) < 0.5
              ? movement.stillFrames + 1
              : 0;
          // A browser or scrollbar can stop a scroll without an input event.
          if (
            movement.stillFrames > 8 &&
            performance.now() - movement.started > 250
          )
            cancel(false);
        }
        movement.lastY = scrollY;
        if (pending) schedule();
      }
    };
    const schedule = () => {
      if (!frame && available) frame = requestAnimationFrame(tick);
    };
    const scroll = () => {
      if (isProject && available && !restoring)
        positions.set(entry, { x: scrollX, y: scrollY });
      schedule();
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element ? event.target.closest("a") : null;
      const section = sections.find((item) => item.link === link);
      if (!section) return;
      event.preventDefault();
      interacted = true;
      cancel();
      const target = destination(section);
      if (location.hash !== section.link.hash) {
        if (isProject) {
          positions.set(entry, { x: scrollX, y: scrollY });
          entry = crypto.randomUUID();
          positions.set(entry, { x: 0, y: target });
        }
        history.pushState(
          isProject
            ? { ...history.state, portfolioEntry: entry }
            : history.state,
          "",
          section.link.hash,
        );
      }
      pending = {
        section,
        target,
        started: performance.now(),
        lastY: scrollY,
        stillFrames: 0,
        arrivedFrames: 0,
      };
      window.scrollTo({
        top: target,
        behavior: reduced.matches ? "instant" : "smooth",
      });
      schedule();
    };
    const interrupt = () => {
      interacted = true;
      cancel();
      schedule();
    };
    const key = (event: KeyboardEvent) => {
      interacted = true;
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
          "Tab",
          "Escape",
        ].includes(event.key)
      )
        interrupt();
    };
    const historyChange = () => {
      interacted = true;
      cancel(false);
      const nextEntry = history.state?.portfolioEntry;
      const position =
        isProject && nextEntry !== entry ? positions.get(nextEntry) : undefined;
      if (position) {
        entry = nextEntry;
        restoring = true;
        // Restore the reading offset after native fragment scrolling. Entries
        // from another document continue to use the browser's restoration.
        restoreFrame = requestAnimationFrame(() => {
          restoreFrame = requestAnimationFrame(() => {
            restoreFrame = 0;
            if (disposed || !available) return;
            window.scrollTo({
              left: position.x,
              top: position.y,
              behavior: "instant",
            });
            restoring = false;
            update();
          });
        });
      }
      schedule();
    };
    const hashChange = () => {
      interacted = true;
      if (restoring) return;
      cancel(false);
      if (isProject) {
        entry = crypto.randomUUID();
        history.replaceState({ ...history.state, portfolioEntry: entry }, "");
      }
      // Old fragment entries are replaced, so they do not add a history step.
      // Ordinary back/forward navigation keeps native scroll restoration.
      const section = legacyAnchors[location.hash] ? hashSection() : undefined;
      if (section) {
        normalizeHash(section);
        window.scrollTo({ top: destination(section), behavior: "instant" });
        section.heading.focus({ preventScroll: true });
      }
      scroll();
    };
    const resize = () => {
      cancel();
      schedule();
    };
    const printChange = () => {
      if (printing.matches) interrupt();
      else schedule();
    };
    const motionChange = () => {
      if (reduced.matches && pending) {
        const movement = pending;
        movement.target = destination(movement.section);
        window.scrollTo({ top: movement.target, behavior: "instant" });
        finish(movement);
      }
      schedule();
    };
    const hide = () => {
      interacted = true;
      cancel();
      available = false;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const show = () => {
      available = true;
      schedule();
    };
    const visibility = () => {
      if (document.hidden) hide();
      else show();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(identity);
    const main = shell.querySelector("main");
    if (main) observer.observe(main);
    nav.addEventListener("click", click);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("popstate", historyChange);
    window.addEventListener("hashchange", hashChange);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("wheel", interrupt, { passive: true });
    document.addEventListener("touchstart", interrupt, { passive: true });
    document.addEventListener("pointerdown", interrupt, true);
    document.addEventListener("keydown", key);
    reduced.addEventListener("change", motionChange);
    printing.addEventListener("change", printChange);
    update();
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    // Initial fragment navigation can reset focus after hydration. Wait for
    // document loading and native fragment handling before focusing the title.
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          );
    void Promise.all([document.fonts.ready, loaded]).then(() => {
      requestAnimationFrame(() => {
        if (
          disposed ||
          !available ||
          interacted ||
          (navigation?.type !== "navigate" &&
            !(isProject && navigation?.type === "reload"))
        )
          return;
        const section = hashSection();
        if (section) {
          normalizeHash(section);
          window.scrollTo({ top: destination(section), behavior: "instant" });
          if (isProject) section.heading.focus({ preventScroll: true });
        }
        schedule();
      });
    });
    return () => {
      disposed = true;
      hide();
      observer.disconnect();
      identity.removeAttribute("data-sticky");
      nav.removeEventListener("click", click);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("popstate", historyChange);
      window.removeEventListener("hashchange", hashChange);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("wheel", interrupt);
      document.removeEventListener("touchstart", interrupt);
      document.removeEventListener("pointerdown", interrupt, true);
      document.removeEventListener("keydown", key);
      reduced.removeEventListener("change", motionChange);
      printing.removeEventListener("change", printChange);
    };
  }, []);
  return null;
}
