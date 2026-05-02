const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create Categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const furniture = await prisma.category.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: { name: 'Furniture' },
  });

  // Create Products
  const products = [
    { name: 'Laptop', price: 999.99, stock: 50, categoryId: electronics.id },
    { name: 'Smartphone', price: 699.99, stock: 100, categoryId: electronics.id },
    { name: 'Desk Chair', price: 199.99, stock: 30, categoryId: furniture.id },
    { name: 'Office Desk', price: 499.99, stock: 20, categoryId: furniture.id },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Create Customers
  const customers = [
    { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' },
  ];

  const createdCustomers = [];
  for (const c of customers) {
    const customer = await prisma.customer.create({ data: c });
    createdCustomers.push(customer);
  }

  // Create some Orders for the last 30 days
  for (let i = 0; i < 20; i++) {
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    const product = (await prisma.product.findMany())[Math.floor(Math.random() * 4)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const total = product.price * quantity;

    await prisma.order.create({
      data: {
        customerId: customer.id,
        total,
        status: 'DELIVERED',
        createdAt: date,
        items: {
          create: {
            productId: product.id,
            quantity,
            price: product.price,
          }
        }
      }
    });

    // Update customer spending
    await prisma.customer.update({
      where: { id: customer.id },
      data: { totalSpending: { increment: total } }
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
