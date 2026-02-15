

# ReliefCoord HQ — Implementation Plan

A disaster relief coordination platform with **3 role-based dashboards** (Admin, Camp Manager, Volunteer), dark mode support, and a polished UI using Google Material Icons and Public Sans font.

---

## Phase 1: Foundation & Theming
- Add **Google Material Icons** and **Public Sans** font to `index.html`
- Configure custom Tailwind colors: `primary` (CSS variable), `background-light/dark`, `card-dark`, `accent-red`, `accent-amber`, `accent-green`
- Create the **types file** with `UserRole` enum and interfaces (`Camp`, `Volunteer`, `InventoryItem`, `ResourceRequest`)

## Phase 2: Core Components
- Port **RoleSwitcher** component — dropdown to switch between Admin, Camp Manager, and Volunteer views
- Port **AdminDashboard** — sidebar navigation with Dashboard, Global Logistics, Camps Management, Volunteer Directory, Resource Inventory, and Settings tabs
- Port **CampManagerDashboard** — top-nav layout with Dashboard, Camps, Logistics, and Settings tabs, including a Delhivery-style shipment tracker
- Port **VolunteerDashboard** — sidebar layout with Field View, Interactive Map, Local Supplies, Inbound Logistics, and Settings

## Phase 3: App Integration
- Update **App.tsx** with role-based routing — render the correct dashboard based on `currentRole` state
- Wire up dark mode toggle across all dashboards
- Ensure all demo data renders correctly with proper styling and animations

## Phase 4: Database Setup (Lovable Cloud)
- Set up **Supabase database** with tables for:
  - `camps` — name, location, capacity, occupancy, status, lead
  - `volunteers` — name, skills, status, zone, hours logged
  - `inventory` — name, category, quantity, unit, min threshold
  - `resource_requests` — requester, resource, quantity, urgency, status, ETA
  - `user_roles` — secure role management (admin, camp_manager, volunteer)
- Add **Row Level Security** policies based on user roles
- Add **authentication** (email/password signup & login)
- Replace demo/hardcoded data with live database queries

