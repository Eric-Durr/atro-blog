import { Clients, db } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Clients).values([
    { id: 1, name: "Kasim", age: 25, isActive: true },
    { id: 2, name: "Mina", age: 30, isActive: false },
		{ id: 3, name: "Liam", age: 28, isActive: true },
		{ id: 4, name: "Sophia", age: 22, isActive: true },

  ]);

	console.log('Seeding database...');
}
