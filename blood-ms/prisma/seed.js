const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.donationHistory.deleteMany();
  await prisma.request.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bloodStock.deleteMany();

  console.log('Seeding initial blood stock...');
  const bloodGroups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
  for (const bg of bloodGroups) {
    await prisma.bloodStock.create({
      data: {
        bloodGroup: bg,
        unitsAvailable: Math.floor(Math.random() * 50) + 10,
      },
    });
  }

  console.log('Creating Admin User...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@blood.com',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('Creating Donors...');
  const donorPassword = await bcrypt.hash('donor123', 10);
  const donors = [];
  const locations = ['Downtown Medical', 'Westside Clinic', 'North Bay Hospital', 'Central Health Center', 'East Valley Med'];
  
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Donor ${i}`,
        email: `donor${i}@blood.com`,
        password: donorPassword,
        role: 'DONOR',
        emailVerified: new Date(),
        donor: {
          create: {
            bloodGroup: bloodGroups[i % 8],
            age: 20 + i * 2,
            location: locations[i % 5],
            contactNumber: `+1555000100${i}`,
            availability: i % 4 !== 0,
            status: i === 1 ? 'PENDING' : 'APPROVED', // Keep one pending for admin demo
            lastDonationDate: i % 3 === 0 ? new Date(new Date().setMonth(new Date().getMonth() - 4)) : null,
          }
        }
      }
    });
    donors.push(user);
  }

  console.log('Fixing Donor History relation...');
  const allDonors = await prisma.donor.findMany();
  for (let j = 0; j < allDonors.length; j++) {
      if (j % 2 === 0) {
          await prisma.donationHistory.create({
              data: {
                  donorId: allDonors[j].id,
                  units: 1,
                  donatedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
              }
          })
      }
  }

  console.log('Creating Receivers & Requests...');
  const receiverPassword = await bcrypt.hash('receiver123', 10);
  const urgencies = ['NORMAL', 'URGENT', 'CRITICAL'];
  const statuses = ['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'];

  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Hospital Manager ${i}`,
        email: `receiver${i}@blood.com`,
        password: receiverPassword,
        role: 'RECEIVER',
        emailVerified: new Date(),
      }
    });

    await prisma.request.create({
      data: {
        requesterId: user.id,
        bloodGroup: bloodGroups[(i * 3) % 8],
        units: Math.floor(Math.random() * 5) + 1,
        urgency: urgencies[i % 3],
        status: statuses[i % 4],
        location: locations[i % 5],
        notes: i % 2 === 0 ? 'Patient awaiting surgery tomorrow.' : null,
      }
    });
  }

  console.log('Seed completed successfully!');
  console.log('--- TEST ACCOUNTS ---');
  console.log('Admin: admin@blood.com / admin123');
  console.log('Donor: donor2@blood.com / donor123');
  console.log('Receiver: receiver1@blood.com / receiver123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
