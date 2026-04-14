# Phase 3: React Frontend — Adversarial Lens Dashboard (Revised)

## Goal
Build a production-quality React frontend using **shadcn/ui + Tailwind CSS + TypeScript + framer-motion**, connecting to the existing FastAPI backend. Includes image upload with automatic resizing, random sample selection from backend, and animated hero with BackgroundPaths.

## Key Changes from v1
- **Stack:** Vanilla CSS → **shadcn/ui + Tailwind CSS**
- **Hero:** Static text → **framer-motion BackgroundPaths** animated component
- **Upload:** Added **automatic image resizing** to 32×32 for non-CIFAR images
- **Samples:** Added **"Random Image" button** that fetches from `GET /api/samples`
- **Components:** Using provided shadcn primitives (Button, Label, Card, Input, Select, Separator)

---

## HCI Principles

| Principle | Application |
|---|---|
| **Progressive Disclosure** | PGD steps input only appears when PGD is selected |
| **Error Prevention** | Compare button disabled until image loaded; auto-resize handles wrong dimensions |
| **Recognition > Recall** | Dropdown for attack type, slider with labeled presets for epsilon |
| **Immediate Feedback** | Loading skeletons, health pulse indicator, animated result cards |
| **Side-by-Side Comparison** | Standard vs Robust in twin cards |

---

## Architecture

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json              # shadcn config
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                # Tailwind directives + dark theme tokens
│   ├── lib/
│   │   └── utils.ts             # cn() helper for shadcn
│   ├── services/
│   │   └── api.ts               # Typed fetch wrappers
│   └── components/
│       ├── ui/                   # shadcn primitives
│       │   ├── button.tsx
│       │   ├── label.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   ├── select.tsx
│       │   ├── separator.tsx
│       │   ├── file-upload.tsx   # Provided upload component (adapted)
│       │   └── background-paths.tsx  # Provided hero animation
│       ├── Navbar.tsx
│       ├── Hero.tsx              # Uses BackgroundPaths
│       ├── UploadSection.tsx     # Upload + config + random sample selector
│       ├── CompareResults.tsx
│       └── ExplainResults.tsx
```

---

## Setup Steps (Sequential)

### 1. Scaffold fresh Vite + React + TS project
Since the existing `frontend/` is incomplete (no package.json, no config files), we'll **delete and re-scaffold** cleanly:
```bash
# From project root
rm -rf frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

### 2. Install Tailwind CSS
```bash
npm install -D tailwindcss @tailwindcss/vite
```

### 3. Install shadcn dependencies
```bash
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator class-variance-authority clsx tailwind-merge
```

### 4. Install animation + icons
```bash
npm install framer-motion lucide-react
```

---

## Proposed Changes

### Config Files

#### [NEW] tailwind.config.ts
- Dark mode: `class`
- Custom colors from Stitch design system mapped to shadcn CSS variables
- Space Grotesk + Inter font families

#### [NEW] components.json
- shadcn config pointing to `@/components/ui`, `@/lib/utils`

#### [MODIFY] vite.config.ts
- Add proxy: `/api` → `http://localhost:8000`
- Add path alias: `@` → `./src`

#### [NEW] src/lib/utils.ts
- `cn()` helper using `clsx` + `tailwind-merge`

#### [NEW] src/index.css
- Tailwind `@import` directives
- CSS variables for dark theme matching Stitch Sentinel Aesthetic:
  - `--background: #0c1324`, `--foreground: #dce1fb`
  - `--primary: #7bd0ff`, `--secondary: #ffb3ad`, `--tertiary: #4edea3`
  - `--card: #191f31`, `--muted: #23293c`

---

### shadcn Primitives (copy-paste from user)

#### [NEW] src/components/ui/button.tsx
#### [NEW] src/components/ui/label.tsx
#### [NEW] src/components/ui/card.tsx
#### [NEW] src/components/ui/input.tsx
#### [NEW] src/components/ui/select.tsx
#### [NEW] src/components/ui/separator.tsx
#### [NEW] src/components/ui/file-upload.tsx
- Adapted from provided `file-upload-1.tsx`
- Modified to accept `onFileSelect` callback
- Adds **client-side canvas resize to 32×32** when image dimensions don't match
- Shows image preview after upload
- Adds **"Random Sample" button** that calls `GET /api/samples` and picks one

#### [NEW] src/components/ui/background-paths.tsx
- Exact copy of provided framer-motion animated paths component
- Used in Hero with title **"Adversarial Lens"**

---

### Application Components

#### [NEW] src/services/api.ts
TypeScript interfaces + fetch functions:
- `checkHealth()` → `GET /api/health`
- `fetchSamples()` → `GET /api/samples`
- `compareModels(req)` → `POST /api/compare`
- `explainModels(req)` → `POST /api/explain`
- Client-side `resizeImageTo32(file: File): Promise<string>` — uses canvas to resize any uploaded image to 32×32 PNG base64

#### [NEW] src/components/Navbar.tsx
- "ADVERSARIAL LENS" wordmark (Space Grotesk, tight letter-spacing)
- Health pulse dot (polls `/api/health` every 10s)
- Dark glassmorphism bar, sticky top

#### [NEW] src/components/Hero.tsx
- Wraps `<BackgroundPaths title="Adversarial Lens" />`
- Customized button text: "Begin Analysis →"
- Scrolls to upload section on click

#### [NEW] src/components/UploadSection.tsx
Main interaction panel with two paths:

**Path A — Upload Custom Image:**
- Uses adapted `FileUpload` component
- On file select: resize to 32×32 via canvas, convert to base64, show preview

**Path B — Random Sample:**
- "Generate Random Sample" button
- Calls `GET /api/samples`, picks random one, displays it
- Each click shuffles to a different sample

**Config Panel:**
- Attack Type: shadcn `<Select>` with FGSM / PGD options
- Epsilon: shadcn `<Input type="range">` with presets (4/255, 8/255, 16/255)
- PGD Steps: shadcn `<Input type="number">` — only visible when PGD selected

**Action Buttons:**
- "⚡ Compare Models" — primary button, calls `/api/compare`
- "🔍 Explain with Grad-CAM" — outline button, calls `/api/explain`
- Both disabled until image is loaded

#### [NEW] src/components/CompareResults.tsx
- Two shadcn `<Card>` side-by-side: Standard vs Robust
- Each shows: clean prediction, adversarial prediction, confidence bars
- Status chip: "SURVIVED" (green) or "BREACHED" (red)
- Attack metadata footer
- Framer-motion fade-in on mount
- Loading skeleton state

#### [NEW] src/components/ExplainResults.tsx
- Three shadcn `<Card>` in a row:
  1. Standard Model — Clean Image heatmap
  2. Standard Model — Adversarial Image heatmap
  3. Robust Model — Adversarial Image heatmap
- Each card shows base64 image + caption
- Framer-motion staggered fade-in
- Loading skeleton state

#### [NEW] src/App.tsx
- Single-page scroll: Navbar → Hero → Upload → Compare → Explain
- State managed at App level via `useState`
- Dark mode class on `<html>` element

#### [NEW] src/main.tsx
- React 18 `createRoot` entry

---

## User Review Required

> [!IMPORTANT]
> **Fresh scaffold:** The existing `frontend/` will be deleted and re-created via `npm create vite@latest`. The current folder only has `node_modules` and `package-lock.json` with no source code, so nothing is lost.

> [!IMPORTANT]
> **Image resizing:** All uploaded images are resized to 32×32 **client-side** using HTML Canvas before sending to the API. This ensures the backend model always receives the correct input dimensions, regardless of what the user uploads.

> [!IMPORTANT]
> **Google Fonts:** Space Grotesk and Inter will be loaded via `<link>` in `index.html` to match the Stitch design system typography.

---

## Verification Plan

### Automated
1. `npm run dev` starts without errors on port 5173
2. Vite proxy forwards `/api/*` to backend on port 8000

### Manual Browser Tests
1. Hero animation renders with flowing paths
2. Upload a large image → verify it auto-resizes to 32×32
3. Click "Random Sample" → verify backend image loads
4. Click "Compare" → verify Standard vs Robust cards render
5. Click "Explain" → verify 3 Grad-CAM heatmaps render
6. Stop backend → verify health dot turns red, error states display
