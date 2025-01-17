import ContentSection from "../components/content-section"
import SettingsAccountForm from "./account-form"

export default function AccountSettingsPage() {
  return (
    <ContentSection
      title="Account"
      desc="Update your account settings. Set your preferred language and
          timezone."
    >
      <SettingsAccountForm />
    </ContentSection>
  )
}
