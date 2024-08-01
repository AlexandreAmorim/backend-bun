import Elysia, { t } from 'elysia'
import nodemailer from 'nodemailer'
import * as aws from '@aws-sdk/client-ses'
import { db } from '../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLinks } from '../../db/schema'
import { env } from '../../env'
//import { mail } from '../../lib/mail'
import { render } from '@react-email/components'
import { AuthenticationMagicLinkTemplate } from '../../lib/templates/authentication-magic-link'

export const sendAuthLink = new Elysia().post(
	'/authenticate',
	async ({ body }) => {
		const { email } = body

		const userFromEmail = await db.query.users.findFirst({
			where(fields, { eq }) {
				return eq(fields.email, email)
			},
		})

		if (!userFromEmail) {
			throw new Error('User not found')
		}

		const authLinkCode = createId()

		await db.insert(authLinks).values({
			userId: userFromEmail.id,
			code: authLinkCode,
		})

		const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

		authLink.searchParams.set('code', authLinkCode)
		//authLink.searchParams.set('redirecturl', env.AUTH_REDIRECT_URL)

		const ses = new aws.SES({
			apiVersion: '2024-08-05',
			region: env.SES_REGION, // Your region will need to be updated
			credentials: {
				accessKeyId: env.SES_ACCESS_KEY_ID,
				secretAccessKey: env.SES_SECRET_ACCESS_KEY,
			},
		})

		const transporter = nodemailer.createTransport({
			SES: { ses, aws },
		})

		const emailHtml = render(
			AuthenticationMagicLinkTemplate({
				userEmail: email,
				authLink: authLink.toString(),
			}),
		)
		transporter.sendMail({
			from: {
				name: 'Hórus Web',
				address: env.MAIL_FROM,
			},
			to: email,
			subject: 'Autenticação - Hórus',
			html: emailHtml,
		})

		/*
		const emailHtml = render(
			AuthenticationMagicLinkTemplate({
				userEmail: email,
				authLink: authLink.toString(),
			}),
		)
		const info = await mail.sendMail({
			from: {
				name: 'Horus Web',
				address: env.MAIL_FROM,
			},
			to: email,
			subject: 'Autenticação - Hórus',
			html: emailHtml,
		})

		console.log(nodemailer.getTestMessageUrl(info))
		*/
	},
	{
		body: t.Object({
			email: t.String({ format: 'email' }),
		}),
	},
)
