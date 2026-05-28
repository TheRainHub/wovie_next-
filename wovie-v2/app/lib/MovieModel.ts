/**
 * MovieModel.ts
 * OOP-модуль с прототипным наследованием (без ES6 class).
 * Иерархия: MediaItem → Movie
 * Пространство имён: Wovie
 */

// ─────────────────────────────────────────────
// Базовый конструктор: MediaItem
// ─────────────────────────────────────────────

interface MediaItemData {
  id: number
  title: string
  vote_average?: number
  rating?: number
  posterUrl?: string | null
  poster_path?: string | null
}

function MediaItem(this: any, data: MediaItemData) {
  this.id = data.id
  this.title = data.title
  this.rating = data.vote_average ?? data.rating ?? 0
  this.posterUrl = data.posterUrl ?? (data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : null)
}

/** Возвращает количество звёзд (1–5) на основе рейтинга 0–10 */
MediaItem.prototype.getStars = function (): number {
  return Math.round(this.rating / 2)
}

/** Топовый контент: рейтинг ≥ 8 */
MediaItem.prototype.isTopRated = function (): boolean {
  return this.rating >= 8
}

/** Форматированный рейтинг, например "8.4" */
MediaItem.prototype.formatRating = function (): string {
  return this.rating.toFixed(1)
}

// ─────────────────────────────────────────────
// Наследник: Movie
// ─────────────────────────────────────────────

interface MovieData extends MediaItemData {
  runtime?: number | null
  release_date?: string | null
  releaseDate?: Date | string | null
  genres?: Array<{ id?: number; name?: string; genre?: { name: string } }>
  overview?: string | null
  description?: string | null
  backdropUrl?: string | null
  backdrop_path?: string | null
}

function Movie(this: any, data: MovieData) {
  // Вызов родительского конструктора
  MediaItem.call(this, data)

  this.runtime = data.runtime ?? 0
  this.overview = data.overview ?? data.description ?? ''
  this.releaseDate = data.release_date ?? data.releaseDate ?? null
  this.backdropUrl = data.backdropUrl ?? (data.backdrop_path
    ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
    : null)

  // Нормализуем жанры из обоих форматов (TMDB и DB)
  this.genres = (data.genres ?? []).map((g: any) => ({
    id: g.id ?? g.genre?.id,
    name: g.name ?? g.genre?.name ?? '',
  }))
}

// Установка цепочки прототипов
Movie.prototype = Object.create(MediaItem.prototype)
Movie.prototype.constructor = Movie

/** Форматированная продолжительность: "2h 15min" */
Movie.prototype.getRuntime = function (): string {
  if (!this.runtime) return ''
  const h = Math.floor(this.runtime / 60)
  const m = this.runtime % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

/** Год выхода */
Movie.prototype.getYear = function (): string {
  if (!this.releaseDate) return ''
  return new Date(this.releaseDate).getFullYear().toString()
}

/** Жанры через запятую */
Movie.prototype.getGenreNames = function (): string {
  return this.genres.map((g: any) => g.name).join(', ')
}

/** Новинка: год выхода ≥ текущего года */
Movie.prototype.isNew = function (): boolean {
  const year = this.getYear()
  return year ? parseInt(year) >= new Date().getFullYear() : false
}

/** Краткое описание (обрезает до maxLength символов) */
Movie.prototype.getShortOverview = function (maxLength = 150): string {
  if (!this.overview) return ''
  return this.overview.length > maxLength
    ? this.overview.slice(0, maxLength).trimEnd() + '…'
    : this.overview
}

// ─────────────────────────────────────────────
// Пространство имён Wovie
// ─────────────────────────────────────────────

const Wovie = {
  MediaItem: MediaItem as unknown as new (data: MediaItemData) => any,
  Movie: Movie as unknown as new (data: MovieData) => any,

  /** Фабричный метод — создаёт Movie из любого формата данных */
  createMovie(data: MovieData) {
    return new (Movie as any)(data)
  },

  /** Создаёт массив Movie из массива данных */
  createMovies(items: MovieData[]) {
    return items.map((data) => new (Movie as any)(data))
  },
}

export default Wovie
export { MediaItem, Movie }
export type { MediaItemData, MovieData }
