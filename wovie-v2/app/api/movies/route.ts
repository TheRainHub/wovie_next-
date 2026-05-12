import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const genreId = searchParams.get("genre");
    const sort = searchParams.get("sort") || "rating";

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (genreId) {
      whereClause.genres = {
        some: { genreId: parseInt(genreId) }
      };
    }

    const orderBy: any =
      sort === "date" ? { releaseDate: "desc" } :
      sort === "title" ? { title: "asc" } :
      { rating: "desc" };

    const [moviesData, total] = await Promise.all([
      prisma.movie.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: { include: { genre: true } },
          ...(userId ? { favorites: { where: { userId } } } : {})
        }
      }),
      prisma.movie.count({ where: whereClause })
    ]);

    const movies = moviesData.map((m: any) => {
      const { favorites, ...rest } = m;
      return {
        ...rest,
        isFavorite: favorites ? favorites.length > 0 : false
      };
    });

    return NextResponse.json({
      movies,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: skip + movies.length < total
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
