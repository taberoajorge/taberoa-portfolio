---
name: verify-ui
description: Check the portfolio pages and figures before calling a UI change done — desktop and phone layouts, every figure step, reduced motion, no JavaScript, accessibility, SEO output and Lighthouse budgets.
---

# Verify the UI

Work against a production build: `pnpm build && pnpm start` (the URL is printed; the main checkout
uses 3302). Dev mode is slower and hides some hydration problems.

1. **Output did not drift.** `pnpm parity compare` checks the head, visible text and JSON-LD of `/`
   and `/es` against the saved baseline. If the change is meant to alter them, look at the diff,
   then `pnpm parity save`.
2. **Layouts.** Look at both pages at 1440 px and at 390 px: two columns on desktop (project and
   guide left, figure right), one column on phones, no horizontal scroll, labels inside the plate.
3. **Every figure.** Press Play and watch a full run: one camera move per step, the readout and the
   guide follow the step, the run ends with its final line. Pick each step in the stepper, use
   Next, Reset and the figure's own controls.
4. **Reduced motion.** With `prefers-reduced-motion: reduce` nothing autoplays, and Play or Next
   still animate smoothly.
5. **No JavaScript.** The text, the guide and each figure's poster are visible.
6. **Keyboard and screen readers.** Every control is reachable with Tab and has a visible focus;
   the step narration is announced through the polite live region.
7. **Budgets.** `pnpm perf` must report 100 for Performance, Accessibility, Best Practices and SEO
   on mobile and desktop for `/` and `/es`, and pass the HTML, JS, LCP, TBT and CLS budgets. The
   browser console must be clean.

Look at every screenshot you take before you describe it. Report what you checked and what you
could not check; never claim a visual result you did not see.
