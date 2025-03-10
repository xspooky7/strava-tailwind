"use client"

import { login } from "@/app/auth/actions/login"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "react"

export function LoginDrawer() {
  const [state, formLogin, isPending] = useActionState<any, FormData>(login, null)
  const inputClass = state ? "border-destructive" : ""

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="animate-appear text-primary border-primary m-2 md:m-4 lg:m-6" variant="outline">
          Login
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-primary">Login</DrawerTitle>
            <DrawerDescription>Please login to access the application.</DrawerDescription>
          </DrawerHeader>
          <form className="grid gap-4 p-4" action={formLogin}>
            <div className="grid gap-2">
              <Label htmlFor="username">User</Label>
              <Input
                className={inputClass}
                required
                disabled={isPending}
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="username"
                autoCorrect="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                className={inputClass}
                required
                disabled={isPending}
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••"
                autoComplete="current-password"
                autoCorrect="off"
              />
            </div>

            <DrawerFooter className="px-0">
              <Button className="flex items-center justify-center" type="submit" disabled={isPending}>
                Login
                {isPending && <Spinner size={10} />}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
