import AppearanceForm from "@/features/settings/appearance/appearance-form"
import ContentSection from "@/features/settings/components/content-section"

export default function AppearanceSettingsPage() {
  return (
    <ContentSection
      title="Appearance"
      desc="Customize the appearance of the app. Automatically switch between day
          and night themes."
    >
      <AppearanceForm />
    </ContentSection>
  )
}
