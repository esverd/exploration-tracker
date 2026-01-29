# Exploration Tracker - Test Plan & Notes

## Test Session Info
- Date: 2026-01-28
- Tester: Claude
- Branch: claude/exploration-tracker-app-GKuIz

---

## 1. Server & API Tests

### 1.1 Server Startup
- [x] Server starts without errors ✅
- [x] Data file auto-created if missing ✅ (creates `data/exploration-data.json`)
- [x] Console shows correct URL and data path ✅

### 1.2 API Endpoints
- [x] GET /api/data - returns exploration data ✅
- [x] PUT /api/data - saves exploration data ✅
- [x] POST /api/data/:explorationId/:locationId/toggle - toggles visited status ✅
- [x] PUT /api/data/:explorationId/:locationId - updates location details ✅
- [x] GET /api/settings - returns settings ✅
- [x] PUT /api/settings - updates settings ✅

**Note:** API allows toggling non-existent explorations/locations (stores in data file). This is by design for flexibility but could be validated if desired.

---

## 2. Frontend Build & Load Tests

### 2.1 Build
- [x] TypeScript compiles without errors ✅
- [x] Vite build succeeds ✅ (309KB JS, 18KB CSS)
- [x] No console warnings in build output ✅

### 2.2 Initial Load
- [x] HTML loads with correct meta tags ✅
- [x] CSS and JS assets load correctly ✅
- [x] manifest.json loads correctly ✅
- [x] Service worker file accessible ✅
- [x] Geo data files (world, us-states) accessible ✅
- [ ] Dashboard renders as default view (requires browser)
- [ ] All tabs are visible and clickable (requires browser)
- [ ] Header and settings button visible (requires browser)

---

## 3. Dashboard Tests

### 3.1 Overview Cards
- [ ] Total explored count displays
- [ ] Per-exploration cards show correct counts
- [ ] Progress bars render correctly
- [ ] Cards are clickable and navigate to explorations

### 3.2 Continent Breakdown (World)
- [ ] Shows breakdown by continent
- [ ] Bars reflect actual visited counts

### 3.3 Recent Visits
- [ ] Shows recent visits with dates
- [ ] Displays correct exploration source

---

## 4. Map View Tests

### 4.1 World Map
- [ ] Map renders and fills container properly
- [ ] Countries are clickable
- [ ] Visited countries show green color
- [ ] Hover shows tooltip with country name
- [ ] Zoom controls (+/-) work
- [ ] Reset zoom button appears when zoomed
- [ ] Legend shows visited/not-visited colors
- [ ] Map doesn't overflow or position incorrectly

### 4.2 US States Map
- [ ] Map renders centered on US
- [ ] States are clickable
- [ ] Colors update on toggle

### 4.3 Texas State Parks (Marker Mode)
- [ ] Texas outline renders
- [ ] Park markers (circles) are visible
- [ ] Markers are clickable
- [ ] Tooltip shows park name on hover

### 4.4 Screenshot Feature
- [ ] Screenshot button in progress bar
- [ ] Generates and downloads PNG image
- [ ] Toast notification appears

---

## 5. Location List Tests

### 5.1 Basic Functionality
- [ ] Search filters locations
- [ ] Visited section shows checked items
- [ ] Not Visited section shows unchecked items
- [ ] Clicking toggles visited status

### 5.2 Sort & Filter
- [ ] Sort by Name A-Z works
- [ ] Sort by Name Z-A works
- [ ] Sort by Most Visits works
- [ ] Sort by Most Recent works
- [ ] Continent filter appears for World exploration
- [ ] Continent filter correctly filters countries

### 5.3 Location Details
- [ ] Cogwheel button appears on visited items
- [ ] Modal opens on cogwheel click
- [ ] Can edit visit count
- [ ] Can add/remove visit dates
- [ ] Can add notes
- [ ] Save persists changes

---

## 6. Toast & Undo Tests

### 6.1 Toast Notifications
- [ ] Toast appears on toggle
- [ ] Shows correct message (marked/unmarked)
- [ ] Toast auto-dismisses after delay
- [ ] Can manually dismiss toast

### 6.2 Undo Functionality
- [x] Toggle twice returns to original state (API verified) ✅
- [ ] Undo button appears in toast (requires browser)
- [ ] Clicking Undo reverts the toggle (requires browser)
- [ ] Toast dismisses after undo (requires browser)

---

## 7. Settings Page Tests

### 7.1 Data Storage
- [x] GET /api/settings returns current data path ✅
- [x] PUT /api/settings updates settings ✅
- [ ] UI displays current data path (requires browser)
- [ ] Save button works (requires browser)

### 7.2 Export/Import
- [x] GET /api/data returns full data for export ✅
- [x] PUT /api/data replaces all data (import simulation) ✅
- [ ] Export downloads JSON file (requires browser)
- [ ] Import accepts JSON file (requires browser)

### 7.3 Theme Colors
- [ ] Color pickers display current colors
- [ ] Can change each color
- [ ] Apply Colors updates the app
- [ ] Reset to Defaults works
- [ ] Colors persist after reload (localStorage)

---

## 8. Statistics Page Tests

### 8.1 Progress Bars
- [ ] Shows bar for each exploration
- [ ] Percentages are accurate

### 8.2 Timeline Chart
- [ ] Shows visits by year
- [ ] Bar heights are proportional

### 8.3 Most Visited
- [ ] Lists locations with highest visit counts
- [ ] Grouped by exploration

---

## 9. PWA Tests

### 9.1 Service Worker
- [x] sw.js file exists and is accessible ✅
- [x] Contains correct cache logic ✅
- [x] API calls excluded from cache ✅
- [ ] Service worker registers in browser (requires browser)
- [ ] Caches static assets (requires browser)

### 9.2 Install Prompt
- [ ] Banner appears in supported browsers
- [ ] Install button triggers prompt
- [ ] Dismiss button hides banner

### 9.3 Manifest
- [x] manifest.json loads correctly ✅
- [x] Correct name: "Exploration Tracker" ✅
- [x] Correct short_name: "Explorer" ✅
- [ ] App can be installed as PWA (requires browser)

---

## 10. Mobile / Responsive Tests

### 10.1 Layout
- [ ] Tabs scroll horizontally on small screens
- [ ] Map takes full width
- [ ] Drawer toggle button appears (< 900px)
- [ ] Drawer slides in/out
- [ ] Backdrop closes drawer

### 10.2 Touch Interactions
- [ ] Map is zoomable/pannable
- [ ] Buttons are tap-friendly

---

## 11. Edge Cases & Error Handling

### 11.1 Empty State
- [x] Server starts with empty data file ✅
- [ ] Dashboard shows zeros gracefully (requires browser)
- [ ] Statistics page handles no data (requires browser)

### 11.2 Data Integrity
- [ ] Invalid import file shows error
- [x] Missing data file is auto-created ✅
- [ ] Corrupt data handled gracefully

---

## Test Findings Log

### Session 1 - 2026-01-28

#### Tests Completed (Automated):
1. **Server & API:** All 6 API endpoints tested and working
2. **Build:** TypeScript compiles, Vite builds successfully
3. **Static Files:** HTML, CSS, JS, manifest, service worker, geo data all load
4. **Toggle/Undo:** API-level toggle twice restores original state
5. **Config Validation:** 206 countries, 51 states, 89 Texas parks configured

### Session 2 - 2026-01-29

#### Vitest Component Tests Added (44 tests total, all passing)

**Dashboard Tests (7 tests):**
- [x] renders the dashboard header ✅
- [x] displays total explored count ✅
- [x] shows exploration cards with correct counts ✅
- [x] calls onNavigate when clicking exploration card ✅
- [x] shows continent breakdown for world exploration ✅
- [x] displays recent visits when there are visit dates ✅
- [x] shows getting started message when no recent visits ✅

**LocationList Tests (14 tests):**
- [x] filters locations by search term ✅
- [x] shows empty state when no results found ✅
- [x] search is case-insensitive ✅
- [x] sorts by name A-Z by default ✅
- [x] changes sort order when selecting different option ✅
- [x] sorts by visit count when selected ✅
- [x] shows continent filter for world exploration ✅
- [x] filters by continent when selected ✅
- [x] does not show continent filter for non-world explorations ✅
- [x] calls onToggle when clicking a location ✅
- [x] shows cogwheel button only for visited locations ✅
- [x] calls onOpenDetail when clicking cogwheel ✅
- [x] separates visited and not visited sections ✅
- [x] shows visit metadata for visited locations ✅

**Statistics Tests (12 tests):**
- [x] renders progress bars for each exploration ✅
- [x] shows correct counts in progress bars ✅
- [x] handles empty data gracefully ✅
- [x] renders visits by year section when there are dates ✅
- [x] shows years with visit dates ✅
- [x] does not show visits by year section when no dated visits ✅
- [x] renders most visited section when locations have visitCount > 1 ✅
- [x] shows visit count for locations with more than 1 visit ✅
- [x] does not show most visited section when no locations have visitCount > 1 ✅
- [x] groups by exploration ✅
- [x] shows world continents section ✅
- [x] renders statistics header ✅

**Toast Tests (11 tests):**
- [x] shows toast when showToast is called ✅
- [x] auto-dismisses toast after default duration (4000ms) ✅
- [x] uses custom duration when specified ✅
- [x] does not auto-dismiss when duration is 0 ✅
- [x] allows manual dismissal ✅
- [x] clears timer when manually dismissed (no lingering timers) ✅
- [x] shows multiple toasts ✅
- [x] renders toasts with action buttons ✅
- [x] calls action onClick when action button clicked ✅
- [x] has dismiss button on toasts ✅
- [x] undo action reverts the toggle ✅

**To run tests:**
```bash
npm test        # Run all tests once
npm run test:watch  # Run tests in watch mode
```

#### Observations:
1. API accepts any explorationId/locationId - stores even if not in config
2. Server auto-creates data directory and file on first run
3. Service worker caches static assets, bypasses API calls
4. Build output: 309KB JS (101KB gzipped), 18KB CSS (3.7KB gzipped)

#### Issues Found & Fixed:

**Issue 1: Memory leak in usePWAInstall hook** (FIXED)
- Location: `src/hooks/usePWAInstall.ts`
- Problem: The `appinstalled` event listener was not removed in cleanup
- Fix: Added named handler and cleanup in useEffect return

**Issue 2: Timer leak in ToastContext** (FIXED)
- Location: `src/contexts/ToastContext.tsx`
- Problem: setTimeout timers weren't cleared when toasts dismissed manually
- Fix: Added timer tracking with useRef Map, clear timers on dismiss

#### Code Review Passed:
- No console.log statements left in code
- No TODO/FIXME comments
- All useEffect hooks have proper dependencies
- All useCallback/useMemo have correct dependency arrays

#### Browser Testing Required:
The following need manual browser testing (puppeteer unavailable):
- Dashboard rendering and card interactions
- Map rendering, clicking, zooming
- Location list search/sort/filter
- Toast notifications and undo UI
- Settings page UI interactions
- Theme color picker
- PWA install prompt
- Mobile responsive layout

---

## Test Data State

Current test data in the system:
```json
{
  "world": {
    "France": {"visited": true, "visitCount": 3, "visitDates": ["2024-06-15", "2023-12-01"], "notes": "Lovely"},
    "Germany": {"visited": true},
    "Japan": {"visited": true}
  },
  "us-states": {
    "Texas": {"visited": true},
    "California": {"visited": true}
  },
  "texas-state-parks": {
    "big-bend-ranch": {"visited": true}
  }
}
```

---

## Notes for Continuation

**If testing is interrupted, resume from:**
- Section 3 (Dashboard Tests) - requires browser
- All sections marked "requires browser" need manual verification

**Current test focus:** Browser-based UI testing

**Server status:** Running on http://localhost:3001

**To restart testing:**
```bash
cd /home/user/exploration-tracker
node server/index.js &
# Then open http://localhost:3001 in browser
```
