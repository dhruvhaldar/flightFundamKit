## 2024-05-24 - Controlled Number Inputs in React
**Learning:** Controlled number inputs (`type="number"`) in React can be frustrating because intermediate states (like "0." or empty strings) are often coerced to valid numbers (like 0) immediately, causing cursor jumps or data loss.
**Action:** When precise decimal input is required, store the input value as a string in local state and parse it to a number only for the parent/logic layer. Use a robust sync mechanism that respects user intent (e.g., preserving "0.") when syncing back from parent props.

## 2024-05-24 - Technical Calculator UX
**Learning:** For technical inputs like "Cruise Altitude" or "Fuel Mass", users appreciate presets (e.g., "Sea Level", "Cruise") and clear validation boundaries (e.g., "Max Fuel < Total Mass") rather than raw number fields. An empty state describing the output adds clarity before calculation.
**Action:** Always include presets for common technical values and validate constraints relative to other parameters (e.g., fuel vs. mass) with clear error messages.

## 2024-05-24 - Shadcn UI Button Visibility
**Learning:** Shadcn UI components (like Button) rely heavily on CSS variables (`--primary`, `--primary-foreground`) for their `default` variant. If these are missing (e.g., in a minimal Tailwind v4 setup), the buttons become invisible (no background) but still take up space, leading to a confusing UX where "active" states look broken.
**Action:** When using Shadcn UI components, always verify that the base CSS variables are defined in the global stylesheet, especially when migrating to or using Tailwind v4's `@theme` syntax. Ensure active states have clear visual distinction (e.g., filled background vs outline).

## 2025-05-24 - Inline Validation for Technical Parameters
**Learning:** For complex technical parameters (like aerodynamics), users benefit immensely from immediate inline validation (e.g., "Mass > 0") that blocks invalid state from propagating to charts/calculations, rather than waiting for a "Calculate" button or seeing broken graphs.
**Action:** Implement derived validation logic that checks local input state before debouncing updates to the parent. Pair this with a "Reset to Defaults" action to give users a safe way to recover from invalid configurations.

## 2025-05-27 - Chart Accessibility
**Learning:** Complex charts (Recharts) are inherently inaccessible to screen readers; adding dynamic, data-driven text summaries provides immediate value to all users, not just screen reader users.
**Action:** Always extract key insights (min/max/trends) from chart data and display them as plain text summaries below the visual chart.

## 2025-05-27 - Calculator Interaction Patterns
**Learning:** Users instinctively press 'Enter' to trigger calculations in input fields, even outside of formal <form> elements.
**Action:** Always add an `onKeyDown` handler to inputs in interactive tools to trigger the primary action (e.g., calculation) on 'Enter' key press.

## 2025-05-28 - Reactive vs. Manual Calculation
**Learning:** For lightweight calculations (like range estimation), reactive updates (calculating as you type) are superior to "Calculate" buttons or Enter key handlers, as they provide immediate feedback and reduce friction.
**Action:** When calculation cost is negligible, prefer reactive state (e.g., `useMemo`) over manual triggers.

## 2026-02-28 - Dark Mode Color Variables
**Learning:** When using shadcn/ui and Tailwind with native CSS variables for dark mode, missing component-specific variables (like `--card`, `--muted`) in the `@media (prefers-color-scheme: dark)` block will result in unreadable contrast (e.g. dark text on dark backgrounds inside cards).
**Action:** Always ensure the full suite of semantic color variables is defined for both light and dark themes to maintain proper contrast and component visibility.

## 2024-05-18 - Screen Reader Notifications for Cleared Empty States
**Learning:** In real-time calculators, when a user enters an invalid value that causes the results to disappear and an "empty state" to show, screen reader users might not know the results have vanished.
**Action:** Use `role="status"` and `aria-live="polite"` on the empty state containers themselves. This ensures screen readers announce the fallback message (e.g., "Please enter a valid altitude") immediately when the user clears or invalidates the input.

## 2025-05-31 - Accessibility for Form Errors and Reset Actions
**Learning:** `aria-errormessage` has inconsistent support across screen readers. `aria-describedby` is significantly more reliable for associating error messages with input fields. Furthermore, destructive or reset actions (like "Reset Defaults") benefit greatly from visual confirmation (e.g., a "Restored" state with a checkmark) paired with a temporary `aria-live` announcement, rather than happening silently.
**Action:** Always use `aria-describedby` for form validation errors instead of `aria-errormessage`. For global reset or save actions, implement a 2-second visual confirmation state and an invisible `aria-live="polite"` region to announce the success to screen readers.

## 2024-03-03 - Preserving Context in aria-describedby
**Learning:** When an input has both helper text and error text, replacing the helper text's `id` in `aria-describedby` with the error text's `id` removes critical context for screen reader users (e.g., losing the "Max available: 1100 kg" context when a "Must be less than aircraft mass" error appears).
**Action:** Always concatenate IDs (e.g., `aria-describedby="error-id helper-id"`) when a field has multiple descriptive elements, ensuring users hear both the error and the instructions on how to fix it.

## 2026-03-05 - Semantic Grouping of Preset Buttons
**Learning:** Groups of related quick-action buttons (like 'Presets') read as disconnected individual items to screen readers unless semantically wrapped. Without context, users don't realize these buttons affect a single input field.
**Action:** Always wrap groups of related preset buttons in a container with `role="group"` and an `aria-label` (e.g., 'Altitude presets') to establish their relationship, and provide individual `aria-label`s for clarity.

## 2024-03-05 - Reactive Form State Desync
**Learning:** When local input state allows empty values but silences parent updates without visual errors, it causes a severe UX disconnect where charts use stale data.
**Action:** Always provide explicit error states ("Required") when a required reactive input is cleared, rather than silently ignoring the update.

## 2025-06-05 - Visual Capacity Indicators
**Learning:** Replacing plain text helpers (like "Max available: 1100 kg") with visual progress bars significantly improves the user's immediate understanding of technical boundaries (e.g. Fuel Load vs Max Takeoff Weight).
**Action:** For technical inputs bounded by a physical limit, use an inline progress bar. Ensure accessibility by always including `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Apply dynamic semantic classes (like `bg-destructive`) for out-of-bounds or error states.

## 2026-06-05 - Recharts Dark Mode Compatibility
**Learning:** Recharts components default to light-theme specific colors (like `#ccc` for grids and `#fff` for tooltips). In a CSS-variable driven dark mode (like Tailwind with shadcn), these charts become visually jarring or unreadable when the theme switches.
**Action:** To ensure Recharts components correctly support dark mode themes, explicit color overrides must be implemented by mapping SVG properties (like `stroke`, `fill`) and Tooltip styles (`contentStyle`, `itemStyle`) to semantic CSS variables (e.g., `var(--foreground)`, `var(--card)`, `var(--border)`).

## 2025-06-05 - Empty State Recovery CTAs
**Learning:** Empty states in technical calculators (e.g., when inputs are cleared or invalid) can feel like "dead ends". While descriptive fallback text helps, users often prefer a one-click way to return to a working state to continue exploring.
**Action:** When an interactive component falls back to a status/empty state due to missing or invalid input, always provide a clear, one-click recovery CTA (like "Load Example Values" or "Use Sea Level") that resets the inputs to valid defaults.

## 2025-06-05 - Contextual Disabled States
**Learning:** Users often click "Reset to Defaults" buttons when they are already at default values. Disabling the button when its action is a no-op reduces confusion.
**Action:** Disable reset buttons when values match the defaults, and provide a tooltip (e.g., "Already at default values") explaining why the button is disabled.
