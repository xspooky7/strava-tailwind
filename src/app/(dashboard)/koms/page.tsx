import { Button } from "@/components/ui/button"
import { verifySession } from "@/app/auth/actions/verify-session"

export default async function KomOverviewPage() {
  await verifySession()
  return null
}
