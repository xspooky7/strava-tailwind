import { Button } from "@/components/ui/button"

export default function KomOverviewPage() {
  return (
    <div className="w-full flex my-10 px-5 justify-evenly">
      <a href="/koms/total">
        <Button className="w-60 h-10 bg-primary text-primary-foreground">Total</Button>
      </a>
      <a href="/koms/delta">
        <Button className="w-60 h-10 bg-secondary text-secondary-foreground">Delta</Button>
      </a>
    </div>
  )
}
