"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/** "Bienvenue" arrives letter by letter, then the user's name settles in with
 * its gradient sheen already running — the one moment on the dashboard that's
 * allowed to be theatrical, since it only plays once per visit. */
export function KineticHero({ userName }: { userName?: string | null }) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!wordRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let split: SplitText | undefined;

    // gsap.context() scopes every tween/SplitText created inside it so
    // ctx.revert() can undo all of it in one call — without this, React 18
    // Strict Mode's dev-only double-invoke (mount → cleanup → mount) leaves a
    // stale timeline pointing at a reverted SplitText, and the second
    // element's tween never plays.
    const ctx = gsap.context(() => {
      split = new SplitText(wordRef.current, { type: "chars" });
      const tl = gsap.timeline();
      tl.from(split.chars, {
        opacity: 0,
        y: 28,
        rotateX: -50,
        stagger: 0.025,
        duration: 0.6,
        ease: "back.out(1.8)",
      });
      if (nameRef.current) {
        tl.from(
          nameRef.current,
          { opacity: 0, x: -12, filter: "blur(6px)", duration: 0.5, ease: "power2.out" },
          "-=0.25"
        );
      }
    });

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, []);

  return (
    <h1 className="font-heading text-4xl font-bold tracking-tight text-wrap-balance sm:text-5xl">
      {/* SplitText stamps its own aria-label on the split span, which inserts
          an extra accessible-name boundary (and thus a stray space) before
          the following ", {name}" text. Simplest robust fix: the animated
          markup is purely decorative, and a plain sr-only string carries the
          real accessible name — matches how any split/kinetic text should be
          exposed to assistive tech regardless of what the animation library
          does internally. */}
      <span aria-hidden="true">
        <span ref={wordRef} className="inline-block">
          Bienvenue
        </span>
        {userName && (
          <>
            {", "}
            <span
              ref={nameRef}
              className="text-sheen inline-block bg-[linear-gradient(100deg,var(--brand)_20%,var(--brand-2)_55%,var(--ember)_85%)] bg-clip-text text-transparent"
            >
              {userName}
            </span>
          </>
        )}{" "}
        👋
      </span>
      <span className="sr-only">
        Bienvenue{userName ? `, ${userName}` : ""} 👋
      </span>
    </h1>
  );
}
