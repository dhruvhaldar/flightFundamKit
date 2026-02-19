## 2024-05-24 - Controlled Number Inputs in React
**Learning:** Controlled number inputs (`type="number"`) in React can be frustrating because intermediate states (like "0." or empty strings) are often coerced to valid numbers (like 0) immediately, causing cursor jumps or data loss.
**Action:** When precise decimal input is required, store the input value as a string in local state and parse it to a number only for the parent/logic layer. Use a robust sync mechanism that respects user intent (e.g., preserving "0.") when syncing back from parent props.

## 2024-05-24 - Technical Calculator UX
**Learning:** For technical inputs like "Cruise Altitude" or "Fuel Mass", users appreciate presets (e.g., "Sea Level", "Cruise") and clear validation boundaries (e.g., "Max Fuel < Total Mass") rather than raw number fields. An empty state describing the output adds clarity before calculation.
**Action:** Always include presets for common technical values and validate constraints relative to other parameters (e.g., fuel vs. mass) with clear error messages.
