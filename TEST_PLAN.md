# Exploration Tracker - Test Plan & Notes

## Test Session Info
- Date: 2026-01-28
- Tester: Claude
- Branch: claude/exploration-tracker-app-GKuIz

---

## 1. Server & API Tests

### 1.1 Server Startup
- [ ] Server starts without errors
- [ ] Data file auto-created if missing
- [ ] Console shows correct URL and data path

### 1.2 API Endpoints
- [ ] GET /api/data - returns exploration data
- [ ] PUT /api/data - saves exploration data
- [ ] POST /api/data/:explorationId/:locationId/toggle - toggles visited status
- [ ] PUT /api/data/:explorationId/:locationId - updates location details
- [ ] GET /api/settings - returns settings
- [ ] PUT /api/settings - updates settings

---

## 2. Frontend Build & Load Tests

### 2.1 Build
- [ ] TypeScript compiles without errors
- [ ] Vite build succeeds
- [ ] No console warnings in build output

### 2.2 Initial Load
- [ ] App loads without JavaScript errors
- [ ] Dashboard renders as default view
- [ ] All tabs are visible and clickable
- [ ] Header and settings button visible

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
- [ ] Undo button appears in toast
- [ ] Clicking Undo reverts the toggle
- [ ] Toast dismisses after undo

---

## 7. Settings Page Tests

### 7.1 Data Storage
- [ ] Current data path displays
- [ ] Can change data path
- [ ] Save button works

### 7.2 Export/Import
- [ ] Export downloads JSON file
- [ ] Import accepts JSON file
- [ ] Import replaces data and reloads

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
- [ ] Service worker registers
- [ ] Caches static assets
- [ ] API calls bypass cache

### 9.2 Install Prompt
- [ ] Banner appears in supported browsers
- [ ] Install button triggers prompt
- [ ] Dismiss button hides banner

### 9.3 Manifest
- [ ] App can be installed as PWA
- [ ] Correct name and icons

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
- [ ] App works with no visits
- [ ] Dashboard shows zeros gracefully
- [ ] Statistics page handles no data

### 11.2 Data Integrity
- [ ] Invalid import file shows error
- [ ] Missing data file is auto-created
- [ ] Corrupt data handled gracefully

---

## Test Findings Log

### Session 1 - [Date/Time]

#### Issues Found:
(To be filled during testing)

#### Screenshots Taken:
(To be filled during testing)

---

## Notes for Continuation

If testing is interrupted, resume from the last unchecked item above.
Current test focus: (update as testing progresses)
