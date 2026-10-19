# Asset notices

GL Study logos and imagery are supplied brand materials. This repository does not grant a new licence to the GL Study brand or third-party photographs. Permission for public use, including images of people and minors, must be confirmed by the rights holder. The photographs are not independent evidence that the people shown are GL Study students or staff.

According to the supplied asset register, the following files were extracted from the GL Study 2026 brandbook. These source references are retained for attribution; image rights have not been independently verified. The complete brandbook is not distributed with the website.

| Included asset | Recorded source |
| --- | --- |
| `public/brand/logo-color.svg`, `logo-white.svg` | Brandbook page 4; white variant uses the same logo geometry |
| `public/favicon.svg` | GL Study brand mark |
| `public/brand/pattern-*.svg` | Brand motifs, page 20 |
| `public/images/home/hero-student.webp` | Page 31 |
| `public/images/home/direction-kids.webp` | Page 24 |
| `public/images/home/direction-teens.webp`, `direction-adults.webp` | Page 25 |
| `public/images/home/graduate-cap.webp`, `ielts-target.webp` | Page 31 |
| `public/images/home/travel-prague.webp` | Page 31 |
| `public/images/home/travel-malaysia.webp`, `offline-class.webp`, `camp-students.webp` | Page 23 |
| `public/images/home/brand-wristbands.webp` | Page 43 |
| `public/images/home/brand-pin.webp` | Page 31 |

The vector logo files were previously repaired by removing invalid masks while retaining the path coordinates. No new authorship claim is made for supplied brand assets. Separate licence records for individual vector paths were not supplied.

Inter (variable 500–800, including Cyrillic/Cyrillic Extended and Latin) and Bebas Neue are self-hosted WOFF2 subsets from the official Google Fonts CSS2/gstatic distribution. No font family or glyph redesign was made. The original SIL OFL 1.1 notices are retained in public/licenses/inter-ofl.txt and public/licenses/bebasneue-ofl.txt. scripts/sync-brand-fonts.js records the exact immutable gstatic sources in src/styles/_fonts.scss and local .qa evidence; it is an explicit maintenance command, not a build/network hook.

Third-party dependency licence notices remain in the packages installed by `npm ci`; this project does not replace their licences. No additional open-source licence for the application code was supplied.

Leaflet 1.9.4 (BSD-2-Clause) загружается динамически; лицензия сохранена в [public/licenses/leaflet.txt](public/licenses/leaflet.txt). OSM Standard tiles не копируются и не предзагружаются; атрибуция отображается библиотекой. Источник/атрибуция настраиваются вместе в src/config/map.ts. Fixtures карты из scripts/fixtures не входят в dist.

## GL-STUDY-09 derivatives and presentation

`direction-kids`, `direction-teens`, `direction-adults`, `ielts-target`, `offline-class` and `travel-prague` have `-240.webp` and `-480.webp` derivatives. They are proportional downscales of the existing supplied brandbook images above, encoded WebP quality 82; original files remain unchanged. No new stock or AI images were added. The online card reuses the laptop illustration from page 25. The classroom image is illustrative, not evidence of a GL Study branch or staff. The Prague image is promotional, not a trip report. The section explicitly identifies all images as brandbook illustrations.

Before GL-STUDY-24 no verified company galleries had been supplied. Destination-specific Prague/Malaysia galleries still show a pending-content message. Distinct marketing images and one deliberately broken URL are used only in the isolated `scripts/fixtures/study09.tsx` component fixture; it is excluded from the production build.

Lucide React 1.57.0: application UI pictograms use explicit named exports, currentColor and strokeWidth 2. The complete package licence notice is retained in public/licenses/lucide.txt. Lucide is not used for GL STUDY or partner logos.

GL-STUDY-11 adds proportional hero-student-400.webp and hero-student-640.webp derivatives (WebP quality 85) of the existing page 31 asset. The original 800×1200 image is retained as the largest srcset candidate. No composition, logo or gradient was redrawn.


## GL-STUDY-24 — provided company archives

The director supplied the five public sources below for use on this website. Eight selected originals (six gallery JPEGs and two archive videos) are preserved privately in `.qa/study24/media-originals`; they are excluded from static builds. Source dates and individual model releases were not supplied. No depicted person is assigned a name, staff role, review, IELTS score or destination based on appearance.

| Provided source | Selected material | Website use |
|---|---|---|
| [Teachers & Stugents](https://kseniya-goldrat.gallery.photo/gallery/teachers-stugents/) | IMG_3881.jpg, IMG_3900.jpg | Children/learning, main hero, gallery |
| [Grandluxe Teachers & Students](https://kseniya-goldrat.gallery.photo/gallery/grandluxe-teachers-students/) | IMG_3145.jpg, IMG_3156.jpg, IMG_3161.jpg | Company/learning gallery and offline classroom |
| [Potential camp opening](https://kseniya-goldrat.gallery.photo/gallery/lager-potencial-otkrytie-smeny/) | IMG_9351.jpg | Company camp/community gallery; no Prague or Malaysia claim |
| [GL archive](https://disk.yandex.ru/d/6rrMn6UjbhyMbg) | ЗАНЯТИЯ GL/IMG_0168.mov | One neutral lesson frame in learning/gallery |
| [Group activity archive](https://disk.yandex.kz/d/jcqHJ6OpIZQ8nA) | песню поют.MP4 | Native manually controlled video with poster, muted by default |

Gallery originals were obtained through the source's enabled **Original size / Download** action. Photographer credit: Ксения Гольдрат. Public WebP derivatives preserve the complete frame with orientation applied; EXIF/GPS are removed, people and marks are not retouched. Directus native file relationships produce hashed 480/900px responsive derivatives. The selected MP4 is served locally; metadata sanitization preserves sample offsets and audio, with no autoplay or external iframe. No transcript was supplied; the description is not a verbatim subtitle track. The file registry, original/derivative SHA-256, dimensions, rights basis and RU/KK/EN alt/captions are in private `.qa/study24/media-registry.json` and the CMS approved snapshot. KK/EN copy remains a draft under the existing approval gate.
