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

## 2026-06-05 - Required Field Indicators
**Learning:** Relying solely on validation errors to indicate required fields causes friction, as users don't know what's mandatory until they make a mistake. Adding explicit visual indicators (like red asterisks) to labels before interaction significantly improves form usability.
**Action:** For form usability and accessibility, explicitly mark mandatory fields with a visual indicator (e.g., a '*' styled with semantic tokens like 'text-destructive') on the label and provide contextual helper text in the form header, rather than relying solely on post-interaction validation errors.

## 2026-06-05 - Number Input Auto-select on Focus
**Learning:** Default values in number inputs (like '0' or '150') create friction because users must manually delete them before typing a new value, leading to input errors like '1500' when they meant '500'.
**Action:** Always add an `onFocus` handler to `type="number"` inputs that calls `e.target.select()` to automatically highlight the existing value, allowing the user to immediately overwrite it.

## 2024-06-05 - Explicit Mandatory Indicators vs Graceful Empty States
**Learning:** Even when an interactive component provides a robust, descriptive "empty state" fallback (e.g., "Enter a valid altitude to see results"), users can still be confused if they don't explicitly know *which* fields are required to exit that state, especially if they cleared an input and received no inline validation error.
**Action:** Always explicitly mark mandatory fields with visual indicators (e.g., asterisks in labels) and provide inline validation errors (e.g., "Required"), even if the component gracefully handles the empty state globally. This bridges the gap between field-level interaction and component-level status.
## 2023-11-20 - Dynamic Capacity Presets
**Learning:** Pairing a numeric capacity input with percentage-based preset buttons (e.g., 25%, 50%, 75%, 100% of MTOW) provides a significant UX improvement by reducing mental math and serving as accessible touch targets, particularly when the maximum capacity is dynamic.
**Action:** Always include relative percentage presets when an input represents a fraction of a larger, dynamically calculated total (like fuel capacity based on aircraft mass), ensuring the button group has a clear `role="group"` and accurate `aria-label`.

## 2026-06-05 - Number Input Scroll Trap
**Learning:** Native `type="number"` inputs will change their value if the user scrolls their mouse wheel while the input is focused. In forms with many technical numeric inputs (like aircraft parameters), users frequently accidentally alter data when trying to scroll down the page, leading to severe UX frustration and inaccurate calculations.
**Action:** Always add an `onWheel` event handler to `type="number"` inputs that calls `e.currentTarget.blur()`. This immediately removes focus upon scroll, preventing the value from changing and allowing the page to scroll naturally.

## 2026-06-05 - Semantic Description Lists and Copy Buttons for Calculator Results
**Learning:** Using generic `div` and `span` tags for key-value result pairs in technical calculators creates a flattened, non-semantic reading experience for screen reader users, making it harder to associate labels with their values. Furthermore, users frequently need to extract single data points for external use, which is cumbersome without explicit actions.
**Action:** Always use semantic HTML description lists (`<dl>`, `<dt>`, `<dd>`) for calculator results to ensure screen readers explicitly announce the relationship between a parameter name and its calculated value. Provide explicit, accessible "Copy to clipboard" buttons adjacent to key calculated results to reduce interaction friction and improve the mobile experience.

## 2026-06-05 - Scoped Keyboard Interactions
**Learning:** Adding specialized interaction behaviors (like blurring an input on "Enter" to dismiss mobile keyboards) to globally shared UI components (like a base `<Input>`) causes severe global regressions, breaking standard form submission and accessibility patterns.
**Action:** Do not add specialized interaction behaviors to globally shared UI components. Apply these behaviors only to specific component instances (like the technical calculators) where the context justifies it.

## 2026-06-05 - Avoid Redundant Prop Wiring
**Learning:** When building reusable UI components that extend standard HTML attributes (e.g., `React.InputHTMLAttributes<HTMLInputElement>`), explicitly destructuring and manually passing standard event handlers (like `onKeyDown`) is redundant and can break event bubbling if not implemented perfectly.
**Action:** Rely on spreading `...props` to the underlying native element to handle standard event attributes automatically, preventing redundant or broken event wiring.

## 2026-06-05 - Skip to Content Links
**Learning:** React/Next.js applications often forget to include a "skip to main content" link, forcing keyboard users and screen readers to traverse the entire navigation structure on every page load.
**Action:** For keyboard and screen reader accessibility, implement a 'Skip to main content' link at the top of the root layout using Tailwind classes (`sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground`) that targets the ID of the primary `<main>` content wrapper.

## 2024-06-06 - Semantic Grouping of Form Inputs
**Learning:** When presenting many related technical inputs (like aircraft geometry and aerodynamics), a flat list or grid increases cognitive load and lacks semantic context for screen readers. Users must parse the entire form to understand the relationships.
**Action:** Group related inputs into logical chunks using `<fieldset>` and `<legend>`. This visually breaks up the form, reduces cognitive load, and provides semantic context (the legend) that screen readers announce when users navigate into the group.

## 2026-06-05 - Numeric Equivalence for Preset Active States
**Learning:** Relying on strict string equality (e.g., `inputValue === presetValue`) to determine the active state of preset buttons fails when users manually enter mathematically equivalent but syntactically different numbers (e.g., typing '1000.0', '01000', or '1e3' instead of '1000'). This creates a minor UX disconnect where a preset button incorrectly loses its active appearance despite the underlying value perfectly matching its intent.
**Action:** Always use numeric parsing (e.g., `parseFloat()`) rather than string comparison to determine the active (`aria-pressed`) and visual state of preset buttons mapped to numeric input fields.

## 2026-06-05 - Immediate Announcement of Dynamic Validation Errors
**Learning:** Even when validation errors are visibly rendered in a form (e.g., text turning red), screen readers will not announce these dynamic insertions to the user unless the text is specifically marked up or receives focus, leaving visually impaired users unaware of the failure state.
**Action:** To ensure dynamic form validation errors are immediately announced by screen readers without requiring focus changes, apply `role="alert"` to the error message elements (e.g., `<p role="alert">Required</p>`).

## 2026-06-05 - Safe Numeric Presets
**Learning:** Providing a UI preset button that mathematically guarantees an error state (e.g., setting fuel load to 100% of Max Takeoff Weight, which triggers a divide-by-zero validation in Breguet range calculations) creates a "UX Trap". Users assume UI-provided shortcuts are valid system states.
**Action:** When designing capacity preset buttons for technical calculators, ensure the bounds reflect realistic or safe mathematical limits (e.g., 10-40% fuel fractions) rather than absolute physical maximums that would violate validation rules.

## 2026-06-05 - Tab Deep Linking
**Learning:** In single-page applications with multiple discrete tools grouped in a Tabs interface, the lack of URL syncing breaks native browser navigation (Back/Forward) and prevents users from bookmarking or sharing links to specific tools.
**Action:** Always sync the active state of primary navigation Tabs to the URL hash (e.g., `#range`) and listen for `hashchange` events to ensure the UI remains in sync with browser history and direct links.

## 2026-06-05 - Semantic Callouts for Data Insights
**Learning:** Appending crucial data insights or summaries as plain text paragraphs at the bottom of complex visualizations (like charts) reduces their discoverability. Visually, they blend into secondary text. For screen readers, they lack structural importance, forcing users to parse them as generic content rather than key takeaways.
**Action:** When providing summaries or "Insights" derived from complex data visualizations, wrap the text in distinct visual callouts (e.g., bordered boxes with icons) to establish visual hierarchy. More importantly, always apply `role="note"` with an appropriate `aria-label` to the wrapper so screen readers explicitly announce the content as a distinct, important aside or summary related to the data.
