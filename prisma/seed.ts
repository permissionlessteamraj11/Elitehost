import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Seed Plans
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 99,
      ram_mb: 128,
      cpu_percent: 0.05,
      storage_gb: 1,
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 299,
      ram_mb: 512,
      cpu_percent: 0.20,
      storage_gb: 5,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 599,
      ram_mb: 1024,
      cpu_percent: 0.40,
      storage_gb: 10,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  // Seed Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@elitehost.in' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@elitehost.in',
      password: adminPassword,
      role: 'ADMIN',
      credits: 9999
    }
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
