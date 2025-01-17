import ContentSection from "../components/content-section"
import { DisplayForm } from "./display-form"

export default function SettingsDisplayPage() {
  return (
    <ContentSection title="Display" desc="Turn items on or off to control what's displayed in the app.">
      <DisplayForm />
    </ContentSection>
  )
}