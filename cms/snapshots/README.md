# Frozen public content

The checked public snapshot is `public-ru-study24.json`; its historical filename is retained for compatibility. GL-STUDY-26 removes the withdrawn stage24 media from both this projection and `src/data/content-snapshot.json`. All other content and RU/KK/EN approvals are preserved.

`npm run build:public` projects the checked-in upstream snapshot. No live CMS, private QA input or admin token is required. CMS export and snapshot/release validation enforce `../media-policy.json`, preventing replay of withdrawn record IDs, native files, known byte hashes and public derivative paths. Original private media/history is retained.
