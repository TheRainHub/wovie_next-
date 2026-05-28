# Wovie 🎬

> **Semestrální práce — Tvorba klientských aplikací v JavaScriptu (KAJ)**
> Autor: Mykhailo Plokhin | [GitHub původní verze (ZWA, 1. ročník)](https://github.com/TheRainHub/Wovie) Původní verze tohoto github repo pro historie commitu https://github.com/TheRainHub/wovie_next
>
> 🔗 **Původní Wovie (ZWA, čisté HTML/CSS/JS):** [zwa.toad.cz/~plokhmyk/Wovie/index.php](https://zwa.toad.cz/~plokhmyk/Wovie/index.php)
> 🚀 **Tato verze (Next.js, live demo):** [wovienext.vercel.app](https://wovienext.vercel.app)

---

## Motivace

Tento projekt má svůj příběh.

Na prvním ročníku jsem v předmětu **ZWA** napsal první verzi Wovie — filmový katalog v čistém HTML, CSS a JavaScriptu, bez jediné knihovny třetích stran. Tehdy to bylo pravidlo kurzu: žádné frameworky, žádné npm balíčky, vše od nuly. Bylo to náročné, ale naučilo mě to skutečně rozumět tomu, co se pod kapotou děje.

Po tom kurzu jsem si položil otázku: *jak by stejný projekt vypadal s moderním přístupem — s Reactem, TypeScriptem, hotovými nástroji a bez umělých omezení?*

Tak vznikla tato semestrální práce. Není dokonalá — daleko od ideálu, který mám v hlavě — ale vložil jsem do ní svůj čas, svůj nápad a snahu udělat něco, co je nejen funkční, ale subjektivně i hezké.

---

## Cíl projektu

Moderní filmový portál s kinematografickým UI, kde uživatel může:

- Procházet katalog filmů napojený na TMDB API
- Filtrovat podle žánru (s History API — tlačítka zpět/vpřed fungují)
- Vyhledávat filmy podle názvu
- Na stránce filmu sledovat trailer, automatické video pozadí, obsazení, podobné filmy
- Přidávat filmy do oblíbených a vlastních watchlistů
- Sledovat historii přehrávání v profilu
- Registrovat se a přihlásit přes e-mail nebo OAuth (Google, GitHub)

---

## Technologický stack

| Vrstva | Technologie |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styly | Tailwind CSS v4, CSS proměnné, CSS Nesting |
| Animace | Framer Motion |
| Autentizace | NextAuth.js (credentials + OAuth) |
| Databáze | PostgreSQL + Prisma ORM |
| Filmová data | TMDB API |

---

## Spuštění projektu

```bash
# 1. Instalace závislostí
npm install

# 2. Nastavit proměnné prostředí (.env)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
TMDB_API_KEY="your-tmdb-key"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 3. Migrace databáze
npx prisma migrate dev
npx prisma db seed

# 4. Spuštění dev serveru
npm run dev
```

Otevřít [http://localhost:3000](http://localhost:3000)

---

## Struktura projektu

```
app/
├── (auth)/components/        # LoginForm, RegisterForm, AvatarUpload, AuthInput
├── (main)/
│   ├── movies/               # Katalog + stránka filmu
│   │   └── [id]/components/  # CinematicHero, TrailerPlayer, RatingChart, PosterInfo...
│   ├── profile/              # Profil uživatele
│   ├── top-rated/
│   └── new-releases/
├── api/                      # API routes (auth, movies, favorites, watchlists)
├── components/               # Header, FavoriteButton, OfflineBanner, WatchlistDropdown
└── lib/                      # auth.ts, db.ts, tmdb.ts, MovieModel.ts (OOP)
public/
└── components/
    └── wovie-rating.js       # Web Component
prisma/
└── schema.prisma
```

---

## Splnění hodnotících kritérií

### 📄 Dokumentace
Cíl projektu, popis funkcionality a technický postup jsou popsány v tomto souboru.
Komentáře v kódu jsou průběžně v klíčových souborech.

---

### 🌐 HTML5

**Validita** — Next.js generuje validní HTML5 s `<!DOCTYPE html>` a `<html lang="en">`.

**Sémantické značky** — použity napříč aplikací:
- [`app/(main)/layout.tsx`](app/(main)/layout.tsx) — `<main>`
- [`app/(main)/movies/page.tsx`](app/(main)/movies/page.tsx) — `<main>`, `<section aria-label="...">`, `<article>`
- [`app/(main)/movies/components/HeroBanner.tsx`](app/(main)/movies/components/HeroBanner.tsx) — `<article>`
- [`app/components/Header.tsx`](app/components/Header.tsx) — `<header>`, `<nav>`

**Grafika — SVG:**
- [`app/(auth)/components/AuthInput.tsx`](app/(auth)/components/AuthInput.tsx) — vlastní animovaný SVG lightsaber toggle (hilt, blade, glow filter, `<defs>`, `<feMerge>`)
- [`app/(main)/movies/[id]/components/RatingChart.tsx`](app/(main)/movies/[id]/components/RatingChart.tsx) — kruhový SVG indikátor hodnocení, manipulovaný přes JS

**Grafika — Canvas:**
- [`app/(main)/movies/[id]/hooks/useAccentColor.ts`](app/(main)/movies/[id]/hooks/useAccentColor.ts) — `document.createElement('canvas')` → `getContext('2d')` → `drawImage()` → `getImageData()` → ruční výpočet dominantní barvy posteru

**Média — Audio/Video:**
- [`app/(main)/movies/[id]/components/TrailerPlayer.tsx`](app/(main)/movies/[id]/components/TrailerPlayer.tsx) — YouTube embed (záložka Trailer) + nativní `<video>` s vlastními ovládacími prvky (záložka Demo Clip)

**Formulářové prvky:**
- [`app/(auth)/components/AuthInput.tsx`](app/(auth)/components/AuthInput.tsx) — typy (`email`, `password`, `text`, `checkbox`), `placeholder`, `autoFocus`, `required`, `minLength`
- [`app/(auth)/components/RegisterForm.tsx`](app/(auth)/components/RegisterForm.tsx) — validace v reálném čase (useMemo), indikátor síly hesla
- [`app/(auth)/components/LoginForm.tsx`](app/(auth)/components/LoginForm.tsx)

---

### 🎨 CSS

**Pokročilé selektory** — [`app/globals.css`](app/globals.css) + inline Tailwind:
- `::-webkit-scrollbar-thumb:hover` (pseudo-element + pseudo-třída)
- `has-[[data-saber-ignited=true]]` — CSS `:has()` s atributovým selektorem
- `data-[active]:after:scale-x-100` — Tailwind atributový selektor
- `&:disabled`, `&:active`, `&:hover` v nested CSS

**CSS3 transformace 2D/3D** — [`app/globals.css`](app/globals.css):
```css
.card-3d:hover {
  transform: perspective(800px) rotateY(6deg) rotateX(-3deg) scale(1.04);
}
```
Použito na: [`app/(main)/movies/components/RankedCard.tsx`](app/(main)/movies/components/RankedCard.tsx)

**CSS3 transitions/animations** — [`app/globals.css`](app/globals.css):
- `transition: all 0.3s ease` na `.btn-gradient`
- `animate-spin`, `animate-pulse` (Tailwind keyframes)
- Framer Motion animace v celé aplikaci

**Media queries** — Tailwind breakpointy `sm:`, `md:`, `lg:`, `xl:` ve všech komponentách.

**Nested CSS** — [`app/globals.css`](app/globals.css):
```css
.auth-scroll {
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { &:hover { background: ... } }
}
.btn-gradient {
  &:hover { ... }
  &:disabled { ... }
}
```

---

### ⚙️ JavaScript

**OOP — prototypová dědičnost** — [`app/lib/MovieModel.ts`](app/lib/MovieModel.ts):
```js
function Movie(data) {
  MediaItem.call(this, data)        // volání rodiče
  this.runtime = data.runtime
}
Movie.prototype = Object.create(MediaItem.prototype)
Movie.prototype.constructor = Movie
Movie.prototype.getRuntime = function() { ... }

const Wovie = { createMovie: (data) => new Movie(data) }
```
Použito v: [`RankedCard.tsx`](app/(main)/movies/components/RankedCard.tsx), [`PosterInfo.tsx`](app/(main)/movies/[id]/components/PosterInfo.tsx)

**Použití JS frameworku** — React 19, Next.js 15, Framer Motion, NextAuth.js.

**Pokročilá JS API** — [`app/(auth)/components/AvatarUpload.tsx`](app/(auth)/components/AvatarUpload.tsx):
- **File API** — `FileReader.readAsDataURL()` pro náhled avataru
- **Drag & Drop API** — `dragover`, `dragleave`, `drop` události

[`app/(main)/movies/page.tsx`](app/(main)/movies/page.tsx):
- **LocalStorage** — ukládání posledního navštíveného filmu
- **IntersectionObserver** — nekonečné scrollování katalogu

**Funkční historie (History API)** — [`app/(main)/movies/page.tsx`](app/(main)/movies/page.tsx):
- `window.history.pushState({ genre }, '', url)` při změně žánru
- `window.addEventListener('popstate', ...)` pro tlačítka zpět/vpřed

**Ovládání médií (Media API)** — [`app/(main)/movies/[id]/components/TrailerPlayer.tsx`](app/(main)/movies/[id]/components/TrailerPlayer.tsx):
- `video.play()`, `video.pause()`, `video.muted`, `video.currentTime`
- `video.requestFullscreen()`
- Události: `timeupdate`, `loadedmetadata`, `play`, `pause`, `ended`

**Offline aplikace** — [`app/components/OfflineBanner.tsx`](app/components/OfflineBanner.tsx):
- `navigator.onLine` — čtení stavu při načtení
- `window.addEventListener('online' / 'offline', ...)` — reakce na změnu připojení

**JS práce s SVG** — [`app/(main)/movies/[id]/components/RatingChart.tsx`](app/(main)/movies/[id]/components/RatingChart.tsx):
- `arc.setAttribute('stroke-dasharray', ...)` — animace oblouku přes `requestAnimationFrame`
- `svg.addEventListener('mouseenter', ...)` — události přímo na SVG elementu
- Dynamická změna atributů: `stroke-width`, `opacity` přes `setAttribute`

**Webová komponenta** — [`public/components/wovie-rating.js`](public/components/wovie-rating.js):
```js
class WovieRating extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }) }
  connectedCallback() { this.render() }
}
customElements.define('wovie-rating', WovieRating)
```
Použito v: [`PosterInfo.tsx`](app/(main)/movies/[id]/components/PosterInfo.tsx) jako `<wovie-rating value="8.4" max="10" />`
