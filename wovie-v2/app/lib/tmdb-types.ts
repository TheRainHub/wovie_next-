// The parts of TMDB v3 responses that Wovie reads.

export interface TMDBMovieListResponse {
  page: number
  total_pages: number
  results: TMDBMovie[]
}

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  release_date: string | null
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBVideo {
  key: string // YouTube video id when site is "YouTube"
  site: string
  type: string // "Trailer", "Teaser", "Clip", ...
  official?: boolean
}

export interface TMDBCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface TMDBCrewMember {
  id: number
  name: string
  job: string
  profile_path: string | null
}

export interface TMDBReleaseDates {
  results: {
    iso_3166_1: string
    release_dates: { certification: string; type: number }[]
  }[]
}

/** /movie/{id} with append_to_response=credits,videos */
export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  original_title: string
  tagline: string | null
  runtime: number | null
  budget: number
  revenue: number
  genres: TMDBGenre[]
  production_countries: { iso_3166_1: string; name: string }[]
  videos: { results: TMDBVideo[] }
  credits: { cast: TMDBCastMember[]; crew: TMDBCrewMember[] }
}

/** /movie/{id} as the film page asks for it */
export interface TMDBFilm extends TMDBMovieDetails {
  similar: { results: TMDBMovie[] }
  images: { logos: { file_path: string }[] }
  release_dates: TMDBReleaseDates
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[]
}
