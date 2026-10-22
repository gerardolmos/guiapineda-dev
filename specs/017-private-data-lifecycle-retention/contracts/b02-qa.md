# B02 required isolated QA contract

Pure synthetic state/store doubles, no backend bootstrap/import with side effects, DB, SQLite or real media. Model both actual installed ID-only update and candidate CAS, not an unrealistically atomic mock. All cases remain future integration acceptance; only S1–S3 abstract schedules were executed.

| Case | Interleaving / expected result |
|---|---|
| 1 / A–C | pending snapshot, rejection, stale write: conflict or sanitized no-resurrection |
| 2 | in-review snapshot, rejection, stale write: same |
| 3 | stale payload after approval: email stays null; Commerce editorial/name/phone retained |
| 4 / D–F | Admin opens before rejection and saves unrelated edit: stale private fields cannot persist; refresh on conflict, no automatic resubmit |
| 5 / L | partial editorial update without PII: succeeds safely if supported; no full-snapshot rollback restoring PII |
| 6 / M | partial stale private field update: conflict or forced null based on effective state |
| 7 / K | different terminal→terminal denied; no rejected-name/phone restoration |
| 8 | generic reopen attempt denied; no deleted PII recreated |
| 9 / G–H | double reject: explicit idempotency or conflict, nulls remain |
| 10 | double approve: same; editorial materials preserved |
| 11 / I | retry uses effective state; no replay of stale snapshot |
| 12 | sanitizer throws: no write or success, fixed safe error |
| 13 | every section × both terminal states: email always null after committed transition |
| 14 | Commerce rejected name remains null across every covered writer |
| 15 | Commerce rejected private phone remains null; public telefono unchanged |
| 16 | Commerce approved applicant name/phone, business fields, relations and refs preserved |
| 17 | strict public create unchanged for CA/ES/EN, missing required inputs rejected |
| 18 / J | relation failure and framework compensation after interleaving: never restore private snapshot; must exercise actual routing design |
| 19 | bulk mixed-state writes/create/clone: no bypass; unsupported operations fail closed |
| 20 | zero-match CAS, storage failure and unknown response: no false success or blind retry |

Test all applicable cases across six UIDs, Query Engine/Document Service/Admin paths, not just the custom panel. State plus scalar cleanup must be indivisible; no intermediate terminal-with-PII accepted. A failing schedule is evidence to retain B02, not permission to use real DB.
