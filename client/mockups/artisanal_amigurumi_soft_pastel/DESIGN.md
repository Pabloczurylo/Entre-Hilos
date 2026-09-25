---
name: Artisanal Amigurumi Soft Pastel
colors:
  surface: '#faf9f7'
  surface-dim: '#dbdad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#524344'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#847374'
  outline-variant: '#d6c2c2'
  surface-tint: '#864f54'
  primary: '#864f54'
  on-primary: '#ffffff'
  primary-container: '#d8959b'
  on-primary-container: '#5e2d33'
  inverse-primary: '#fbb4ba'
  secondary: '#516444'
  on-secondary: '#ffffff'
  secondary-container: '#d1e7be'
  on-secondary-container: '#556848'
  tertiary: '#71585b'
  on-tertiary: '#ffffff'
  tertiary-container: '#bd9fa2'
  on-tertiary-container: '#4c3639'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadc'
  primary-fixed-dim: '#fbb4ba'
  on-primary-fixed: '#360d14'
  on-primary-fixed-variant: '#6b383e'
  secondary-fixed: '#d4e9c0'
  secondary-fixed-dim: '#b8cda6'
  on-secondary-fixed: '#101f06'
  on-secondary-fixed-variant: '#3a4c2e'
  tertiary-fixed: '#fcdadd'
  tertiary-fixed-dim: '#dfbfc2'
  on-tertiary-fixed: '#291719'
  on-tertiary-fixed-variant: '#584144'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
  evergreen: '#344c3d'
  surface-white: '#ffffff'
  card-subtle-border: '#eedddb'
  text-muted: '#627568'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system embodies a warm, tactile, and mindful craft aesthetic, specifically engineered for artisanal crochet and amigurumi inventory management. Rooted in organic calm and studio warmth, it rejects harsh digital tech tropes in favor of an inviting, soft-pastel palette, gentle typographic curves, and cozy surface layering.

The visual style blends **Soft Minimalism** with **Tactile Craft Details**:
- Crisp white content cards resting on calm, warm-clay neutral surfaces (`Mist`).
- Generous internal padding and soft, cloud-like corner geometry (`rounded-xl` to `rounded-2xl`).
- Rejection of pitch black in favor of deep vegetal forest hues (`Evergreen`) to provide high-legibility, high-comfort typography that reduces eye strain during prolonged pattern-tracking or inventory tallying sessions.
- Soft-toned state transitions mirroring tactile yarn finishes: plush pastel roses, gentle muted eucalypts, and velvety clay pinks.

## Colors

The palette draws directly from botanical dyes, soft skeins of spun cotton, and natural wool fibers.

### Roles & Semantic Usage
- **Primary (`#d8959b` - Mauve):** Key call-to-action triggers, active project states ("Tejiendo"), primary action pills, and focus ring accents. Paired with pure `#FFFFFF` for readable button labels.
- **Secondary (`#829672` - Sage):** Secondary button fills, project completion badges ("Terminado"), success notifications, and verified yarn weight counters.
- **Tertiary (`#f2d1d4` - Peony):** Subtle tinted container backgrounds, queued/pending order markers ("Pendiente"), and gentle accent highlights.
- **Neutral (`#f4f3f1` - Mist):** Foundational canvas background color across the application, providing organic warmth over clinical white.
- **Evergreen (`#344c3d`):** Primary typography, structural icon glyphs, side navigation bars, and finalized status markers ("Entregado").
- **Text Muted (`#627568`):** A de-saturated, medium-depth sage-slate used for secondary metadata, pattern stitch notes, dates, and subtle borders.

## Typography

**Plus Jakarta Sans** provides friendly, welcoming geometric architecture with softened terminal terminals and open counters. It marries contemporary clarity with the curved, woven rhythm of handcrafted amigurumi.

### Hierarchy & Legibility Rules
- All headings (`display-lg`, `headline-lg`, `headline-md`) are rendered strictly in `Evergreen` (`#344c3d`) to anchor content with organic weight.
- Regular body prose runs at a comfortable `0.9375rem` (15px) or `1.125rem` (18px) to keep crochet pattern steps, stitch counts, and order timelines readable from arm's-length distances at crafting tables.
- Micro-labels, yarn lot badges, and status pills leverage `label-md` with slight letter spacing (`0.02em`) and medium/semibold weights to ensure crisp rendering at small scale.

## Layout & Spacing

The layout adopts a flexible fluid grid constrained by human-scale maximum widths (1280px for desktop workspaces). A 4px/8px modular base rhythm guarantees rhythmic vertical distribution.

### Screen Adaptations
- **Mobile (< 640px):** 4-column layout with `1rem` outer canvas padding. Cards stretch edge-to-edge within margins to maximize touch surface for counter increments and status updates.
- **Tablet (640px - 1024px):** 8-column layout with `1.5rem` outer canvas margins. Amigurumi production queues flow into responsive 2-column card layouts.
- **Desktop (> 1024px):** 12-column layout with `2.5rem` outer canvas margins and a fixed, calm side-navigation panel (Evergreen-tinted or pure white). Content sections use `space-xl` (32px) and `space-2xl` (48px) gaps to prevent visual clutter.

## Elevation & Depth

This system intentionally bypasses standard cold drop shadows in favor of **Tonal Warmth** and **Ambient Diffuse Glows**.

### Surface Treatment
- **Canvas Base:** Pure `Mist` (`#f4f3f1`).
- **Interactive & Display Cards:** Pure White (`#FFFFFF`) with a 1px structural whisper outline: `border border-[#eedddb]/60`.
- **Card Shadow (Resting):** `0px 4px 20px -2px rgba(52, 76, 61, 0.04), 0px 2px 6px -1px rgba(216, 149, 155, 0.06)`. The double shadow combines a grounding vegetal undertone (`Evergreen`) with a soft rose ambient warmth (`Mauve`).
- **Card Shadow (Hover):** `0px 10px 25px -4px rgba(52, 76, 61, 0.08), 0px 4px 10px -2px rgba(216, 149, 155, 0.12)`, paired with a `translate-y-[-2px]` lift.
- **Modals & Flyouts:** Pure White backed by an `Evergreen` scrim at 30% opacity with `backdrop-blur-sm`.

## Shapes

To mirror the pillowy, curved anatomy of spun yarn and amigurumi plush creations, all corner radii are intentionally soft and organic.

- **Standard Containers & Cards:** Rounded with `rounded-2xl` (1.25rem - 1.5rem) to evoke soft physical craft objects.
- **Form Controls & Inputs:** `rounded-xl` (0.75rem - 1rem), offering welcoming finger-friendly touch targets.
- **Buttons, Badges & Tags:** Fully pill-shaped (`rounded-full`) for quick recognition and playful artisanal warmth.

## Components

### Buttons
- **Primary Button (e.g., "Guardar Pedido", "Nueva Venta"):**
  - Fill: `Mauve` (`#d8959b`), text: pure white (`#FFFFFF`), shape: `rounded-full`.
  - Padding: `0.75rem 1.75rem`, font: `label-lg`.
  - Hover: Background darkens softly to `#c98288` with subtle transform lift.
- **Secondary Button (e.g., "Cancelar", "Volver"):**
  - Fill: Transparent or `Mist` (`#f4f3f1`), border: `1.5px solid #d8959b`, text: `Mauve` (`#d8959b`), shape: `rounded-full`.
  - Hover: Fills with `Peony` (`#f2d1d4`) at 35% opacity.
- **Success / Positive Action Button (e.g., "Marcar Terminado"):**
  - Fill: `Sage` (`#829672`), text: pure white (`#FFFFFF`), shape: `rounded-full`.
  - Hover: Background darkens to `#718562`.

### Status Badges & Chips (Order Tracking)
Pill-shaped badges (`rounded-full`, padding `0.25rem 0.875rem`, `label-md` font weight):
- **Pendiente:** Background `Peony` (`#f2d1d4`), text: `Evergreen` (`#344c3d`).
- **Tejiendo (In Progress):** Background `Mauve` (`#d8959b`), text: `#FFFFFF`.
- **Terminado (Finished):** Background `Sage` (`#829672`), text: `#FFFFFF`.
- **Entregado (Delivered):** Background `Evergreen` (`#344c3d`), text: `#FFFFFF`.

### Cards & Craft Project Tiles
- Background: `#FFFFFF`.
- Border: `1px solid rgba(238, 221, 219, 0.6)`.
- Border radius: `rounded-2xl` (1.25rem).
- Internal spacing: `1.5rem` (`space-lg`).
- Features dedicated slots for amigurumi preview thumbnails with `rounded-xl` image masking.

### Input Fields & Selects
- Surface: `#FFFFFF`.
- Border: `1.5px solid #eedddb`, shape: `rounded-xl`.
- Padding: `0.75rem 1rem`.
- Text color: `Evergreen` (`#344c3d`); placeholder color: `Text Muted` (`#627568`) at 60% opacity.
- Focus state: Border transitions to `Mauve` (`#d8959b`) with a 3px ring of `Peony` (`#f2d1d4`/50%).

### Checkboxes & Radio Buttons
- Box: `rounded-lg` (checkbox) / `rounded-full` (radio).
- Default: Border `1.5px solid #829672` on white.
- Checked: Fill `Sage` (`#829672`) with crisp white micro checkmark.

### Domain-Specific Components (Amigurumi Management)
- **Stitch / Row Counter Control:** Circular floating stepper buttons (`44px x 44px`, `rounded-full`) in `Peony` and `Mauve` framing a bold `headline-md` number.
- **Yarn Skein Color Swatch Pill:** Small circular token (`24px`) displaying exact yarn color alongside lot number in `body-sm`.