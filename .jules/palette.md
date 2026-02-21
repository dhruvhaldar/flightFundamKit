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
