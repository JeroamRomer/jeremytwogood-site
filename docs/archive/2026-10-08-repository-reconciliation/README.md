# Repository reconciliation — 2026-10-08

Jeremy approved the existing live site and requested all deployed work be committed, merged, pushed and worktrees consolidated.

Production before reconciliation: `dpl_BtY3dVLcY62jdvx5eVD7kqKPAhCj`, built from83995bb plus uncommitted Story Builder files. Remote main was73f62d2, five commits behind that baseline. Those commits include MCP discovery/clickability, Shell tank wording and social cutdowns/trailer.

The final Story Builder board, all capture/provenance assets and the previously approved Mathew Welsh chatbot context are now committed. The chatbot context had been deployed on October6 but excluded by later snapshots; it is restored without changing visible copy.

The unused social-card draft is preserved here as an image and patch; production continues using og-image.jpg. Its smoke test now checks that actual production asset. The social-edits branch's sole unique commit, cefcedf, is preserved as a patch and in Git merge history. It contains older resume additions and a preliminary backlog superseded by the shipped social-cutdowns work; it is retired without changing approved production data.

The old discoverability worktree's only tracked modification was a generated timestamp, preserved as a patch. Its untracked node_modules was a symlink to the main checkout. The other untracked node_modules was also only a symlink. Local tool settings from the detached Claude worktree are backed up under ignored design-sources/worktree-backups before worktree removal; no credentials are committed.

refs-before-cleanup.txt and worktrees-before-cleanup.txt record all original pointers. Branch ancestors remain reachable from main; the unique social-edits commit is included by a retirement merge that keeps the approved site. Release policy: validate, commit, integrate/push main, deploy that exact clean commit, verify production. Do not deploy dirty snapshots again.
