# Agent notes: jeremytwogood.com

`main` is the canonical production branch for the currently approved Open Sequence site. Historical Classic/facelift descriptions in older notes are snapshots, not current routing instructions.

Before changing anything, read `docs/open-sequence-handoff.md`. Repository reconciliation and preserved drafts are documented in `docs/archive/2026-10-08-repository-reconciliation/README.md`.

Quick commands: `npm run dev` (http://localhost:4321); `npm run build && npm test && npm run test:ui && npm run test:api` before every commit. Discard timestamp-only diffs in `public/agent-data.json` without discarding meaningful data changes.

Every production release must be committed, integrated into main and pushed before deploying the exact clean commit. Never deploy uncommitted snapshots. Verify desktop/mobile and live assets after deployment. Finish authorized work by integrating it and cleaning up its branches/worktrees; preserve unique drafts in a documented archive rather than leaving them stranded.

Never merge to main or deploy production without Jeremy's go-ahead. Jeremy explicitly authorized the October8 reconciliation, merge, push, deployment parity and worktree cleanup.
