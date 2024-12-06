import { checkAuth } from "@/auth/actions"

const DashboradPage = async () => {
  const session = await checkAuth()
  return <div>Dashboard</div>
}

export default DashboradPage
