import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { auth } from '../auth'
import dayjs from 'dayjs'
import { authLinks } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const authenticateFromLink = new Elysia().use(auth).get(
	'/auth-links/authenticate',
	async ({ query, signUser, redirect }) => {
		const { code, redirecturl } = query

		const authLinkFromCode = await db.query.authLinks.findFirst({
			where(fields, { eq }) {
				return eq(fields.code, code)
			},
		})

		if (!authLinkFromCode) {
			throw new Error('Auth link not found.')
		}

		const daysSinceAuthLinkWasCreated = dayjs().diff(
			authLinkFromCode.createdAt,
			'days',
		)

		if (daysSinceAuthLinkWasCreated > 7) {
			throw new Error('Auth link expired, please generate a new one.')
		}

		await signUser({
			sub: authLinkFromCode.userId,
		})

		await db.delete(authLinks).where(eq(authLinks.code, code))

		return redirect(redirecturl)
	},
	{
		query: t.Object({
			code: t.String(),
			redirecturl: t.String(),
		}),
	},
)
