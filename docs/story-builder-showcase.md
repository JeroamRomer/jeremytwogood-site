# Story Builder portfolio showcase

Copy and layout approved by Jeremy on 2026-10-06. Screenshot capture authorized on 2026-10-08, using his two cat photos from Downloads. The card appears on the homepage and `/ai-builds`, with In development status and no public launch link.

## Captured assets

- `public/assets/story-builder-icon.png`: exported from the existing packaged app's `AppIcon.icns`.
- `public/assets/story-builder-script.png`: actual Story Builder Script view, with the approved generated shipwreck still in the viewer, fictional transcript, and paper edit.
- `public/assets/story-builder-board.png`: actual Story Builder Board view, with the approved generated adrift still in the viewer and fictional story beats.
- `public/assets/story-builder-strip.png`: actual Strip view, with the approved generated moonlit still, all 16 beat blocks, and the selected beat's picture and narration cards.
- `public/assets/story-builder-splash.png`: still of the actual animated filmstrip splash.
- `public/assets/story-builder-splash.mp4`: 3.6-second screen recording of the actual splash animation, encoded to H.264 for playback.
- `public/assets/story-builder-tutorial-01.png` through `story-builder-tutorial-08.png`: all eight steps of the actual Welcome Tour, over the fictional Captain Puddles project.

The tutorial is available from Help → Welcome Tour and also appears on first launch. The captures exercise its real Next controls through all eight steps. The normal app's welcome state was not changed; only the demo's isolated registry remembers the tour.

Demo: **Captain Puddles: Nine Lives at Sea**. A shipwrecked cat fights to survive alone, beyond anyone's reach. All narration, speakers, clip names, and story beats are fictional.

The source photos are `IMG_3746.HEIC` and `P1030175.JPG` in Jeremy's Downloads folder. Temporary PNG conversions were encoded as silent, two-minute H.264 still-image clips, then loaded into Story Builder's real viewer. The screenshots are browser captures of the real app, not composited or AI-generated UI. The demo's seeded narration is invented portfolio content, not a transcription of the silent clips.

## Isolation and reproduction

The completed demo project is saved at `/Users/romer/Documents/Claude/Story Builder/projects/PUDDLES/`, with its own `.showcase-home` registry. Double-click `Open Captain Puddles.command` there to reopen it without changing the normal app's current project. The original temporary capture workspace remains under `/private/tmp/captain-puddles-showcase/`.

Jeremy requested a more fully populated project on 2026-10-08. The final captures use 32 invented narration lines, a full 16-beat plan with 32 wants, a chosen logline and synopsis, three groups of saved selects, and three edit approaches. The preferred A cut has three saved versions; B and C have one each. The first version used only the two supplied cat photos; the latest revision uses the four approved generated story stills described below.

Actual app commands generated shot-list, pitch, question-list, paper-edit, comparison, Final Cut XML, Resolve XML, and marker EDL exports in the demo. All five edit versions passed reference checks without errors. The latest three rendered successfully with 36 editorial warnings about pacing, beat budgets, and option overlap; the single-narrator plan has a voice-balance advisory. Those findings are preserved. Timeline exports were not imported into an editing app.

The final screenshots are 1920×1200 browser captures with the viewer, populated transcript, saved-select controls, version picker, alternative options, and story cards visible. Every visible project name, narrator line, and editorial note is fictional.

The demo server imports existing app modules, creates and opens only the fictional project, and uses separate `SOUNDBITE_HOME` and `SOUNDBITE_DATA_ROOT` directories. No Story Builder source, normal registry, or existing project was edited. The capture script checks rendered text for real project names; exported screenshots were also inspected visually.

Jeremy selected the final overlay set: app icon, Board, Strip, Script, and only the first Welcome Tour picture. The four screenshots form a two-by-two grid alongside the icon in a two-column-width card. Splash captures and tutorial steps 2–8 are excluded from the overlay and retained only as review assets. Desktop hover reveals the preview; phone tap reveals a stacked arrangement. Images are contained so the full app UI remains visible. Without JavaScript, the card copy remains available. No production deployment is authorized by screenshot capture.

## Production release — 2026-10-08

Jeremy authorized deployment. Vercel deployment `dpl_EaNqhfAriGdU9DAGL4C6RHzrehVF` is READY and aliased to https://www.jeremytwogood.com. The isolated release snapshot at `/private/tmp/story-builder-release-20261008` uses the current production baseline `83995bb` plus the approved Story Builder components, data, and five images only. Unrelated local chatbot and social image drafts remain excluded. No Git commit, merge, or push was made.

Build, 86 core tests, 26 UI tests, and 54 API tests passed. The snapshot smoke assertion checks the existing production `og-image.jpg`; the working checkout test is unchanged. Live browser checks confirmed the exact five assets, hover/tap, containment, no horizontal overflow, reduced motion and no-JavaScript copy on both pages at desktop and phone sizes. Homepage, AI Builds, MCP and discovery returned 200; chat GET returned expected 405. Vercel repeated the existing two `api/chat.ts` TS2339 diagnostics while completing successfully.

## Fan layout and widescreen footage revision — 2026-10-08

Jeremy requested a larger icon and four overlapping, fanned app windows. The local revision uses a 132px desktop icon (86px phone) and rotated overlapping screenshots. Both pages retain hover/tap and no-JavaScript copy. This revision has not been deployed.

The original Downloads photos remain untouched. Reviewed 1920x1080 crops are saved in `docs/story-builder-crops/`. IMG_3746.HEIC: original 4032x3024, crop rectangle x0/y0/w4032/h2268, preserving the original top edge; one ear tip was already outside the original photo. P1030175.JPG: original 5472x3648, rectangle x0/y300/w5472/h3078, preserving ears, eyes, nose and chin. These crops were encoded into the two existing two-minute 1280x720 demo clips, with pre-revision media backed up under PUDDLES/.showcase-home/original-viewer-media. Real app Script, Board, Strip and first Welcome Tour screenshots were refreshed; all four reported 1280x720 viewer media. Capture script `/private/tmp/captain-puddles-showcase/capture-wide.mjs`. Two additional photos are pending from Jeremy.

Description revised at Jeremy's request to explain AI control: “Connect your preferred AI assistant through MCP and let it operate Story Builder for you.” Applied to shared site data and generated agent data locally; included with the pending fan-layout revision.

## Approved generated story footage — 2026-10-08

Jeremy approved all four generated images and requested their use. The originals and prompts are retained in `docs/captain-puddles-generated/` and copied into PUDDLES/media/generated-stills. Silent 1280x720/24fps source clips now show shipwreck then adrift in PUDDLES-01 (60 seconds each), moonlit survival then sunrise ashore in PUDDLES-02 (60 seconds each). Existing two-minute clip durations, IDs, narration and option references are preserved. Prior widescreen photo media is backed up in PUDDLES/.showcase-home/widescreen-photo-media. Source stills are AI-generated fiction based on the owner's cat photographs; no action footage or speech was recorded.

Refreshed Script (shipwreck), Board (adrift), Strip (night) and first Welcome Tour (shore) screenshots from the real app. Capture script `/private/tmp/captain-puddles-showcase/capture-generated.mjs`. The larger icon and fan arrangement remain, along with the revised MCP/AI-control description. This update is local and uncommitted; no further production deployment has occurred.

## Even fan and feature-board comparison — 2026-10-08

Jeremy requested an evenly spaced fan with a subtle downward stagger, revealing the right side rather than repeated transcript viewers, and a rounded board of feature crops with one shipwreck image. Local site fan now uses equal7-percent horizontal/4-percent downward steps and4-degree angle steps (-6,-2,2,6 degrees), front-to-back left-to-right so right edges are revealed. Phone uses equal6-percent horizontal/4-percent downward steps.

A separate interactive review at `docs/story-builder-layout-review/index.html` compares this fan with a board: existing icon, one approved generated shipwreck still, cropped actual Script/Board/Strip panels and Welcome Tour modal. Crops retain real UI, with rounded14px frames; they are an exploratory alternative, not the site's selected layout. Desktop/phone images saved alongside the review. Build and26UI tests passed, actual site both routes1440/390 hover/tap, containment, overflow, reduced motion/no-JS passed; both review variants also checked1440/390. No deploy.

Jeremy requested a still larger icon: fan now196px desktop/120px phone; feature-board preview160px desktop/112px phone. Board spacing increased to accommodate it. Both previews rechecked at1440/390 with all images contained and no overflow; build passed. Local only.

## Selected board with transcript — 2026-10-08

Jeremy selected the feature board and requested more padding for Script/Board, centered Script content, a narrower right-aligned Strip, Welcome immediately to its left aligned with Script, and a full transcript beneath a centered larger icon. Implemented on both website pages using six images: icon, full transcript, Script, Board, Welcome and Strip. Script/Board have18px internal padding (10px phone), Script image centered. Welcome left edge equals Script left edge; Strip right edge equals Board right edge. Icon196px desktop/120px phone is centered above Transcript.

New public/assets/story-builder-feature-*.png files contain real UI crops. Transcript captured from the fictional app with capture-only .source-media max-height removed and true16:9 aspect ratio, letting the generated shipwreck image fill the viewer705x396 with no pillar bars. App source unchanged; original full screenshots retained. Capture script `/private/tmp/captain-puddles-showcase/capture-transcript.mjs`. Review index now displays the selected board; selected-board-1440.png and selected-board-390.png saved alongside.

Build and26UI tests passed; both routes at1440/390 passed hover/tap, loaded contained images, no horizontal overflow, reduced-motion/no-JS copy. Browser geometry explicitly confirmed icon centering and Welcome/Strip alignment. Local only; no deploy or commit.

## Expanded Strip board — 2026-10-08

Removed Welcome from the selected overlay on both pages. Strip now spans the full lower area beneath Script and Board, with matching16px gaps above and beside Transcript. Strip fills its frame with a top-aligned crop emphasizing the beat timeline and selected-card header. Script/Board padding remains18px. Icon increased to208px desktop/132px phone and remains centered over Transcript. Welcome assets are retained for reference only. Standalone review and selected-board screenshots updated.

Build and26UI tests passed. Both routes passed1440/390 hover/tap, five loaded contained images, no horizontal overflow, reduced motion and no-JavaScript copy checks. Desktop geometry confirmed equal16px gaps, Strip left/right alignment and centered icon. Local only; no deployment, commit or merge.

## Board production release — 2026-10-08

Jeremy approved and requested deployment of the final feature board. Vercel deployment `dpl_BtY3dVLcY62jdvx5eVD7kqKPAhCj` is READY, aliased to https://www.jeremytwogood.com. Release snapshot `/private/tmp/story-builder-board-release-20261008` uses HEAD83995bb plus approved Story Builder components/data, icon and four feature crops. Includes the MCP/AI-control description and approved generated shipwreck image within Transcript. Welcome omitted. Unrelated chatbot and social metadata drafts excluded; exclusion and source parity checked against the prior release. No commit, merge or push.

Release build and166 tests passed:86 core,26UI,54API. The snapshot smoke test checks existing production og-image.jpg; working checkout test unchanged. Live both pages1440/390 passed hover/tap, exact five assets, MCP copy, contained images, no overflow, reduced motion and no-JavaScript copy. Cache-busted hashes matched all five local release image bytes. Homepage, AI Builds, MCP/discovery200; chat GET405. Live screenshots `/private/tmp/puddles-board-live-{1440,390}-{home,builds}.png`. Vercel repeated the two existing api/chat.ts TS2339 diagnostics while completing READY.
