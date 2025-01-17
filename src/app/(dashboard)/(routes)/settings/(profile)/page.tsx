import ContentSection from "../components/content-section"
import ProfileForm from "./profile-form"

export default function SettingsProfilePage() {
  return (
    <ContentSection title="Profile" desc="This is how others will see you on the site.">
      <ProfileForm />
    </ContentSection>
  )
}
