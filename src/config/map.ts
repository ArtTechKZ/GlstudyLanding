// GL-STUDY-30: maps are hidden by client instruction ("карты временно скрыть") — no verified map links or
// coordinates exist. Restore by setting this to true only after real coordinates are added to the branch table
// (the 2GIS card for Алматы — Масанчи is recorded in GL-STUDY-30.md).
export const MAPS_ENABLED = false;

export const MAP_CONFIG = {
  tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};
