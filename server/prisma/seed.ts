import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_CATEGORIES = [
  'Llaveros',
  'Flores',
  'Amigurumis General',
  'Personajes',
  'Mascotas',
  'Otras',
];

async function main() {
  console.log('Seeding initial categories...');

  for (const name of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Default app configurations
  await prisma.appConfig.upsert({
    where: { key: 'HOURLY_RATE' },
    update: {},
    create: {
      key: 'HOURLY_RATE',
      value: '2500',
      description: 'Valor de la hora de tejido por defecto (ARS)',
    },
  });

  console.log('Initial setup seeded successfully (no mock data).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
