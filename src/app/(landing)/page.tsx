import Image from "next/image"
import Link from "next/link"
import { UserAuthForm } from "./user-auth-form"
import { Icons } from "@/components/icons"

export default function LandingPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="/images/landing-light-1.jpg"
            width={1280}
            height={843}
            alt="Authentication"
            className="block dark:hidden h-full w-full object-cover dark:brightness-[0.5] dark:grayscalde"
          />
          <Image
            src="/images/landing-dark-1.jpg"
            width={1280}
            height={843}
            alt="Authentication"
            className="hidden dark:block h-full w-full object-cover dark:brightness-[0.4] dark:grayscsale"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium text-primary">
          <Icons.logo color="#FFF" className="pr-2" />
          Strava
          <br />
          Tools
        </div>
        <div className="relative z-20 mt-auto"></div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your email and password to log in to your account.</p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
