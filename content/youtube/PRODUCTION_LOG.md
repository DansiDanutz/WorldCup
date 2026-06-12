# WorldCup26 Legends — Production Log (what's on GitHub, what's on YouTube)

> One row per episode. The **Download** links are the exact upload-ready masters
> stored in this repo (branch `claude/hopeful-cori-v24dsy`, folder
> `marketing/match-videos/<episode>/`). After uploading to YouTube, paste the
> YouTube URL into the last column so this file is the single source of truth.

Base raw link: `https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/<path>`

| Ep | Match | Master file (in repo) | Size | Thumbnail | Subtitles | YouTube URL |
|---|---|---|---|---|---|---|
| 1 | Mexico vs South Africa | _(produced before this pipeline — already live)_ | — | — | — | https://www.youtube.com/watch?v=myNgytIwZ0U |
| 2 | South Korea vs Czech Republic | [WorldCup26_Match02_KOR_CZE.mp4](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match02-south-korea-vs-czech-republic/WorldCup26_Match02_KOR_CZE.mp4) | 44 MB | [thumbnail.jpg](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match02-south-korea-vs-czech-republic/thumbnail.jpg) | — | _paste after upload_ |
| 3 | Canada vs Bosnia & Herzegovina | [WorldCup26_Match03_CAN_BIH_upload.mp4](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match03-canada-vs-bosnia/WorldCup26_Match03_CAN_BIH_upload.mp4) | 89 MB | [thumbnail.jpg](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match03-canada-vs-bosnia/thumbnail.jpg) | in repo | _paste after upload_ |
| 4 | USA vs Paraguay | [WorldCup26_Match04_USA_PAR_upload.mp4](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match04-usa-vs-paraguay/WorldCup26_Match04_USA_PAR_upload.mp4) | 78 MB | [thumbnail.jpg](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match04-usa-vs-paraguay/thumbnail.jpg) | in repo | _paste after upload_ |
| 5 | Brazil vs Morocco | [WorldCup26_Match05_BRA_MAR_upload.mp4](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match05-brazil-vs-morocco/WorldCup26_Match05_BRA_MAR_upload.mp4) | 84 MB | [thumbnail.jpg](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match05-brazil-vs-morocco/thumbnail.jpg) | in repo | _paste after upload_ |
| 6 | Argentina vs Algeria | _rendering now — link will be added on delivery_ | ~80 MB | [thumbnail.jpg](https://github.com/DansiDanutz/WorldCup/raw/claude/hopeful-cori-v24dsy/marketing/match-videos/match06-argentina-vs-algeria/thumbnail.jpg) | in repo | _paste after upload_ |

## Where everything lives

- **Upload masters (the exact files to upload):** `marketing/match-videos/<epNN-...>/WorldCup26_MatchNN_*_upload.mp4` — committed with `git add -f` (the `.gitignore` excludes mp4 render artifacts by default, masters are force-added on purpose).
- **Thumbnails:** `marketing/match-videos/<epNN-...>/thumbnail.jpg` (1280×720 JPG, ready for YouTube).
- **Subtitles:** `marketing/match-videos/<epNN-...>/subtitles.srt` (upload alongside the video).
- **Suggested title/description/music credits:** each episode's `README.md`.
- **Everything else** (frames, audio stems, generated clips, music) is re-buildable: media re-downloads via `npm run fetch-assets` (job IDs in `jobs-manifest.json`), frames re-render via `npm run render`.

## Note on Ep2

`WorldCup26_Match02_KOR_CZE.mp4` (44 MB) is the final Ep2 master that was
delivered for upload. Later episodes use the `_upload` suffix for the
YouTube-ready CRF26 encode — same thing, clearer name.
