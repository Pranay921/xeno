import "dotenv/config";
import { PrismaClient, Role, CampaignStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"];
const GENDERS = ["Male", "Female", "Other"];
const PRODUCTS = [
  { name: "Wireless Headphones", price: 2999 },
  { name: "Running Shoes", price: 4999 },
  { name: "Leather Wallet", price: 1299 },
  { name: "Mechanical Keyboard", price: 5999 },
  { name: "Coffee Mug", price: 499 },
  { name: "Smart Watch", price: 8999 },
  { name: "Water Bottle", price: 799 },
  { name: "Backpack", price: 2499 },
  { name: "Sunglasses", price: 1899 },
  { name: "Desk Mat", price: 999 },
];

async function main() {
  console.log("Starting database seeding...");

  // Clean old data
  console.log("Cleaning database...");
  await prisma.communicationEvent.deleteMany({});
  await prisma.communication.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.segment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.aIGeneration.deleteMany({});

  // Seed Users
  console.log("Seeding users...");
  const hashedPassword = await bcrypt.hash("xeno123", 10);
  
  const admin = await prisma.user.create({
    data: {
      email: "admin@xeno.ai",
      name: "Admin User",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const marketer = await prisma.user.create({
    data: {
      email: "marketer@xeno.ai",
      name: "Marketer User",
      password: hashedPassword,
      role: Role.MARKETER,
    },
  });

  console.log(`Created users: ${admin.email}, ${marketer.email}`);

  // Seed Customers
  console.log("Seeding 500 customers...");
  const customersData = [];
  const firstNames = ["Amit", "Rahul", "Priya", "Anjali", "Siddharth", "Neha", "Vikram", "Sneha", "Karan", "Pooja", "Arjun", "Deepika", "Rohan", "Simran", "Kabir", "Aditi", "Yash", "Kriti", "Raj", "Riya"];
  const lastNames = ["Sharma", "Verma", "Gupta", "Mehta", "Sen", "Patel", "Reddy", "Rao", "Joshi", "Kumar", "Singh", "Nair", "Bose", "Choudhury", "Das", "Mishra", "Pandey", "Iyer", "Gill", "Malhotra"];

  for (let i = 0; i < 500; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@example.com`;
    const phone = `+91${Math.floor(6000000000 + Math.random() * 4000000000)}`;
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
    
    // Some random signup times from last 180 days
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 180));

    customersData.push({
      name: `${fn} ${ln}`,
      email,
      phone,
      city,
      gender,
      createdAt,
    });
  }

  // Create customers and store references
  const customers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    customers.push(cust);
  }
  console.log("Seeded customers.");

  // Seed Orders (2000 total)
  console.log("Seeding 2000 orders...");
  const ordersData = [];
  for (let i = 0; i < 2000; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const amount = product.price * quantity;

    // Order date in last 120 days, but after customer created date
    const customerCreated = new Date(customer.createdAt);
    const orderDate = new Date(customerCreated.getTime() + Math.random() * (new Date().getTime() - customerCreated.getTime()));

    ordersData.push({
      customerId: customer.id,
      productName: product.name,
      amount,
      quantity,
      orderDate,
      createdAt: orderDate,
    });
  }

  // Batch insert orders in chunks for performance
  const chunkSize = 200;
  for (let i = 0; i < ordersData.length; i += chunkSize) {
    const chunk = ordersData.slice(i, i + chunkSize);
    await prisma.order.createMany({ data: chunk });
  }
  console.log("Seeded orders.");

  // Recalculate customer totalSpend and lastPurchaseDate
  console.log("Updating customer spending profiles...");
  const orderAggs = await prisma.order.groupBy({
    by: ["customerId"],
    _sum: { amount: true },
    _max: { orderDate: true },
  });

  const updatePromises = orderAggs.map((agg) =>
    prisma.customer.update({
      where: { id: agg.customerId },
      data: {
        totalSpend: agg._sum.amount || 0,
        lastPurchaseDate: agg._max.orderDate,
      },
    })
  );

  // Run updates in batches of 50 for speed and Neon connection limit safety
  const batchSize = 50;
  for (let i = 0; i < updatePromises.length; i += batchSize) {
    const batch = updatePromises.slice(i, i + batchSize);
    await Promise.all(batch);
  }
  console.log("Customer spending profiles updated.");

  // Seed Segments
  console.log("Seeding Segments...");
  const segment1 = await prisma.segment.create({
    data: {
      name: "High Value Bangalore Customers",
      description: "Customers in Bangalore with total spend greater than 5000",
      conditions: JSON.stringify([
        { field: "city", operator: "=", value: "Bangalore" },
        { field: "totalSpend", operator: ">", value: "5000" },
      ]),
      creatorId: marketer.id,
    },
  });

  const segment2 = await prisma.segment.create({
    data: {
      name: "Inactive Pune Users",
      description: "Customers in Pune who haven't ordered recently",
      conditions: JSON.stringify([
        { field: "city", operator: "=", value: "Pune" },
        { field: "daysSinceLastPurchase", operator: ">", value: "30" },
      ]),
      creatorId: marketer.id,
    },
  });

  const segment3 = await prisma.segment.create({
    data: {
      name: "Delhi Female Shoppers",
      description: "Female customers located in Delhi",
      conditions: JSON.stringify([
        { field: "city", operator: "=", value: "Delhi" },
        { field: "gender", operator: "=", value: "Female" },
      ]),
      creatorId: admin.id,
    },
  });

  console.log("Seeded Segments.");

  // Seed Campaigns (20 campaigns)
  console.log("Seeding 20 Campaigns...");
  const channels = ["Email", "SMS", "WhatsApp"];
  const campaignNames = [
    "Summer Clearance Sale",
    "Bangalore High Spenders Reward",
    "Welcome New Users",
    "Win Back Dormant Delhi Buyers",
    "Exclusive Pune VIP Discount",
    "Weekend Flash Sale",
    "Monsoon Offer SMS Blast",
    "Product Launch Early Access",
    "Abandon Cart Recovery Promo",
    "Festival Bonanza",
    "Thank You Coupon Code",
    "Customer Survey Invitation",
    "App Download Incentive",
    "Birthday Month Special Deal",
    "Re-engagement Newsletter",
    "Referral Program Kickoff",
    "Weekly Hot Picks",
    "Clearance WhatsApp Alert",
    "VIP Access Sneak Peek",
    "Free Delivery Weekend",
  ];

  const campaigns = [];
  const segments = [segment1, segment2, segment3];

  for (let i = 0; i < 20; i++) {
    const seg = segments[i % segments.length];
    const name = campaignNames[i];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const status = i < 5 ? CampaignStatus.COMPLETED : i < 10 ? CampaignStatus.RUNNING : CampaignStatus.DRAFT;
    
    // Find customers in segment
    let count = 0;
    if (seg === segment1) count = 80;
    else if (seg === segment2) count = 120;
    else count = 150;

    const camp = await prisma.campaign.create({
      data: {
        name,
        segmentId: seg.id,
        channel,
        message: `Hi {{name}}! Exclusive ${channel} offer for you. Get 20% off on your next purchase using code XENO20. Valid in {{city}}.`,
        audienceSize: count,
        status,
        creatorId: marketer.id,
        createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
      },
    });
    campaigns.push(camp);
  }
  console.log("Seeded Campaigns.");

  // Seed Communications & Events (For completed and running campaigns)
  console.log("Seeding communications and callback simulation events...");
  const communicationStatuses = ["sent", "delivered", "opened", "clicked", "converted", "failed"];

  for (const campaign of campaigns) {
    if (campaign.status === CampaignStatus.DRAFT) continue;

    // Pick 30 random customers for communications under this campaign to keep seeding quick
    const sampleSize = 30;
    const shuffledCust = [...customers].sort(() => 0.5 - Math.random());
    const campaignCustomers = shuffledCust.slice(0, sampleSize);

    for (const cust of campaignCustomers) {
      // Pick random final status with weights
      let status = "sent";
      const rand = Math.random();
      if (rand < 0.05) status = "failed";
      else if (rand < 0.15) status = "sent";
      else if (rand < 0.35) status = "delivered";
      else if (rand < 0.6) status = "opened";
      else if (rand < 0.8) status = "clicked";
      else status = "converted";

      const personalizedMessage = campaign.message
        .replace("{{name}}", cust.name)
        .replace("{{city}}", cust.city)
        .replace("{{totalSpend}}", cust.totalSpend.toString());

      const comm = await prisma.communication.create({
        data: {
          campaignId: campaign.id,
          customerId: cust.id,
          personalizedMessage,
          status,
          sentAt: new Date(campaign.createdAt),
        },
      });

      // Create events history
      const statusesToCreate = [];
      if (status !== "failed") {
        statusesToCreate.push("sent");
        if (status !== "sent") {
          statusesToCreate.push("delivered");
          if (status !== "delivered") {
            statusesToCreate.push("opened");
            if (status !== "opened") {
              statusesToCreate.push("clicked");
              if (status !== "clicked") {
                statusesToCreate.push("converted");
              }
            }
          }
        }
      } else {
        statusesToCreate.push("sent");
        statusesToCreate.push("failed");
      }

      let eventTime = new Date(campaign.createdAt);
      for (const st of statusesToCreate) {
        eventTime = new Date(eventTime.getTime() + (Math.random() * 60 + 1) * 60 * 1000); // 1-60 mins later
        await prisma.communicationEvent.create({
          data: {
            communicationId: comm.id,
            status: st,
            createdAt: eventTime,
          },
        });
      }
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
