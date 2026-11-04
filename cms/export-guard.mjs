// Export guard (GL-STUDY-31): chain  cms -> export -> snapshot -> validation -> build.
//
// The Directus schema/mapper does not yet carry the content added in GL-STUDY-30 (branch statuses
// online/online_launch/repair, per-branch Instagram and offerings, cities without a page, services,
// packages, confirmed company contacts). An export from such a CMS would be a valid snapshot that
// silently deletes that content from the committed snapshot. This guard compares a freshly mapped
// snapshot with the one that is about to be overwritten and refuses the write when content disappears.
//
// It is protection only, NOT CMS compatibility: Directus still cannot author this content.
const NEW_STATUSES = ['online', 'online_launch', 'repair'];
const CONTACT_FIELDS = ['phone', 'phoneHref', 'internationalPhone', 'internationalWhatsApp', 'instagram'];
const idSet = list => new Set((Array.isArray(list) ? list : []).map(item => item.id));
const filled = value => Array.isArray(value) ? value.length > 0 : value != null && value !== '';

/** Lists what the candidate snapshot would lose or silently change compared with the current one. */
export function findContentLoss(current, candidate) {
  const lost = [];
  const before = current?.data, after = candidate?.data;
  if (!before || !after) return lost;
  let legacyFormat = false;

  for (const key of ['services', 'packages']) {
    const have = idSet(after[key]);
    for (const id of idSet(before[key])) if (!have.has(id)) { lost.push(`${key}:${id}`); legacyFormat = true; }
  }

  const nextCities = new Map(after.cities.map(city => [city.id, city]));
  const pending = [];
  for (const city of before.cities) {
    const next = nextCities.get(city.id);
    if (!next) { lost.push(`city:${city.id}`); continue; }
    if (city.hasPage === false && next.hasPage !== false) { lost.push(`city-page-flag:${city.id}`); legacyFormat = true; }
    const nextBranches = new Map(next.branches.map(branch => [branch.id, branch]));
    for (const branch of city.branches) {
      const found = nextBranches.get(branch.id);
      if (!found) { lost.push(`branch:${branch.id}`); continue; }
      for (const field of ['instagram', 'offerings']) if (filled(branch[field]) && !filled(found[field])) { lost.push(`branch-${field}:${branch.id}`); legacyFormat = true; }
      // A branch phone that disappears is a lost contact (GL-STUDY-31: three phones were once lost from a candidate this way). Changing a number is editorial; removing it needs acknowledgement.
      if (filled(branch.phone) && !filled(found.phone)) lost.push(`branch-phone:${branch.id}`);
      if (NEW_STATUSES.includes(branch.status) && found.status !== branch.status) pending.push({id: branch.id, status: branch.status, found: found.status});
    }
  }
  // A status change is an ordinary editorial edit, except when the export as a whole is old-format
  // (it cannot express the new statuses, so every one of them silently collapses to a legacy value).
  if (legacyFormat) for (const item of pending) lost.push(`branch-status:${item.id} ${item.status}->${item.found}`);

  for (const field of CONTACT_FIELDS) {
    const was = before.company?.[field], now = after.company?.[field];
    if (filled(was) && was !== now) lost.push(`company.${field}`);
  }
  return lost;
}

/**
 * Throws before the current snapshot is replaced. `acceptedRevision` must equal the revision of the
 * snapshot being replaced: an explicit, single-use acknowledgement that the listed removals are intended.
 */
export function assertNoContentLoss(current, candidate, {acceptedRevision} = {}) {
  const lost = findContentLoss(current, candidate);
  if (!lost.length) return;
  if (acceptedRevision && acceptedRevision === current.revision) return;
  throw Error(`CMS export would remove or change GL-STUDY-30 content (${lost.length}): ${lost.slice(0, 12).join(', ')}${lost.length > 12 ? ', …' : ''}. Previous snapshot retained. If this is intended, rerun with GL_ACCEPT_CONTENT_LOSS=${current.revision}`);
}
