"use client"

import { useActionState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MailCheckIcon, MailWarningIcon, SendIcon } from "lucide-react"
import Link from "next/link"
import { sendEmail } from "./server/contact-email"
import { Spinner } from "@/components/spinner"

const formSchema = z.object({
  name: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export function ContactSection() {
  const currentYear = new Date().getFullYear()

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const validated = formSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
      })

      await sendEmail({
        email: validated.email,
        username: validated.name,
        text: validated.message,
      })

      return { success: true, message: "Message sent successfully!" }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          errors: error.flatten().fieldErrors,
        }
      }
      return { error: "Failed to send message" }
    }
  }, null)

  let sendButton = (
    <Button
      variant="outline"
      type="submit"
      className="w-full hover:bg-primary hover:text-card bg-card border-primary text-primary md:w-auto flex justify-center items-center"
    >
      Send
      <SendIcon size={13} />
    </Button>
  )
  if (isPending)
    sendButton = (
      <Button
        variant="outline"
        type="submit"
        className="w-full bg-card border-primary text-primary md:w-auto flex justify-center items-center"
        disabled
      >
        Sending
        <Spinner size={13} />
      </Button>
    )
  else if (state?.success)
    sendButton = (
      <div className="gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 w-full rounded-m bg-card border border-success text-success md:w-fit flex justify-center items-center">
        Success
        <MailCheckIcon size={13} />
      </div>
    )
  else if (state?.error)
    sendButton = (
      <div className="gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 w-full rounded-m bg-card border border-destructive text-destructive md:w-fit flex justify-center items-center">
        Error
        <MailWarningIcon size={13} />
      </div>
    )

  return (
    <section id="contact" className="mx-5 mb-5 border-card rounded-xl p-8 md:px-20 mt-20 bg-card">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8 order-2 md:order-1">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">KomQuest (tbd)</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/about-us" className="text-muted-foreground hover:text-primary">
                About Us
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
          <div className="text-sm text-muted-foreground">&copy; {currentYear} KomQuest(tbd). All rights reserved.</div>
        </div>

        <div className="space-y-4 order-1 md:order-2">
          <h4 className="text-lg font-semibold text-primary">Request App access</h4>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Input className="border-muted" id="name" name="name" placeholder="Enter your strava username" />
              {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}

              <Input className="border-muted" id="email" name="email" type="email" placeholder="Enter your email" />
              {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}

              <Textarea
                id="message"
                name="message"
                placeholder="Describe your usecase"
                className="border-muted min-h-[100px]"
              />
              {state?.errors?.message && <p className="text-sm text-red-500">{state.errors.message[0]}</p>}

              {sendButton}

              {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
