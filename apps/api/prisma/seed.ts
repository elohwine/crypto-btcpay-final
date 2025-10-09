import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  await prisma.user.upsert({ where:{ email:'admin@example.com' }, update:{}, create:{ email:'admin@example.com', name:'Admin', password:'changeme' } });
  console.log('seed complete');
}
main().finally(()=>prisma.$disconnect());
