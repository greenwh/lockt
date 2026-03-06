# Lockt Health App — Feature Implementation Prompt

## Context

Lockt is a React app that stores personal health information. It currently has modules for **Health Conditions**, **Health Providers**, **Health Impairments**, and a **Health Journal** — each with CSV import/export capability. The app uses a consistent component structure, routing, and data management pattern across all modules.

**Before writing any code**, read the existing codebase to understand:
1. The routing setup (likely React Router)
2. How existing health modules (conditions, providers, impairments, journal) are structured
3. The data/state management approach (context, Redux, local state, etc.)
4. How CSV import/export currently works
5. The UI component library or styling conventions (Tailwind, MUI, custom CSS, etc.)
6. Any shared layout components (sidebar, nav, headers)

**Match all existing patterns exactly.** These three new features should look and feel like they've always been part of the app.

---

## Feature 1: Medications & Supplements Table

### Purpose
A comprehensive medication and supplement tracker with status tracking, timing schedules, interaction warnings, and CSV import/export (matching the pattern of existing modules).

### Data Model

Each medication/supplement record has these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Medication or supplement name |
| `dose` | string | Yes | Dosage (e.g., "81 mg", "100-200 mg") |
| `frequency` | string | Yes | How often taken (e.g., "Daily", "PRN", "Twice daily") |
| `timing` | string | No | When to take it (e.g., "AM with food", "Bedtime", "PM with dinner") |
| `type` | enum | Yes | One of: `prescription`, `supplement`, `otc` |
| `status` | enum | Yes | One of: `active`, `planned`, `prn`, `not-taking` |
| `purpose` | string | Yes | Why it's taken (e.g., "CV protection", "Statin depletion support") |
| `prescriber` | string | No | Who prescribed/recommended it |
| `interactionNotes` | string | No | Known interactions or warnings |
| `depletionNotes` | string | No | Nutrients this medication depletes |
| `startDate` | date | No | When started or planned to start |
| `notes` | string | No | Additional notes |
| `createdAt` | datetime | Auto | Record creation timestamp |
| `updatedAt` | datetime | Auto | Last update timestamp |

### Pre-loaded Seed Data

When the user first accesses this module (or imports via CSV), populate with these records:

```
Name: Aspirin
Dose: 81 mg
Frequency: Daily
Timing: AM
Type: prescription
Status: active
Purpose: Cardiovascular protection (post-pacemaker)
Prescriber: DRH/VA
Interaction Notes: ⚠️ Antiplatelet triad with turmeric + fish oil — monitor for bleeding signs
Depletion Notes: Iron (GI microbleeding), Folate
Start Date: 2024-10

Name: Metformin HCl
Dose: 500 mg
Frequency: Daily
Timing: AM with food
Type: prescription
Status: active
Purpose: Type 2 Diabetes management
Prescriber: VA
Interaction Notes: Restarted Feb 2026 after d/c in 2025 (A1C rebounded 5.3→5.8 off med)
Depletion Notes: Vitamin B12, Folate — supplement with methylcobalamin + methylfolate
Start Date: 2026-02

Name: Atorvastatin
Dose: 10 mg
Frequency: Daily
Timing: PM
Type: prescription
Status: active
Purpose: Hyperlipidemia / cardiovascular protection
Prescriber: VA
Interaction Notes: Restarted Feb 2026 after d/c in 2025 (LDL rebounded 56→108 off med). Dose review at Aug 2026 follow-up — may need increase to 40mg.
Depletion Notes: CoQ10, Vitamin D, Vitamin K2
Start Date: 2026-02

Name: Albuterol HFA Inhaler
Dose: 90 mcg
Frequency: PRN Q4-6H
Timing: As needed
Type: prescription
Status: prn
Purpose: COPD rescue inhaler
Prescriber: DRH
Interaction Notes: Rescue only — no maintenance inhaler currently prescribed
Depletion Notes: None significant

Name: Famotidine
Dose: 20 mg
Frequency: PRN
Timing: As needed for reflux
Type: prescription
Status: prn
Purpose: GERD / acid reflux
Prescriber: Brett Locke, APRN
Interaction Notes: PRN may be insufficient for documented moderate esophagitis — discuss daily dosing with provider
Depletion Notes: Long-term use can deplete magnesium, B12, calcium, zinc

Name: Methocarbamol
Dose: 750 mg
Frequency: PRN
Timing: As needed for muscle spasm
Type: prescription
Status: not-taking
Purpose: Muscle relaxant / cervical pain
Prescriber: DRH
Interaction Notes: Not actively taking

Name: Tramadol
Dose: 50 mg
Frequency: PRN
Timing: As needed for pain
Type: prescription
Status: not-taking
Purpose: Pain management (cervical)
Prescriber: DRH
Interaction Notes: ⚠️ Opioid — Narcan co-prescribed. CRITICAL: If SSRI/SNRI started for depression, tramadol must be avoided (serotonin syndrome risk)
Depletion Notes: Monitor for constipation

Name: Naloxone (Narcan)
Dose: 4 mg/actuation
Frequency: PRN
Timing: Emergency use only
Type: prescription
Status: not-taking
Purpose: Opioid overdose reversal
Prescriber: VA
Interaction Notes: Co-prescribed with tramadol

Name: Tessalon Perles (Benzonatate)
Dose: 100 mg
Frequency: PRN
Timing: As needed for cough
Type: prescription
Status: not-taking
Purpose: Cough suppressant
Prescriber: DRH

Name: Turmeric (Curcumin)
Dose: 400 mg
Frequency: Daily
Timing: AM with food
Type: supplement
Status: active
Purpose: Anti-inflammatory
Interaction Notes: ⚠️ Antiplatelet effect — additive with aspirin + fish oil (bleeding risk triad)

Name: Multivitamin (Member's Mark Men's 50+)
Dose: 1 tablet
Frequency: Daily
Timing: AM with food
Type: supplement
Status: active
Purpose: General nutrition / foundation supplement

Name: CoQ10 (Ubiquinol preferred)
Dose: 100-200 mg
Frequency: Daily
Timing: AM with food
Type: supplement
Status: planned
Purpose: Statin depletion support; cardiac/mitochondrial energy
Interaction Notes: None significant
Start Date: 2026-02

Name: Vitamin D3
Dose: Per lab level (test Aug 2026)
Frequency: Daily
Timing: AM with food
Type: supplement
Status: planned
Purpose: Statin depletion; bone, immune, mood support
Interaction Notes: Synergistic with K2 and calcium

Name: Vitamin K2 (MK-7)
Dose: 100 mcg
Frequency: Daily
Timing: AM with D3
Type: supplement
Status: planned
Purpose: Directs calcium to bone, prevents arterial calcification
Interaction Notes: Synergistic with D3 + calcium

Name: Methylcobalamin (B12)
Dose: 1,000 mcg
Frequency: Daily
Timing: AM
Type: supplement
Status: planned
Purpose: Metformin depletion; nerve health, cognition, Alzheimer's prevention
Interaction Notes: Request B12 level at Aug 2026 labs

Name: Methylfolate (5-MTHF)
Dose: 400-800 mcg
Frequency: Daily
Timing: AM with B12
Type: supplement
Status: planned
Purpose: Metformin depletion; works synergistically with B12

Name: Calcium Citrate
Dose: 500-600 mg
Frequency: Daily
Timing: AM — separate from magnesium by 2+ hours
Type: supplement
Status: planned
Purpose: Dietary intake ~400-500mg vs target 1,000-1,200mg; 30-pack-year bone risk
Interaction Notes: Citrate form is GERD-friendly. Take separately from magnesium.

Name: Omega-3 Fish Oil (EPA+DHA)
Dose: 2-4g combined EPA+DHA
Frequency: Daily
Timing: PM with dinner
Type: supplement
Status: planned
Purpose: Triglyceride reduction (TGs doubled to 179 off fish oil); HDL support
Interaction Notes: ⚠️ Mild antiplatelet — monitor with aspirin + turmeric (bleeding risk triad)

Name: Magnesium Glycinate
Dose: 200-400 mg
Frequency: Daily
Timing: Bedtime — take 2+ hours after calcium
Type: supplement
Status: planned
Purpose: Sleep quality, glucose metabolism, cardiovascular health, muscle relaxation
Interaction Notes: Glycinate form: well absorbed, calming, GI-gentle
```

### UI Requirements

- **Table view** as the default, sortable by name, type, status
- **Status badges** with color coding: `active` = green, `planned` = blue, `prn` = yellow/amber, `not-taking` = gray
- **Type badges**: `prescription` = one color, `supplement` = another, `otc` = third
- **Interaction warnings** (⚠️) should be visually prominent — show a warning icon on rows that have `interactionNotes` containing "⚠️"
- **Expandable rows** or detail view to see full notes, interaction info, depletion info
- **Filter/toggle** by status and/or type
- **CRUD operations**: Add, edit, delete medications
- **CSV import/export** matching the pattern of existing modules. Export all fields. Import should match on field headers.

### CSV Schema for Import/Export

```
Name,Dose,Frequency,Timing,Type,Status,Purpose,Prescriber,Interaction Notes,Depletion Notes,Start Date,Notes,Created At,Updated At
```

---

## Feature 2: Pacemaker / Device Info Card

### Purpose
A dedicated quick-reference card for implanted device information — the kind of thing needed immediately in an ER or when traveling. Should display critical device parameters at a glance.

### Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceName` | string | Yes | Device name |
| `manufacturer` | string | Yes | Device manufacturer |
| `model` | string | Yes | Model number |
| `serialNumber` | string | Yes | Serial number |
| `deviceType` | string | Yes | Type description |
| `implantDate` | date | Yes | When implanted |
| `implantingPhysician` | string | Yes | Who performed the procedure |
| `implantLocation` | string | Yes | Hospital/facility |
| `indication` | string | Yes | Why it was implanted |
| `pacingMode` | string | Yes | Current pacing mode |
| `lowerRate` | number | Yes | Lower rate limit (bpm) |
| `upperTrackingRate` | number | Yes | Upper tracking rate (bpm) |
| `upperActivityRate` | number | No | Upper activity rate (bpm) |
| `rvThreshold` | string | No | RV pacing threshold |
| `rvSensing` | string | No | RV sensing value |
| `impedance` | string | No | Lead/device impedance |
| `batteryLife` | string | No | Estimated remaining battery |
| `lastCheck` | string | No | Last device check date and result |
| `lastRemoteUpload` | string | No | Last remote monitoring upload |
| `mriCompatible` | boolean | Yes | MRI conditional status |
| `medtronicRep` | string | No | Field rep name |
| `medtronicRepPhone` | string | No | Field rep phone |
| `managingPhysician` | string | No | Current managing physician |
| `managingPhysicianPhone` | string | No | Managing physician phone |
| `notes` | string | No | Additional notes |
| `createdAt` | datetime | Auto | Record creation timestamp |
| `updatedAt` | datetime | Auto | Last update timestamp |

### Pre-loaded Seed Data

```
Device Name: Medtronic Micra AV2
Manufacturer: Medtronic
Model: MC2AVR1
Serial Number: MVD628405E
Device Type: Leadless transcatheter pacemaker with dual chamber pacing algorithm
Implant Date: 2024-10-08
Implanting Physician: B. Kris Mullins, MD
Implant Location: Duncan Regional Hospital, 2621 N Whisenant Dr, Duncan OK 73533
Indication: 3rd-degree AV block (complete heart block), presenting HR 36 bpm
Pacing Mode: VDD
Lower Rate: 60
Upper Tracking Rate: 105
Upper Activity Rate: 120
RV Threshold: 0.38V @ 0.24ms
RV Sensing: 19.1 mV
Impedance: 850 ohms
Battery Life: 10+ years remaining (as of Dec 2024)
Last Check: Dec 2024 — all looked good
Last Remote Upload: Feb 5, 2026 — all parameters normal
MRI Compatible: true (MRI Conditional — check Medtronic guidelines for specific conditions)
Medtronic Rep: Andrew Champagne
Medtronic Rep Phone: (580) 647-0860
Managing Physician: B. Kris Mullins, MD
Managing Physician Phone: (580) 251-6806
Notes: Deployed in right ventricular septum. 2+ tines confirmed via fluoroscopy. No leads — leadless system. Mode Switch: Off.
```

### UI Requirements

- **Card-style layout** — clean, scannable, designed for quick reading in a stressful situation (ER visit)
- **Top section**: Device name, model, serial number — large, prominent font
- **Key parameters section**: Pacing mode, rates, threshold, sensing, impedance — organized in a clean grid
- **Provider contacts section**: Managing physician + phone, Medtronic rep + phone — with tap-to-call on mobile
- **Status section**: Battery life, last check date/result, last remote upload date/result
- **MRI badge**: Prominent visual indicator of MRI conditional status (green badge with checkmark or similar)
- **Implant history section**: Date, physician, facility, indication
- **Notes section**: Expandable for additional details
- **"Show to ER" mode**: A simplified, high-contrast view that shows ONLY the critical info an ER team needs:
  - Device: Medtronic Micra AV2 (MC2AVR1)
  - Serial: MVD628405E
  - Type: Leadless pacemaker
  - Mode: VDD 60-105 bpm
  - Implanted: 10/8/2024
  - Indication: Complete heart block
  - MRI: Conditional
  - Managing MD: Mullins (580) 251-6806
  - Medtronic: Champagne (580) 647-0860
- **Edit capability** for updating parameters after device checks
- **CSV import/export** matching existing module patterns

### CSV Schema for Import/Export

```
Device Name,Manufacturer,Model,Serial Number,Device Type,Implant Date,Implanting Physician,Implant Location,Indication,Pacing Mode,Lower Rate,Upper Tracking Rate,Upper Activity Rate,RV Threshold,RV Sensing,Impedance,Battery Life,Last Check,Last Remote Upload,MRI Compatible,Medtronic Rep,Medtronic Rep Phone,Managing Physician,Managing Physician Phone,Notes,Created At,Updated At
```

---

## Feature 3: Emergency Medical Summary

### Purpose
A comprehensive emergency medical summary that consolidates the most critical health information into one screen. This serves as a digital "wallet card" that can be shown to first responders, ER staff, or any healthcare provider who needs an immediate picture of the patient's medical situation.

### Design Philosophy
This is NOT a data entry module like the others. This is a **read-only dashboard** that **pulls data from other modules** (conditions, medications, device info) and displays it in a prioritized, scannable format optimized for emergency use. It should also have a dedicated page with full detail.

### Data Model

The emergency summary has two categories of data:

**Auto-populated from other modules** (read-only, updates when source data changes):
- Active conditions (from Conditions module)
- Active medications (from Medications module)
- Device info summary (from Device module)

**Manually entered fields specific to this module:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | Yes | Patient full legal name |
| `dateOfBirth` | date | Yes | DOB |
| `age` | number | Auto | Calculated from DOB |
| `bloodType` | string | No | Blood type if known |
| `allergies` | string | Yes | Allergies — "NKA" if none |
| `emergencyContact1Name` | string | Yes | Primary emergency contact |
| `emergencyContact1Relationship` | string | Yes | Relationship |
| `emergencyContact1Phone` | string | Yes | Phone number |
| `emergencyContact2Name` | string | No | Secondary emergency contact |
| `emergencyContact2Relationship` | string | No | Relationship |
| `emergencyContact2Phone` | string | No | Phone number |
| `primaryCarePhysician` | string | Yes | PCP name |
| `primaryCarePhone` | string | Yes | PCP phone |
| `insurancePrimary` | string | No | Primary insurance |
| `insurancePrimaryId` | string | No | Member/policy ID |
| `insuranceSecondary` | string | No | Secondary insurance |
| `insuranceSecondaryId` | string | No | Member/policy ID |
| `advanceDirective` | boolean | No | Has advance directive on file? |
| `advanceDirectiveLocation` | string | No | Where it's stored |
| `dnrStatus` | string | No | DNR/Full Code status |
| `specialInstructions` | string | No | Any special emergency instructions |
| `createdAt` | datetime | Auto | Record creation timestamp |
| `updatedAt` | datetime | Auto | Last update timestamp |

### Pre-loaded Seed Data

```
Full Name: William Harold Green
Date of Birth: 1961-09-10
Blood Type: (unknown — leave blank for user to fill)
Allergies: No Known Allergies (NKA)
Emergency Contact 1 Name: Kay Bowen
Emergency Contact 1 Relationship: (leave blank for user to fill)
Emergency Contact 1 Phone: (leave blank for user to fill)
Primary Care Physician: Christopher Herndon, MD (Civilian) / Chris Taylor (VA)
Primary Care Phone: 580-252-6080 (Herndon)
Insurance Primary: TRICARE
Insurance Primary ID: (leave blank for user to fill)
Insurance Secondary: VA Healthcare
Insurance Secondary ID: (leave blank for user to fill)
Advance Directive: (leave blank for user to fill)
DNR Status: (leave blank for user to fill)
Special Instructions: PACEMAKER PATIENT — Medtronic Micra AV2 leadless pacemaker. MRI Conditional. No external defibrillator pads over device. Contact Medtronic rep Andrew Champagne at (580) 647-0860 for device interrogation support.
```

### UI Requirements

#### Quick-Access Modal/Overlay
- **Triggered by** a persistent floating button, prominent icon in the nav/header, or keyboard shortcut — something accessible from ANY screen in the app
- **Visual style**: High contrast, large text, dark background with white/bright text (designed for quick reading under stress)
- **Content priority** (top to bottom):
  1. **Name & DOB** — large, top of card
  2. **Allergies** — RED banner if allergies exist, GREEN "NKA" badge if none
  3. **Implanted Device** — pacemaker summary line (pulled from Device module)
  4. **Active Medications** — list of active + PRN medications with doses (pulled from Medications module, filtered to `active` and `prn` status only)
  5. **Critical Conditions** — top 5-6 most important active conditions (heart block, T2DM, COPD, hypertension, CKD, GERD)
  6. **Emergency Contacts** — name + phone with tap-to-call
  7. **PCP** — name + phone with tap-to-call
  8. **Insurance** — carrier + ID
- **"Show to ER" button** on the modal that goes full-screen, locks orientation (if mobile), and maximizes text size

#### Dedicated Page
- Everything from the modal, plus:
  - Full conditions list (not just top 6)
  - Full medication details including interaction warnings
  - Device parameters detail
  - Insurance information
  - Advance directive status
  - Special instructions
  - Edit capability for the manually-entered fields
- **Print-friendly CSS** so it can be printed as a paper backup
- **CSV export** of the manually-entered fields (the auto-populated data is exported from their respective modules)

### CSV Schema for Import/Export (manual fields only)

```
Full Name,Date of Birth,Blood Type,Allergies,Emergency Contact 1 Name,Emergency Contact 1 Relationship,Emergency Contact 1 Phone,Emergency Contact 2 Name,Emergency Contact 2 Relationship,Emergency Contact 2 Phone,Primary Care Physician,Primary Care Phone,Insurance Primary,Insurance Primary ID,Insurance Secondary,Insurance Secondary ID,Advance Directive,Advance Directive Location,DNR Status,Special Instructions,Created At,Updated At
```

---

## Implementation Notes

### Routing
Add routes for all three features following the existing routing pattern. Suggested paths (adjust to match existing conventions):
- `/health/medications` — Medications & Supplements
- `/health/device` — Pacemaker / Device Info
- `/health/emergency` — Emergency Medical Summary

### Navigation
Add entries to the existing sidebar/nav following the same pattern as Conditions, Providers, Impairments, Journal. Suggested nav labels:
- 💊 Medications
- 🫀 Device Info (or "Pacemaker")
- 🚨 Emergency Card

The Emergency Card should also have a **persistent quick-launch button** visible from all health screens — a floating action button, header icon, or similar pattern.

### CSV Import/Export
Follow the exact same pattern used by existing modules. Each new module should have its own import/export functionality. Ensure:
- Export generates a properly formatted CSV with all fields
- Import parses the CSV and creates/updates records
- Column headers match the field names exactly
- Date fields use ISO format on export
- Handle commas in field values (proper CSV quoting)

### Seed Data Loading
On first access to each module (when no data exists), offer to load the seed data provided above. This could be:
- An automatic load with a "Data pre-loaded from your health profile" toast notification
- A "Load default data?" prompt
- Match whatever pattern existing modules use for initial state

### General
- All three features should be fully responsive (desktop + mobile)
- Follow existing code conventions for component structure, naming, state management
- Include proper TypeScript types if the project uses TypeScript
- Add any necessary dependencies to package.json

---

## Priority Order

Implement in this order:
1. **Medications & Supplements** (most data, highest daily utility)
2. **Pacemaker / Device Info Card** (critical reference, moderate complexity)
3. **Emergency Medical Summary** (depends on the other two for auto-populated data)
