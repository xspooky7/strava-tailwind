import { SessionOptions } from "iron-session"

export interface SessionData {
  username?: string
  name?: string
  pfpUrl?: string
  userId?: string
  athleteId?: string
  pbAuth?: string
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "st-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV! === "production",
    maxAge: 1209600, // 2 weeks
  },
}

export const defaultSession: SessionData = {
  username: "",
  isLoggedIn: false,
}
