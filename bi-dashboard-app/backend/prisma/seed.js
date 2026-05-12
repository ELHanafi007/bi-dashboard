const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding database with Enterprise-Grade Mock Data...');

  // 0. Get all organizations
  const allOrgs = await prisma.organization.findMany();
  
  if (allOrgs.length === 0) {
    console.log('No organizations found. Please register an account first.');
    return;
  }

  for (const org of allOrgs) {
    console.log(`Seeding data for organization: ${org.name} (${org.id})`);
    
    // Clear Existing Data for this org
    await prisma.orderItem.deleteMany({ where: { organizationId: org.id } });
    await prisma.order.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
    await prisma.customer.deleteMany({ where: { organizationId: org.id } });
    await prisma.category.deleteMany({ where: { organizationId: org.id } });
    
    // 3. Create Categories
    const categoriesData = [
      { name: 'Hardware & Tech' },
      { name: 'Office Furniture' },
      { name: 'Cloud Services' },
      { name: 'Marketing & Media' },
      { name: 'Logistics & Supply' },
      { name: 'Maintenance' },
      { name: 'Human Resources' }
    ];

    const categories = [];
    for (const catData of categoriesData) {
      const cat = await prisma.category.upsert({
        where: { name_organizationId: { name: catData.name, organizationId: org.id } },
        update: {},
        create: { name: catData.name, organizationId: org.id },
      });
      categories.push(cat);
    }

    // 4. Create Products
    const productsData = [
      // Tech
      { name: 'MacBook Pro M3 Max', price: 34500, stock: 12, categoryId: categories[0].id, description: 'High-performance workstation for developers.', image: 'https://images.unsplash.com/photo-1517336714460-4c50d91c035d?w=800&q=80' },
      { name: 'Logitech MX Master 3S', price: 1200, stock: 45, categoryId: categories[0].id, description: 'Ergonomic wireless mouse.', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80' },
      
      // Furniture
      { name: 'Herman Miller Aeron', price: 18500, stock: 15, categoryId: categories[1].id, description: 'Iconic ergonomic office chair.', image: 'https://images.unsplash.com/photo-1505797149-35ebcb05a6fd?w=800&q=80' },
      { name: 'Tapis Berbère (2x3m)', price: 4200, stock: 10, categoryId: categories[1].id, description: 'Authentic hand-woven Berber rug from the Atlas mountains.', image: 'https://images.unsplash.com/photo-1579650454664-aa94e1374567?w=800&q=80' },
      
      // Cloud
      { name: 'CyberSecurity Pack Pro', price: 8500, stock: 100, categoryId: categories[2].id, description: 'Endpoint protection and threat monitoring.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },

      // Local Specialties
      { name: 'Huile d\'Argan Bio (1L)', price: 450, stock: 200, categoryId: categories[4].id, description: 'Pure organic Argan oil for culinary use.', image: 'https://images.unsplash.com/photo-1610485299976-1d2110c7336b?w=800&q=80' },
      { name: 'Coffret Zellige Artisanal', price: 1800, stock: 50, categoryId: categories[4].id, description: 'Traditional Moroccan tile mosaic set.', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80' },
      { name: 'Théière Marocaine Royale', price: 650, stock: 35, categoryId: categories[4].id, description: 'Large silver plated traditional teapot.', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80' },

      // Logistics
      { name: 'Transport Casablanca-Marrakech', price: 2500, stock: 999, categoryId: categories[4].id, description: 'Full truck load freight service.', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80' }
    ];

    const createdProducts = [];
    for (const p of productsData) {
      const product = await prisma.product.create({ 
        data: { ...p, organizationId: org.id } 
      });
      createdProducts.push(product);
    }

    // 5. Create 30 Authentic Moroccan Customers + VIP Nadia Kwiatkowska
    const customersData = [
      { name: 'Nadia Kwiatkowska', email: `nadia.k@vip.com`, phone: '0661998877', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
      { name: 'Mohamed Bennani', email: `m.bennani@atlas.ma`, phone: '0661223344', avatar: 'https://i.pravatar.cc/150?u=1' },
      { name: 'Fatima-Zahra Alaoui', email: `f.alaoui@casablanca.ma`, phone: '0661556677', avatar: 'https://i.pravatar.cc/150?u=2' },
      { name: 'Yassine El Moudene', email: `y.moudene@tech.ma`, phone: '0661889900', avatar: 'https://i.pravatar.cc/150?u=3' },
      { name: 'Leila Chaoui', email: `l.chaoui@fashion.ma`, phone: '0661112233', avatar: 'https://i.pravatar.cc/150?u=4' },
      { name: 'Omar Tazi', email: `o.tazi@finance.ma`, phone: '0661445566', avatar: 'https://i.pravatar.cc/150?u=5' },
      { name: 'Sanaa Idrissi', email: `s.idrissi@design.ma`, phone: '0661778899', avatar: 'https://i.pravatar.cc/150?u=6' },
      { name: 'Mehdi Amrani', email: `m.amrani@logistics.ma`, phone: '0662334455', avatar: 'https://i.pravatar.cc/150?u=7' },
      { name: 'Hiba Mansouri', email: `h.mansouri@agency.ma`, phone: '0662667788', avatar: 'https://i.pravatar.cc/150?u=8' },
      { name: 'Anas Filali', email: `a.filali@build.ma`, phone: '0662990011', avatar: 'https://i.pravatar.cc/150?u=9' },
      { name: 'Salma Benjelloun', email: `s.benjelloun@legal.ma`, phone: '0662223344', avatar: 'https://i.pravatar.cc/150?u=10' },
      { name: 'Karim Laraki', email: `k.laraki@trade.ma`, phone: '0663445566', avatar: 'https://i.pravatar.cc/150?u=11' },
      { name: 'Zineb Guedira', email: `z.guedira@media.ma`, phone: '0663778899', avatar: 'https://i.pravatar.cc/150?u=12' },
      { name: 'Amine Jabri', email: `a.jabri@cloud.ma`, phone: '0663112233', avatar: 'https://i.pravatar.cc/150?u=13' },
      { name: 'Nadia Sijilmassi', email: `n.sijilmassi@art.ma`, phone: '0663445566', avatar: 'https://i.pravatar.cc/150?u=14' },
      { name: 'Rachid Berrada', email: `r.berrada@const.ma`, phone: '0663778899', avatar: 'https://i.pravatar.cc/150?u=15' },
      { name: 'Youssef El Fassi', email: `y.fassi@export.ma`, phone: '0664556677', avatar: 'https://i.pravatar.cc/150?u=16' },
      { name: 'Ghita Chraibi', email: `g.chraibi@pharma.ma`, phone: '0664889900', avatar: 'https://i.pravatar.cc/150?u=17' },
      { name: 'Othmane Lamrani', email: `o.lamrani@energy.ma`, phone: '0664112233', avatar: 'https://i.pravatar.cc/150?u=18' },
      { name: 'Meryem Zniber', email: `m.zniber@agro.ma`, phone: '0664445566', avatar: 'https://i.pravatar.cc/150?u=19' },
      { name: 'Adnane Belkhayat', email: `a.belkhayat@invest.ma`, phone: '0664778899', avatar: 'https://i.pravatar.cc/150?u=20' },
      { name: 'Kenza Sabiri', email: `k.sabiri@boutique.ma`, phone: '0665112233', avatar: 'https://i.pravatar.cc/150?u=21' },
      { name: 'Soufiane El Bahri', email: `s.bahri@press.ma`, phone: '0665445566', avatar: 'https://i.pravatar.cc/150?u=22' },
      { name: 'Najat Aatabou', email: `n.aatabou@music.ma`, phone: '0665778899', avatar: 'https://i.pravatar.cc/150?u=23' },
      { name: 'Hamza Labyad', email: `h.labyad@talent.ma`, phone: '0665112233', avatar: 'https://i.pravatar.cc/150?u=24' },
      { name: 'Khadija El Marzi', email: `k.marzi@foundation.ma`, phone: '0665445566', avatar: 'https://i.pravatar.cc/150?u=25' },
      { name: 'Abdelatif Hammouchi', email: `a.hammouchi@security.ma`, phone: '0665778899', avatar: 'https://i.pravatar.cc/150?u=26' },
      { name: 'Saida Baadi', email: `s.baadi@theatre.ma`, phone: '0666112233', avatar: 'https://i.pravatar.cc/150?u=27' },
      { name: 'Khalid El Bakkali', email: `k.bakkali@sport.ma`, phone: '0666445566', avatar: 'https://i.pravatar.cc/150?u=28' },
      { name: 'Malika El Fassi', email: `m.fassi@history.ma`, phone: '0666778899', avatar: 'https://i.pravatar.cc/150?u=29' },
      { name: 'Tarik El Jaddi', email: `t.jaddi@innov.ma`, phone: '0666112233', avatar: 'https://i.pravatar.cc/150?u=30' }
    ];

    const createdCustomers = [];
    for (const c of customersData) {
      const customer = await prisma.customer.upsert({ 
        where: { email_organizationId: { email: c.email, organizationId: org.id } },
        update: {},
        create: { ...c, organizationId: org.id } 
      });
      createdCustomers.push(customer);
    }

    // 6. Create VIP orders for Nadia to make her the top customer
    const nadia = createdCustomers.find(c => c.name === 'Nadia Kwiatkowska');
    if (nadia) {
      for (let i = 0; i < 15; i++) {
        const orderTotal = 50000 + (Math.random() * 20000); // Massive orders
        await prisma.order.create({
          data: {
            organizationId: org.id,
            customerId: nadia.id,
            total: orderTotal,
            status: 'DELIVERED',
            createdAt: new Date(),
            items: {
              create: [
                { productId: createdProducts[0].id, quantity: 2, price: createdProducts[0].price, organizationId: org.id },
                { productId: createdProducts[1].id, quantity: 1, price: createdProducts[1].price, organizationId: org.id }
              ]
            }
          }
        });
        await prisma.customer.update({
          where: { id: nadia.id },
          data: { totalSpending: { increment: orderTotal } }
        });
      }
    }

    // 7. Create 100 Mock Orders over the last 180 days for others
    const statuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    for (let i = 0; i < 100; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let orderTotal = 0;

      for (let j = 0; j < itemsCount; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const price = product.price;
        orderTotal += price * quantity;
        
        orderItems.push({
          productId: product.id,
          quantity,
          price,
          organizationId: org.id
        });
      }

      let paidAmount = orderTotal;
      let paymentStatus = 'PAID';
      let debtIncrease = 0;

      // Randomly make ~30% of orders unpaid or partial to demonstrate the Carnet system
      if (Math.random() > 0.7) {
        if (Math.random() > 0.5) {
          paymentStatus = 'UNPAID';
          paidAmount = 0;
          debtIncrease = orderTotal;
        } else {
          paymentStatus = 'PARTIAL';
          paidAmount = Math.floor(orderTotal * 0.4); // 40% paid upfront
          debtIncrease = orderTotal - paidAmount;
        }
      }

      const status = Math.random() > 0.2 ? 'DELIVERED' : statuses[Math.floor(Math.random() * 4)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 180));

      await prisma.order.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          total: orderTotal,
          paidAmount,
          paymentStatus,
          status,
          createdAt: date,
          items: {
            create: orderItems
          }
        }
      });

      if (status !== 'CANCELLED') {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { 
            totalSpending: { increment: orderTotal },
            debt: { increment: debtIncrease }
          }
        });
      }
    }
  }

  console.log('✅ Seeding completed for all organizations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
