import { z } from 'zod'

const envSchema = z.object({
	DATABASE_URL: z.string().url().min(1),
	JWT_SECRET_KEY: z.string().min(1),
	API_BASE_URL: z.string().url().min(1),
	AUTH_REDIRECT_URL: z.string().url(),
	SES_ACCESS_KEY_ID: z.string().url().min(1),
	SES_SECRET_ACCESS_KEY: z.string().url().min(1),
})

export const env = envSchema.parse(process.env)
