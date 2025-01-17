import ContentSection from "../components/content-section"
import { NotificationsForm } from "./notifications-form"

export default function SettingsNotificationsPage() {
  return (
    <ContentSection title="Notifications" desc="Configure how you receive notifications.">
      <NotificationsForm />
    </ContentSection>
  )
}
