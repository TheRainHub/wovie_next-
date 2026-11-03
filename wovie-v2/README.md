# Wovie

Find a film, keep a watchlist. Wovie is a film catalogue built on [TMDB](https://www.themoviedb.org/): browse what is
popular, see how it is rated, rate it yourself and keep favourites and lists.

Live demo: [wovienext.vercel.app](https://wovienext.vercel.app). The original KAJ semester write-up is in
[docs/kaj.md](docs/kaj.md).

## What it does

- **Catalogue**: the ~300 most popular films on TMDB, stored in Postgres. Sort by popularity, top rated, newest or
  title, filter by genre, search by title. Every filter is part of the URL.
- **Trending**: today's trending films on TMDB, on the home page and at the top of the catalogue.
- **Film pages**: overview, age rating, runtime, cast and crew, trailer and similar films, straight from TMDB.
- **Ratings**: no score in the app is typed by hand. See [How scores are worked out](#how-scores-are-worked-out).
- **Accounts**: email and password. Signed-in people can rate films 1–10, keep favourites and make lists (rename,
  delete, take films off).

Wovie does not stream or sell films. The play buttons start the trailer, which is hosted on YouTube.

## How scores are worked out

| Score | Where it comes from |
|---|---|
| TMDB score and vote count | TMDB's `vote_average` and `vote_count`, refreshed by the catalogue sync. |
| Top rated order | A Bayesian (IMDb-style) average: `v/(v+m)·R + m/(v+m)·C`, where `R` and `v` are the film's score and votes, `C` is the mean score of the catalogue and `m` its median vote count. Recomputed after every sync, so a 9.2 from a dozen votes doesn't outrank an 8.5 from thirty thousand. |
| Wovie rating | The average of what signed-in people on Wovie gave the film, with how many people rated it. Shown only when someone has. |
| Age rating | TMDB's certification for the US, then the UK, then Czechia. Not shown when TMDB has none. |
| "New" badge | Released in the last 90 days. |

The maths lives in `app/lib/ratings.ts` and `app/lib/format.ts` and is unit-tested.

## How the catalogue stays fresh

`app/lib/catalog-sync.ts` copies TMDB's popular list into Postgres: new films get one details request (runtime,
trailer, genres, cast), films already stored get their scores from the list itself, and 40 stored films that have
dropped out of the list are refreshed per run, oldest first. It runs:

- in the background after `/movies` renders, at most once every 6 hours (a row in `CatalogSync` acts as a lock shared
  by all server instances, so visitors never wait for it and TMDB is not called on every visit);
- on demand with `npm run db:sync`.

Film pages, Top rated, New releases and the home page are cached for an hour. What depends on the visitor (their
rating, favourites, lists) is fetched separately, so the cache is the same for everyone.

## Running it locally

Requirements: Node 20+, PostgreSQL, a TMDB API key.

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, TMDB_API_KEY, NEXTAUTH_SECRET
npm run db:migrate          # apply migrations
npm run db:sync             # fill the catalogue from TMDB (about a minute)
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (reads the database for the cached pages) |
| `npm run check` | Type check, lint and unit tests |
| `npm test` | Unit tests (Vitest) |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run db:sync` | Sync the catalogue from TMDB now |

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, NextAuth (credentials, JWT sessions),
Prisma 7 with PostgreSQL (Neon), TMDB API, Vercel. The functions run in `fra1` (`vercel.json`), next to the Neon
database in Frankfurt: every page makes several queries, and from Vercel's default `iad1` each one crossed the Atlantic.

```
app/
├── (main)/          catalogue, film pages, top rated, new releases, profile, lists
├── (auth)/          login and registration forms (shown on the home page)
├── api/             route handlers: catalogue pages, ratings, favourites, lists, sign-up
├── components/      header, footer, poster card, favourite and list controls
└── lib/             TMDB client, catalogue queries and sync, rating maths, auth
prisma/              schema, migrations, seed (= catalogue sync)
proxy.ts             sends signed-out visitors from /profile and /lists to the login form
```

## Not done yet

- Password reset and email verification (needs an email provider).
- Sign-in with Google or another provider.
- Avatars (needs file storage).
- Sharing lists publicly (`Watchlist.isPublic` exists but nothing uses it).
- End-to-end tests.

This product uses the TMDB API but is not endorsed or certified by TMDB.
