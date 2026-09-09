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
    const desktop = matchMedia("(min-width: 1024px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const printing = matchMedia("print");
    let pending: Movement | null = null;
    let frame = 0;
    let available = true;
    let disposed = false;
    let interacted = false;
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const destination = (section: Section) =>
      Math.min(
        maxScroll(),
        Math.max(
          0,
          section.element.getBoundingClientRect().top +
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
      if (location.hash !== section.link.hash)
        history.pushState(history.state, "", section.link.hash);
      const target = destination(section);
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
      schedule();
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
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("popstate", historyChange);
    window.addEventListener("hashchange", historyChange);
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
    void document.fonts.ready.then(() => {
      if (
        disposed ||
        !available ||
        interacted ||
        navigation?.type !== "navigate"
      )
        return;
      const section = sections.find((item) => item.link.hash === location.hash);
      if (section)
        window.scrollTo({ top: destination(section), behavior: "instant" });
      schedule();
    });
    return () => {
      disposed = true;
      hide();
      observer.disconnect();
      identity.removeAttribute("data-sticky");
      nav.removeEventListener("click", click);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("popstate", historyChange);
      window.removeEventListener("hashchange", historyChange);
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
