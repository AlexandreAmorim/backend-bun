/* eslint-disable drizzle/enforce-delete-with-where */

import { faker } from '@faker-js/faker'
import { authLinks, users } from './schema'
import { db } from './connection'
import chalk from 'chalk'

/**
 * Reset database
 */
await db.delete(authLinks)
await db.delete(users)

console.log(chalk.yellowBright('✔️ Database reset!'))

/**
 * Create candidate
 */
await db
	.insert(users)
	.values([
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			role: 'candidate',
		},
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			role: 'candidate',
		},
	])
	.returning()

console.log(chalk.yellowBright('✔️ Created customers!'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit(0)
