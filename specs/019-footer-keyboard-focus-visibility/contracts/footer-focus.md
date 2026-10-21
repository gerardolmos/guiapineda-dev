# Footer focus contract

| Group | Count | Intended color | Width / offset |
|---|---|---|---|
| Brand link |1|orange-400|2px /4px|
| Tauler,Guide,About,Comunicats,Millorem,Agenda,Veus |7|amber-400|2px /4px|
| mailto contact |1|amber-400|2px /4px|
| Other languages, when enabled |2|amber-400|2px /-2px inset (authorized recovery)|

All must compute outline-style solid during actual keyboard focus-visible and show a complete visible perimeter; measure contrast≥3:1 against actual neighboring background(s). Preserve current-language span/aria semantics. Unfocused and outside-footer states equal baseline; don't force an outline for mouse-only focus. No href activation to mail or remote services during tests.

Matrix:3languages ×2viewports (1280×900,390×900) ×2selector modes =12. Forward counts120, reverse108 when traversing back from last to first. Explicitly inspect first and last links, selector wrapper corners, logo and email. Fixture includes real header on same page and real components to catch style leakage. Test header focused/unfocused and footer unfocused with unchanged labels/geometry/hrefs. Observe scroll-induced visibility and clipping boundaries; absence of overflow:hidden alone is insufficient.
