import { z } from 'zod'

const envSchema = z.object({
	DATABASE_URL: z.string(),
	JWT_SECRET_KEY: z.string(),
	API_BASE_URL: z.string().url(),
	AUTH_REDIRECT_URL: z.string().url(),
	SES_ACCESS_KEY_ID: z.string(),
	SES_SECRET_ACCESS_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
