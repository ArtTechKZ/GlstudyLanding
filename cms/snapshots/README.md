# Frozen public content

`public-ru-study24.json` is the checked RU projection with revision `2a1af762fd6d9b44d7f5220f47b37d83bf225f67d96162b3da052f708d8f9810`.
`npm run build:public` projects the checked-in upstream `src/data/content-snapshot.json` (revision `1f1a42934b179318807cb00b297e68cb48e314b41087ae9448fdcfb712839620`) and verifies its public structure. No live CMS or private credentials are needed. The build generates its own ignored scratch output; it does not require pre-existing `.qa` files.
KK/EN source catalogs remain for local development, with publication approval false. The public build emits RU only. Synthetic records and CMS runtime are excluded.
