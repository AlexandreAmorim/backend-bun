import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

import { sendAuthLink } from './routes/send-auth-link'
import { getProfile } from './routes/get-profile'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { auth } from './auth'
import { signOut } from './routes/sign-out'
import { createUser } from './routes/create-user'

const app = new Elysia()
	.use(
		cors({
			credentials: true,
			allowedHeaders: ['content-type'],
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
			origin: (request): boolean => {
				const origin = request.headers.get('origin')

				if (!origin) {
					return false
				}

				return true
			},
		}),
	)
	.use(auth)
	.use(signOut)
	.use(createUser)
	.use(sendAuthLink)
	.use(authenticateFromLink)
	.use(getProfile)
	.onError(({ code, error, set }) => {
		switch (code) {
			case 'VALIDATION': {
				set.status = error.status

				return error.toResponse()
			}
			case 'NOT_FOUND': {
				return new Response(null, { status: 404 })
			}
			default: {
				console.error(error)
				return new Response(null, { status: 500 })
			}
		}
	})

app.listen(3333, () => {
	console.log(
		`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
	)
})
