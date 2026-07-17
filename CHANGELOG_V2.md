# Changelog - V2 Release

## 2026-07-17 - V2 Core Launch 🚀

### Added
- **Itinerary pages** (`/outings/[id]/itinerary`) for multi-day roadtrips with day-by-day breakdown
- **AI daily summaries** via Google Gemini API (free tier) - generates narrative summaries from notes, anecdotes, and places visited
- **Timeline page** (`/timeline`) - chronological view of all club events with filterable categories
- **Statistics dashboard** (`/stats`) - global KPIs (KM, outings, places) + per-member breakdown + monthly progression
- **GPX/KML import** (`/import`) - upload tracks from Calimoto or places from Google My Maps, automatic parsing and DB insertion
- **Full-text search** (`/search`) - query across outings, places, and anecdotes
- **Mobile-first bottom navigation** - reusable `BottomNav` component for V2 pages
- **API route** for AI summary generation: POST `/api/generate-summary`

### Services & Utilities
- `lib/outings/days-service.ts` - manage outing days, anecdotes, visited places
  - `getOutingDays()`, `createOutingDay()`, `updateOutingDay()`, `deleteOutingDay()`
  - `getAnecdotesForDay()`, `createAnecdote()`
  - `getPlacesForDay()`, `getAllPlacesForOuting()`

### Fixed
- TypeScript type compatibility for Supabase null values (description, dates)
- Build optimization - removed unnecessary npm scripts

### Database
- No new tables - all V2 features use existing schema (outing_days, anecdotes, visited_places, gpx_tracks, etc.)
- RLS policies already in place

### Environment
- Added support for `GOOGLE_API_KEY` for Gemini API
- `AI_PROVIDER=gemini` for daily summaries (can swap to other LLMs later)

---

## Deployment Notes

- **Production URL**: https://kemia-motors-production.up.railway.app
- **Auto-deploy**: Enabled - any push to `main` triggers Railway rebuild
- **Build time**: ~2-3 minutes
- **API quota**: Gemini free tier supports +60 summaries/min (sufficient)

---

## V2.1+ Roadmap (Not in scope)

- [ ] Choropleth maps (countries/regions visited)
- [ ] Instagram/Google Drive media previews (thumbnails)
- [ ] PDF export "carnet de voyage"
- [ ] Offline mode (PWA caching)
- [ ] Advanced analytics (heatmaps, patterns)
- [ ] Photo gallery for anecdotes
- [ ] Member activity feed

---

## Testing Checklist

- [x] Timeline page loads and filters work
- [x] Stats dashboard calculates correctly
- [x] Import page UI is functional
- [x] Search input responds
- [x] Itinerary page structure is in place
- [x] Build passes TypeScript type-check
- [x] Git history is clean

---

**Status**: Ready for user testing on production 👍
