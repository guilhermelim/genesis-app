import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { authDatabase, authMongoClient } from './auth-database'

const vercelURL = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
const baseURL = process.env.BASE_URL || (vercelURL ? `https://${vercelURL}` : 'http://localhost:3000')
const trustedOrigins = [
  ...new Set([baseURL, vercelURL && `https://${vercelURL}`].filter((origin): origin is string => Boolean(origin))),
]
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET must be configured before starting Better Auth')
}

export const auth = betterAuth({
  appName: 'Genesis Servir',
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(authDatabase, {
    client: authMongoClient,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins,
  plugins: [admin(), nextCookies()],
})
