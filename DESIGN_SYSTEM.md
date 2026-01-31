# 🎨 Feldhege.net Design System Specification

> Vollständige Design-Dokumentation für feldhege.net

---

## Markenidentität

Die Website verwendet ein modernes, professionelles Design mit einem markanten Grünton als Markenfarbe. Das Design ist clean, minimalistisch und auf gute Lesbarkeit optimiert.

---

## 🎨 Farbpalette

### Primärfarbe: Feldhege Grün

| Shade | HEX       | Verwendung                          |
|-------|-----------|-------------------------------------|
| 50    | `#f0f9f5` | Hintergrund-Akzente, Hover-States   |
| 100   | `#daf0e8` | Subtile Hintergründe                |
| 200   | `#b5e1d1` | Borders, Dividers                   |
| 300   | `#8ccdb7` | Sekundäre Elemente                  |
| **400** | **`#74BA9B`** | **Primärfarbe (Default)**        |
| 500   | `#5fa384` | Hover-State                         |
| 600   | `#4d8368` | Active/Pressed States               |
| 700   | `#3d6854` | Dunkle Akzente                      |
| 800   | `#2f4f41` | Footer, dunkle Bereiche             |
| 900   | `#1f3329` | Dunkelste Variante                  |

### Alternative: Cambridge Grün

| Shade | HEX       |
|-------|-----------|
| 50    | `#E8F5EA` |
| 100   | `#D1EBD5` |
| 200   | `#A3D7AB` |
| 300   | `#7FB685` |
| **400** | **`#7FB685`** |
| 500   | `#4D9955` |
| 600   | `#3D7A44` |
| 700   | `#2E5B33` |
| 800   | `#1F3D22` |
| 900   | `#0F1E11` |

### Neutrale Farben (Slate-Palette)

| Verwendung        | HEX       | Beschreibung              |
|-------------------|-----------|---------------------------|
| Background Light  | `#f8fafc` | Haupt-Hintergrund         |
| Card Background   | `#ffffff` | Karten-Hintergrund        |
| Border            | `#e2e8f0` | Standard Borders          |
| Text Primary      | `#1e293b` | Überschriften, Body-Text  |
| Text Secondary    | `#64748b` | Subtitles, Meta-Infos     |
| Divider           | `#cbd5e1` | Trennlinien               |
| Background Dark   | `#0f172a` | Dark Mode / Dashboard     |

### Status-Farben

| Status    | HEX       | Tailwind    | Verwendung         |
|-----------|-----------|-------------|--------------------|
| Pending   | `#fbbf24` | yellow-400  | Warten/In Prüfung  |
| Success   | `#10b981` | emerald-500 | Genehmigt/Erfolg   |
| Error     | `#ef4444` | red-500     | Abgelehnt/Fehler   |
| Info      | `#3b82f6` | blue-500    | Veröffentlicht/Info|

### Chart-Farben

| Chart | HSL               | Beschreibung      |
|-------|-------------------|-------------------|
| 1     | `12 76% 61%`      | Orange/Coral      |
| 2     | `173 58% 39%`     | Teal              |
| 3     | `197 37% 24%`     | Deep Blue         |
| 4     | `43 74% 66%`      | Gold              |
| 5     | `27 87% 67%`      | Orange            |

---

## 📝 Typografie

### Schriftart

**Inter** (Google Font)
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

### Schriftgrößen

| Element        | Größe      | Gewicht | Tailwind             |
|----------------|------------|---------|----------------------|
| H1             | 2.5rem     | Bold    | `text-4xl font-bold` |
| H2             | 1.75rem    | Bold    | `text-2xl font-bold` |
| H3             | 1.5rem     | Semibold| `text-xl font-semibold` |
| H4             | 1.125rem   | Semibold| `text-lg font-semibold` |
| Body           | 1rem       | Regular | `text-base`          |
| Small/Meta     | 0.875rem   | Medium  | `text-sm font-medium`|
| Caption        | 0.75rem    | Regular | `text-xs`            |

---

## 📐 Layout & Spacing

### Containerbreiten

| Element       | Breite      |
|---------------|-------------|
| Max Container | 1280px      |
| Content Width | 1024px      |
| Narrow Width  | 768px       |

### Breakpoints

| Name   | Breite  | Verwendung          |
|--------|---------|---------------------|
| sm     | 640px   | Tablets (Portrait)  |
| md     | 768px   | Tablets (Landscape) |
| lg     | 1024px  | Desktop             |
| xl     | 1280px  | Large Desktop       |
| 2xl    | 1440px  | Extra Large         |

### Border Radius

| Variante | Wert                      | CSS Variable    |
|----------|---------------------------|-----------------|
| sm       | calc(0.5rem - 4px) ≈ 4px  | `--radius - 4px`|
| md       | calc(0.5rem - 2px) ≈ 6px  | `--radius - 2px`|
| lg       | 0.5rem = 8px              | `--radius`      |
| xl       | 0.75rem = 12px            | Cards           |

### Standard Padding

| Element     | Wert        |
|-------------|-------------|
| Container   | `1.5rem`    |
| Card        | `2rem`      |
| Buttons     | `1rem 1.5rem` |
| Header      | `1rem`      |

---

## 🧩 Komponenten-Stile

### Cards

```css
background: #ffffff;
border-radius: 0.75rem;
box-shadow: 0 10px 25px rgba(0,0,0,0.1);
padding: 2rem;
border: 1px solid #e2e8f0; /* optional */
```

### Buttons

| Variante    | Background          | Text            | Hover               |
|-------------|---------------------|-----------------|---------------------|
| Primary     | `#74BA9B`           | `#ffffff`       | `#5fa384`           |
| Secondary   | `#f8fafc`           | `#1e293b`       | `#e2e8f0`           |
| Destructive | `hsl(0 84% 60%)`    | `#ffffff`       | Darker variant      |
| Ghost       | transparent         | `#64748b`       | `#f8fafc`           |
| Link        | transparent         | `#74BA9B`       | Underline           |

### Header

```css
position: sticky;
top: 0;
z-index: 50;
background: #ffffff;
border-bottom: 1px solid #e2e8f0;
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
height: 4rem;
```

---

## ✨ Animationen

### Definierte Keyframes

```css
/* Slide Up */
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Accordion */
animation: accordion-down 0.2s ease-out;
animation: accordion-up 0.2s ease-out;
```

### Transitions

- Standard: `transition-all duration-200`
- Colors: `transition-colors duration-150`

---

## 🌓 Dark Mode (CSS Variables)

| Variable              | Light Mode        | Dark Mode         |
|-----------------------|-------------------|-------------------|
| `--background`        | `0 0% 100%`       | `0 0% 100%`       |
| `--foreground`        | `0 0% 3.9%`       | `0 0% 15%`        |
| `--card`              | `0 0% 100%`       | `0 0% 98%`        |
| `--primary`           | `0 0% 9%`         | `137 23% 60%`     |
| `--muted-foreground`  | `0 0% 45.1%`      | `0 0% 45%`        |
| `--ring`              | `0 0% 3.9%`       | `137 23% 60%`     |

---

## 📁 Token Export (Tailwind Config)

```typescript
// tailwind.config.ts
colors: {
  feldhege: {
    DEFAULT: '#74BA9B',
    50: '#f0f9f5',
    100: '#daf0e8',
    200: '#b5e1d1',
    300: '#8ccdb7',
    400: '#74BA9B',
    500: '#5fa384',
    600: '#4d8368',
    700: '#3d6854',
    800: '#2f4f41',
    900: '#1f3329',
  },
  cambridge: {
    DEFAULT: '#7FB685',
    50: '#E8F5EA',
    100: '#D1EBD5',
    200: '#A3D7AB',
    300: '#7FB685',
    400: '#66A86D',
    500: '#4D9955',
    600: '#3D7A44',
    700: '#2E5B33',
    800: '#1F3D22',
    900: '#0F1E11',
  },
}
```

---

## 🖼️ Logo & Assets

| Asset          | Pfad                              |
|----------------|-----------------------------------|
| Logo           | `/feldhe_ge_trans_schmal.png`     |
| Profilbild     | `/Jan26_4_5.png`                  |
| Favicon ICO    | `/favicon/favicon.ico`            |
| Favicon 16px   | `/favicon/favicon-16x16.png`      |
| Favicon 32px   | `/favicon/favicon-32x32.png`      |
| Apple Touch    | `/favicon/apple-touch-icon.png`   |
| Manifest       | `/favicon/site.webmanifest`       |

---

## 📋 Quick Reference

| Aspekt              | Wert                              |
|---------------------|-----------------------------------|
| **Primärfarbe**     | `#74BA9B` (Feldhege Grün)         |
| **Schriftart**      | Inter (Google Font)               |
| **Design-System**   | Tailwind CSS + shadcn/ui          |
| **Stil**            | Modern, Clean, Professionell      |
| **Basis-Farbe**     | Neutral (Slate-Palette)           |
| **Border-Radius**   | 8px Standard, 12px Cards          |
| **Schatten**        | Soft Shadows (0.1 Opacity)        |
| **Max-Width**       | 1280px                            |

---

## 📚 Referenzen

- **Tailwind Config:** `tailwind.config.ts`
- **Global CSS:** `app/globals.css`
- **UI Components:** `components/ui/` (shadcn/ui)
- **shadcn Config:** `components.json`

---

*Zuletzt aktualisiert: Januar 2026*
