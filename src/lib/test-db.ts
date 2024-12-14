// src/lib/test-db.ts
import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL);

    await prisma.$connect();
    console.log('✅ Successfully connected to database');

    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Current database:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
