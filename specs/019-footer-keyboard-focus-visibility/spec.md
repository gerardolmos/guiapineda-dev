# Feature Specification: Footer Keyboard Focus Visibility

Feature019 | Created2026-10-20 | Branch main | Status: recovery IMPLEMENT/QA/CONVERGE authorized; no commit/push.
Input: restore visible keyboard focus in the footer without changing shared components or other page regions.

## User Scenarios & Testing
### US1 — Locate keyboard focus (P1)
Visitors navigating the footer can always identify the focused link.
Independent test: actual Tab and Shift+Tab through every footer link in CA/ES/EN at1280×900 and390×900, with language selector shown and hidden.
Acceptance: (1) every focused logo/navigation/email/language link has a visible solid outline; (2) reverse traversal preserves order and visible focus; (3) outline remains complete, not clipped, including the language-selector container and viewport after scrolling into view.
### US2 — Preserve existing appearance and navigation (P2)
Visitors retain existing navigation and appearance outside keyboard focus.
Independent test: baseline/final screenshots, computed styles and destinations for footer and header together.
Acceptance: (1) unfocused footer appearance/geometry unchanged; (2) header/shared-component instances outside footer unchanged even while focused; (3) destinations, labels, language selection, link count and order unchanged.
### Edge Cases
11 focusable anchors with selector,9 without; selected language is a non-link and must not become focusable. Mobile is viewport plus keyboard, not certification of a physical device. Focus scroll must bring the indicator into view; check container clipping independently. Mouse/hover and absence of focus must not gain an unsolicited outline. Normal browser keyboard heuristics determine focus-visible.

## Requirements
### Functional Requirements
- FR-001: All focus-visible footer anchors show a solid visible indicator, including child-component links.
- FR-002: Tab/Shift+Tab order, hrefs, labels, count and existing language semantics remain unchanged.
- FR-003: Preserve existing intended colors,2px thickness and offsets (4px brand/navigation/email;-2px inset for language links under the authorized QA recovery) if contrast against actual adjacent backgrounds is at least3:1; if inadequate, STOP for scope decision rather than silently redesign.
- FR-004: Indicator must not be clipped by containers or obscured after the focused item is scrolled into view.
- FR-005: Same behavior in CA/ES/EN, desktop/mobile viewport, selector visible/hidden.
- FR-006: No change to unfocused appearance, menu structure, header or focus elsewhere; shared component files remain unchanged.
- FR-007: Frontend footer-only product change; no backend/data/persistence/017 dependencies, new dependencies or real services. Recovery implementation/QA explicitly authorized; no commit/push.

## Success Criteria
- SC-001: All120 forward footer focus visits and108 reverse visits across12 configurations display the indicator, with actual keyboard traversal.
- SC-002: Every focused category meets thickness/offset/contrast and visual no-clipping checks; a CSS class alone is not proof.
- SC-003: Zero unintended differences in unfocused footer or outside-footer controls; destinations/order identical.
- SC-004: Only approved product file changes; no protected SDD/backend/Constitution changes.

## Assumptions and boundaries
Original accessibility defect CONFIRMED HIGH; unresolved until implementation and QA pass. It is not an open design finding. Contrast3:1 is this feature's measurable acceptance threshold, not a claim of whole-product WCAG conformance. Do not repair other existing focus problems outside footer. No feature017 reopening; context's “001–018 completed” excludes blocked017. No new navigation items, data entities or public contracts.
