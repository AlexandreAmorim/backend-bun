import { users } from '../../db/schema'
import { db } from '../../db/connection'
import Elysia from 'elysia'
import { z } from 'zod'

const registerBodySchema = z.object({
	name: z.string().min(1),
	phone: z.string(),
	email: z.string().email(),
})

export const createUser = new Elysia().post('/users', async ({ body, set }) => {
	const { name, phone, email } = registerBodySchema.parse(body)

	const user = await db.query.users.findFirst({
		where(fields, { eq }) {
			return eq(fields.email, email)
		},
	})

	if (user) {
		throw new Error('E-mail consta como já cadastrado')
	}

	await db.insert(users).values({
		name,
		email,
		phone,
	})

	set.status = 204
})
