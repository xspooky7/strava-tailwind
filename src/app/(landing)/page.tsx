import { ContactSection } from "@/features/hero/contact-section"
import { HeroSection } from "@/features/hero/hero-section"
import { LoginDrawer } from "@/features/hero/login-drawer"

export default function LandingPage() {
  return (
    <>
      <div className="flex w-full justify-end">
        <LoginDrawer />
      </div>
      <HeroSection />
      <ContactSection />
    </>
  )
}
