import ProfileForm from "@/features/settings/(profile)/profile-form"
import ContentSection from "@/features/settings/components/content-section"

export default function SettingsProfilePage() {
  return (
    <ContentSection title="Profile" desc="This is how others will see you on the site.">
      <ProfileForm />
    </ContentSection>
  )
}
