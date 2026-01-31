import { auth } from "@/lib/auth"
import { HomeGuest } from "./home-guest"
import { HomeAuthenticated } from "./home-authenticated"

export async function HomeContent() {
  const session = await auth()

  if (session?.user) {
    return <HomeAuthenticated session={session} />
  }

  return <HomeGuest />
}
