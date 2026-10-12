import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'Tech & SaaS',
    color: '#6366f1',
    icon: 'Laptop',
    description: 'Cloud infrastructure, software licenses, developer tooling',
    budget: 550000,
    isDefault: true,
  },
  {
    id: 'cat_marketing',
    name: 'Marketing & Ads',
    color: '#f43f5e',
    icon: 'Megaphone',
    description: 'Paid acquisition, design assets, brand sponsorship',
    budget: 680000,
    isDefault: true,
  },
  {
    id: 'cat_travel',
    name: 'Business Travel',
    color: '#0ea5e9',
    icon: 'Plane',
    description: 'Flights, hotel lodging, client on-site visits',
    budget: 380000,
    isDefault: true,
  },
  {
    id: 'cat_office',
    name: 'Office & Facilities',
    color: '#10b981',
    icon: 'Building2',
    description: 'Workspace lease, high-speed fiber, office supplies',
    budget: 290000,
    isDefault: true,
  },
  {
    id: 'cat_client',
    name: 'Client Entertainment',
    color: '#f59e0b',
    icon: 'Wine',
    description: 'Executive dinners, partnership networking events',
    budget: 180000,
    isDefault: true,
  },
  {
    id: 'cat_legal',
    name: 'Legal & Compliance',
    color: '#8b5cf6',
    icon: 'FileText',
    description: 'Corporate filings, audit, patent attorneys',
    budget: 320000,
    isDefault: true,
  },
  {
    id: 'cat_transport',
    name: 'Logistics & Transport',
    color: '#64748b',
    icon: 'Car',
    description: 'Courier services, ground transportation, fuel',
    budget: 95000,
    isDefault: true,
  },
];

async function main() {
  console.log('Seeding default categories into PostgreSQL database...');

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        description: cat.description,
        budget: cat.budget,
        isDefault: cat.isDefault,
      },
    });
  }

  console.log('Categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
