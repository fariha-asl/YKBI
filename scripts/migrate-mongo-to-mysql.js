// One-off script: copy existing MongoDB Atlas data into the new MySQL database.
// Run once: node scripts/migrate-mongo-to-mysql.js
require("dotenv").config();
require("node:dns").setServers(["8.8.8.8", "8.8.4.4"]); // this network can't resolve mongodb+srv otherwise

const mongoose = require("mongoose");
const sequelize = require("../config/db");
const User = require("../models/User");
const Member = require("../models/Member");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas.");

  await sequelize.authenticate();
  await sequelize.sync();
  console.log("Connected to MySQL.");

  const mongoUsers = await mongoose.connection.db.collection("users").find({}).toArray();
  const mongoMembers = await mongoose.connection.db.collection("members").find({}).toArray();

  const userIdMap = new Map(); // Mongo ObjectId string -> new MySQL integer id

  let usersMigrated = 0;
  for (const doc of mongoUsers) {
    const user = await User.create(
      {
        fullName: doc.fullName,
        username: doc.username,
        password: doc.password, // already a bcrypt hash - skip re-hashing
        whatsapp: doc.whatsapp,
        role: doc.role || "member",
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        lastLogin: doc.lastLogin || null,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      },
      { hooks: false }
    );
    userIdMap.set(String(doc._id), user.id);
    usersMigrated++;
  }

  let membersMigrated = 0;
  for (const doc of mongoMembers) {
    await Member.create({
      isCompany: doc.isCompany || false,
      clientId: doc.clientId,
      firstName: doc.firstName,
      lastName: doc.lastName,
      middleName: doc.middleName || null,
      email: doc.email || null,
      emailOptOut: doc.emailOptOut || false,
      phoneType: doc.phoneType || "mobile",
      phoneNumber: doc.phoneNumber || null,
      address: doc.address || {},
      gender: doc.gender || "Male",
      birthday: doc.birthday || null,
      referralType: doc.referralType || "Internal",
      isProspect: doc.isProspect || false,
      subscriptions: doc.subscriptions || {},
      emergencyContact: doc.emergencyContact || {},
      relatedClientIds: doc.relatedClientIds || [],
      familyMembers: doc.familyMembers || [],
      package: doc.package || "",
      sessionType: doc.sessionType || "",
      totalClasses: doc.totalClasses || 0,
      serviceName: doc.serviceName || "",
      remainingClasses: doc.remainingClasses || 0,
      packageExpiry: doc.packageExpiry || "Unlimited",
      status: doc.status || "active",
      createdBy: doc.createdBy ? userIdMap.get(String(doc.createdBy)) || null : null,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    membersMigrated++;
  }

  console.log(`Migrated ${usersMigrated} user(s), ${membersMigrated} member(s).`);

  await mongoose.disconnect();
  await sequelize.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
