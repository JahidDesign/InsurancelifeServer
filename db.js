// db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.obhimbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let managementCollection;
let blogPostCollection;
let blogpostHomeCollection;
let airTicketCollection;
let insuranceServicesCollection;
let visitorsCollection;
let customerCollection;
let contactCollection;
let profileDesignCollection;
let usersCollection;
let policiesCollection;
let registerCollection;
let createOrderCollection;
let InsuranceCarouselCollection;
let ourInsurancePoliceCollection;
let insuranceservicesBookingCollection;
let bookInsuranceCollection;
let HeroCarouselCollection;
let paymentsInsuranceCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("LifeInsurance");

    managementCollection = db.collection("management");
    blogPostCollection = db.collection("blogpost");
    blogpostHomeCollection = db.collection("blogpostHome");
    airTicketCollection = db.collection("policiesuser");
    insuranceServicesCollection = db.collection("insuranceservices");
    ourInsurancePoliceCollection = db.collection("ourInsurancePolice");
    insuranceservicesBookingCollection = db.collection("insuranceservicesBooking");
    bookInsuranceCollection = db.collection("bookInsurance");
    visitorsCollection = db.collection("visitors");
    customerCollection = db.collection("customer"); 
    contactCollection = db.collection("contact"); 
    profileDesignCollection = db.collection("profiledesign");
    usersCollection = db.collection("users");
    policiesCollection = db.collection("policies");
    registerCollection = db.collection("register");
    createOrderCollection = db.collection("payments");
    InsuranceCarouselCollection = db.collection("InsuranceCarousel");
    HeroCarouselCollection = db.collection("HeroCarousel");
    paymentsInsuranceCollection = db.collection("paymentsInsurance");

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Export getter functions with proper checks and fixed naming
function getManagementCollection() {
  if (!managementCollection) throw new Error("Management collection not initialized.");
  return managementCollection;
}

function getBlogPostCollection() {
  if (!blogPostCollection) throw new Error("BlogPost collection not initialized.");
  return blogPostCollection;
}
function getBlogpostHomeCollection() {
  if (!blogpostHomeCollection) throw new Error("BlogPost collection not initialized.");
  return blogpostHomeCollection;
}

function getAirTicketCollection() {
  if (!airTicketCollection) throw new Error("AirTicket collection not initialized.");
  return airTicketCollection;
}

function getInsuranceServicesCollection() {
  if (!insuranceServicesCollection) throw new Error("InsuranceServices collection not initialized.");
  return insuranceServicesCollection;
}
function getOurInsurancePoliceCollection() {
  if (!ourInsurancePoliceCollection) throw new Error("InsuranceServices collection not initialized.");
  return ourInsurancePoliceCollection;
}
function getBookInsuranceCollection() {
  if (!bookInsuranceCollection) throw new Error("InsuranceServices collection not initialized.");
  return bookInsuranceCollection;
}

function getVisitorsCollection() {
  if (!visitorsCollection) throw new Error("Visitors collection not initialized.");
  return visitorsCollection;
}

function getCustomerCollection() {
  if (!customerCollection) throw new Error("Customer collection not initialized.");
  return customerCollection;
}

function getProfileDesignCollection() {
  if (!profileDesignCollection) throw new Error("ProfileDesign collection not initialized.");
  return profileDesignCollection;
}

function getUsersCollection() {
  if (!usersCollection) throw new Error("Users collection not initialized.");
  return usersCollection;
}

function getPoliciesCollection() {
  if (!policiesCollection) throw new Error("Policies collection not initialized.");
  return policiesCollection;
}
function getRegisterCollection() {
  if (!registerCollection) throw new Error("Policies collection not initialized.");
  return registerCollection;
}
function getCreateOrderCollection() {
  if (!createOrderCollection) throw new Error("Policies collection not initialized.");
  return createOrderCollection;
}
function getInsuranceservicesBookingCollection() {
  if (!insuranceservicesBookingCollection) throw new Error("Policies collection not initialized.");
  return insuranceservicesBookingCollection;
}
function getInsuranceCarouselCollection() {
  if (!InsuranceCarouselCollection) throw new Error("Policies collection not initialized.");
  return InsuranceCarouselCollection;
}
function getHeroCarouselCollection() {
  if (!HeroCarouselCollection) throw new Error("Policies collection not initialized.");
  return HeroCarouselCollection;
}
function getPaymentsInsuranceCollection() {
  if (!paymentsInsuranceCollection) throw new Error("Policies collection not initialized.");
  return paymentsInsuranceCollection;
}
function getContactCollection() {
  if (!contactCollection) throw new Error("Policies collection not initialized.");
  return contactCollection;
}
function getContactCollection() {
  if (!insuranceservicesBooking) throw new Error("Policies collection not initialized.");
  return insuranceservicesBooking;
}

module.exports = {
  connectDB,
  getManagementCollection,
  getBlogPostCollection,
  getBlogpostHomeCollection,
  getAirTicketCollection,
  getInsuranceServicesCollection,
  getOurInsurancePoliceCollection,
  getBookInsuranceCollection,
  getVisitorsCollection,
  getCustomerCollection,
  getContactCollection,
  getProfileDesignCollection,
  getInsuranceservicesBookingCollection,
  getUsersCollection,
  getPoliciesCollection,
  getRegisterCollection,
  getCreateOrderCollection,
  getHeroCarouselCollection,
  getInsuranceCarouselCollection,
  getPaymentsInsuranceCollection,
};
