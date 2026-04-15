# buildit.dreamit.25kmrrit — Founder Command Center

## What this project is

A single-file HTML dashboard (`dashboard.html`) — Melanie's personal founder OS for hellomelmo.com. Hosted on GitHub Pages, syncs data across devices via Supabase.

**Live URL:** https://melmiztonian.github.io/buildit-dreamit-25kmrrit/

## The files

```
dashboard.html   ← entire app — HTML + CSS + JS in one file
index.html       ← copy of dashboard.html for GitHub Pages (always keep in sync)
CLAUDE.md        ← this file — update after every dashboard.html change
.claude/settings.json  ← PostToolUse hook that reminds Claude to update CLAUDE.md
```

**Deploy workflow:** edit dashboard.html → `cp dashboard.html index.html` → commit → push → GitHub Pages auto-deploys.

## Supabase Sync

- **Project URL:** `https://ingvjqyqoqggskkrklhk.supabase.co`
- **Anon key:** hardcoded in `<script>` as `SB_KEY`
- **Table:** `dashboard_state` (key TEXT PK, value JSONB, updated_at TIMESTAMPTZ)
- **How it works:** `LS.set()` writes to both localStorage (instant) and Supabase (batched every 500ms). On page load, `syncFromSupabase()` pulls all remote state and re-renders if anything changed.
- **Offline-safe:** if Supabase is unreachable, localStorage works as fallback.

---

## Design System

### Font (Google Fonts)
| Font | Use |
|------|-----|
| `DM Sans` | ALL text — headings, body, labels, inputs, badges |

**Never substitute the font.**

### Color Palette
```
--bg:              #F5F0E8   warm off-white background
--card:            #FEFCF8   card surface (near-white)
--text:            #3D3228   dark brown text
--sage:            #A8B5A0   muted sage accent
--sage-light:      #D4DDCF   light sage (badges)
--terracotta:      #C47A5A   primary accent (highlights, progress, checked states)
--terracotta-light:#E8B49A   light terracotta (active card borders, badges)
--sand:            #D4C5A9   tan (checkbox borders, unchecked states)
--sand-light:      #E8DCC8   light sand (heatmap empty cells, progress bar bg)
--muted:           #8B7B6B   muted text (labels, subtitles)
--border:          #E0D6C8   subtle card borders
--glow:            rgba(196,122,90,0.25)  section-complete glow
```

### Cards
```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;
```
When all items in a card are checked, `.section-complete` adds a warm terracotta glow via `box-shadow`.

### Custom Checkboxes (daily non-negotiables, gratitude)
```css
width: 20px; height: 20px;
border: 2px solid var(--sand);
border-radius: 5px;
/* checked state: */
background: var(--terracotta);
border-color: var(--terracotta);
transform: scale(1.1);
```

### Habit Block Visual Structure
Each `.habit-block` is a visually distinct sub-card inside a `.card`:
- Background: `var(--bg)`, rounded 12px, 20px padding
- Header: name + weekly target | year count badge (terracotta pill). Separated by bottom border.
- Week grid: white card with border, day labels + date numbers + fixed-size 34px checkboxes or inputs
- Stats: colored pill badges (week=terracotta, month=sage, year=sand). Fixed width — no layout shift on value change.
- Pace line: white card with border, shows remaining + weekly pace needed
- Detail panel: separated by top border, contains pill-style view tabs (Month/Year)
- Year grid: centered 4-col grid of month cards, each with S-M-T-W-T-F-S headers
- Month calendar: centered, max-width 320px
- All numeric displays use `font-variant-numeric: tabular-nums` to prevent layout shift

---

## Layout

**Horizontal tab bar** at top (no sidebar). Max-width 1400px centered.
**Tab pills** — rounded pill buttons (24px radius, border, terracotta fill when active).
**Two-up rows** (`.two-up-row`) pair cards side by side at 900px+ with `align-items: stretch` (equal height, stacks on mobile). Dashboard: READ ME + Morning Ritual, then Keystones + Business.
**2-col habit grids** (`.habit-grid-2col`) — keystone containers and secondary fitness use 2-col grid for habit blocks inside their cards. Add button/form spans both columns.
**Half-width** (`.half-width`) — Household card is 50% width on desktop, below Secondary Fitness.
**Global header** — title + auto-updating date (no priority field).
**Tab navigation** — 4 tabs, only one `.tab-page` is `.active` at a time.
**Responsive** — breakpoints at 768px (tablet) and 480px (mobile). Tabs scroll horizontally on small screens, cards go full-width, grids stack.

---

## Pages & Sections

| Tab ID | Nav label | Contents |
|--------|-----------|----------|
| `tab-dashboard` | Dashboard | READ ME!! + Morning Ritual + Keystone Habits + Revenue Tracker |
| `tab-business` | Building the Dream | Daily Business Non-Negotiables (habit blocks, 2-col grid) |
| `tab-habits` | Habit Tracker | Synced Keystones + Secondary Fitness + Household — all habit blocks with add/delete |
| `tab-cal` | Cal's Framework | Deep Life Stack timeline + 4 layers with checkboxes/textareas |
| `tab-library` | Grounding Library | Currently Active item + Backlog (CRUD) + Archive (collapsible, unarchive) |

---

## Tab 1: Dashboard

**READ ME!!** — scrollable card (max-height 220px, custom scrollbar) with connection manifesto. Ends with "It's something we create."

**Morning Ritual** — gratitude practice rendered as a full habit block (same unified system as all other habits). Includes week grid, stats badges, year goal, pace, and toggleable month/year detail views.

**Keystone Habits** — 3 default habits (conversion content 7x, 13K steps 7x, Khmer study 5x). Uses unified habit system (see below).

**Daily Business Non-Negotiables** — 4 habits using the unified habit system (group: `business`). Conversion video is synced with the keystone habit (same `ks_content` entry), not duplicated here.
- Message Sharon 5x/week (261/yr)
- Post 2 IG stories 5x/week (261/yr)
- DM connection time ~30 mins 5x/week (261/yr)
- Weekly planning + fill in metrics 1x/week (52/yr)

**Revenue Tracker**:
- Editable total revenue number
- Progress bar toward active milestone
- Breakdown: template sales ($27/sale) + app MRR ($5/mo subscriber) with auto-calc
- Milestone ladder: $3,500 → $5,000 → $10,000 → $25,000 (Final Boss)

---

## Tab 2: Habit Tracker

**Countdown Bar** — shows days remaining, weekdays remaining, and weeks remaining until the goal date. Editable goal date input (defaults to Dec 31 of current year, saved to localStorage as `goal_date`). All habit pace calculations use this goal date.

**Primary Keystones** — same 3 habits from Tab 1, fully synced (same `renderAllHabits()` call).

**Secondary Fitness Tracker** — 9 habits using the same unified system (see below).

Habits + year goals: water (365), running (3650 min), pull-ups (1600), push-ups (2500), hip thrusts (6700), tricep dips (2500), abs (261), full body gym (104), glute gym (104).

**Household** — laundry (1x/week, 52/year), uses the same unified habit system.

---

## Unified Habit System

ALL habits (morning + keystones + business + secondary + household) use identical rendering via `renderHabitBlock()` and `renderAllHabits()`.

Groups: `morning`, `keystone`, `business`, `secondary`, `household`. Each renders into its own container via `renderGroupInto()`.

Each habit block shows:
- **Header**: emoji + name + weekly target + year count / year goal (tabular-nums pill badge)
- **Week grid**: `grid-template-columns: repeat(7, 1fr)` — day name, date number, and check/input per day. Fully responsive.
- **Stats row**: Week total/target, month total, year total/goal as colored pill badges (tabular-nums) + "Show details" toggle
- **Pace line**: two lines — remaining to hit yearly goal, then weekly pace needed
- **Starting count**: editable offset for year total (for mid-year start)
- **Action pills**: Delete, Edit, Show Details — three pill buttons in a row below starting count
- **Detail panel** (toggleable via Show Details pill, hidden by default) with 2 tabbed views:
  - **Month view**: Centered calendar grid with day numbers + weekly breakdown bars with labels
  - **Year view**: Centered 12-month grid (4 columns), each month is a mini-calendar with S/M/T/W/T/F/S headers and day numbers. Clickable for check-type habits. Today highlighted.

### Add/Delete Habits
- **Edit**: click the Edit pill button. Opens an inline form (same fields as add) pre-filled with current values. For default habits, saves an edited copy (original ID preserved so data carries over). For custom habits, updates in-place.
- **Delete**: click the Delete pill button. Deleting a default habit adds its ID to `habits_custom.deleted`. Deleting a custom habit removes it from `habits_custom.added`.
- **Add**: "+ Add habit" button below each group opens an inline form (name, emoji, type, weekly target, year goal, unit). Creates a new habit with ID `custom_` + timestamp.
- Storage: `habits_custom` in localStorage: `{ added: [...habit objects], deleted: ['id1', ...] }`
- `getActiveHabits()` merges defaults (minus deleted) with added customs.

Per-habit storage: `habit_{id}_week_{weekStart}` (array of 7), `habit_{id}_start` (number).

---

## Tab 3: Cal's Framework

**Title:** "The Deep Life Stack — Cal Newport"
**Timeline bar** — 4 colored blocks: Discipline (2 wks, sage) → Values (4 wks, sand) → Control (4 wks, terracotta-light) → Vision (6 wks, terracotta)

**Layer 1 — Discipline (Weeks 1–2):** 2 steps with checkboxes
**Layer 2 — Values (Weeks 3–6):** 3 steps with checkboxes + 1 textarea
**Layer 3 — Control (Weeks 7–10):** 3 steps with sub-checkboxes + 2 textareas
**Layer 4 — Vision (Weeks 11–16):** 2 steps with checkboxes + 2 textareas

All checkboxes and textareas persist to localStorage with `cal-*` keys.

---

## Tab 4: Grounding Library

**Currently Active** — highlighted card with editable title, type (book/film/video/other), "why it matters" textarea, and "Finished" checkbox (moves to archive).

**Backlog** — list with type badges, notes, "Set as current" and "Delete" buttons. "Add new item" opens inline form.

**Archive** — collapsible section, completed items with strikethrough, completion date, and "Unarchive" button (moves back to backlog).

All stored as single `grounding_library` JSON in localStorage.

---

## localStorage Keys

| Key | Value |
|-----|-------|
| `lastResetDate` | ISO date — detects new day for daily resets |
| `lastWeekReset` | ISO date — detects new week for weekly resets |
| `gratitude_{date}` | Boolean — gratitude checkbox for that date |
| `habit_{id}_week_{weekStart}` | Array of 7 values — all habit weekly data (morning + keystones + business + secondary + household) |
| `habit_{id}_start` | Number — starting count offset for year total |
| `habits_custom` | JSON `{ added: [...habit objects], deleted: ['id1', ...] }` — user habit customizations |
| `rev_total` | String — manually entered total revenue |
| `rev_templates` | Number — template sale count |
| `rev_subs` | Number — app subscriber count |
| `cal-{layer}-{step}` | Boolean — Cal's framework checkbox state |
| `cal-{layer}-{step}-text` | String — Cal's framework textarea content |
| `grounding_library` | JSON `{active, backlog[], archive[]}` |

---

## Reset Logic

- **Daily (midnight):** no daily resets needed — all items now use the habit week-based system
- **Weekly (Sunday midnight):** habit weekly data uses week-start keys so no explicit reset needed
- **Never resets:** habit year data (via week keys), starting counts, revenue, Cal's framework, grounding library, custom habits

---

## Hard Constraints (do not break these)

- Single HTML file — never split
- No Tailwind, no frameworks, no CDN libraries (except Google Fonts)
- Font: DM Sans only
- Background must remain warm off-white (#F5F0E8) — never dark
- Card style: subtle borders, rounded corners, light shadows
- Tab-based navigation (horizontal tab bar, one tab visible at a time)
- Fully offline — works as `file://` local page
- Mobile responsive (768px + 480px breakpoints)

---

## Revenue Goals (hardcoded context)

| Level | Target | Date |
|-------|--------|------|
| 1 | $3,500/mo | May 2026 |
| 2 | $5,000/mo | Aug 2026 |
| 3 | $10,000/mo | Dec 2026 |
| Final Boss | $25,000/mo | — |
