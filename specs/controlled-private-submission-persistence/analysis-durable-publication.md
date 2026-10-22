# Durable publication design review

2026-10-18. User now permits fully designing additional persistence; do not classify a proposed field as a blocker by itself.

SPECIFY PASS (extended durable-identity requirements captured). PLAN FAIL; TASKS not generated because complete safe plan unavailable; full ANALYZE not executed without viable tasks. Requested binary output: TASKS FAIL/ANALYZE FAIL denote uncompleted gates, not fabricated execution.

M01 BLOCKER: current Upload/local-provider abstraction lacks immutable idempotent put/reconcile for file-written-before-Media and concurrent attempts. Durable ledger fixes lookup/receipt gaps only if such storage primitive exists; it does not supply atomic file publication. Evidence: local provider direct writeFile/createWriteStream; Upload random suffix and provider-first/Media-second ordering.0HIGH,0MEDIUM; this consolidated finding includes corresponding image/partial-recovery acceptance failures.

A unique public string by itself is not selected: D&P clones physical entries, potential unique-index collision; use proposed internal non-draft unique-source ledger and canonical target mapping. Schema gate is human authorization only. Local actual DB uniqueness/DDL not inspected. Candidate DB source creation and draft/finalization transactions specified; no claim of full end-to-end ensure command viability until storage gap closed.

Rollout/backfill/legacy/rollback procedure completed independently in rollout-backfill-design.md. Revision/CAS and controlled private persistence remain ratified design-PASS. No017 work. No product/schema/DB/SQLite/storage/upload/hash/migration/transaction/dependency/Git/deploy operations.

Next bounded decision: permit a publication-only project storage adapter that supplies atomic immutable put/reconcile for the installed local provider, together with proposed internal ledger design, or select an already-supported provider with documented equivalent capability. This is a concrete architecture scope decision, not another request merely to design a field. Do not approve whole prerequisite implementation while M01 unresolved.
