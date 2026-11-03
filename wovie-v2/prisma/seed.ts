// Fills (or refreshes) the catalogue from TMDB: `npx prisma db seed`.
// The same sync also runs on its own after the catalogue page renders.
import 'dotenv/config'
import { syncCatalog } from '../app/lib/catalog-sync'
import { prisma } from '../app/lib/db'

async function main() {
  console.log('Syncing the catalogue from TMDB…')
  const result = await syncCatalog({ force: true })
  if (!result) {
    console.log('Another sync is running or this one failed; see the log above.')
    process.exitCode = 1
    return
  }
  console.log(
    `Done: ${result.added} added, ${result.refreshed} refreshed, ${result.failed} failed, ${result.total} films in total.`,
  )
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
