import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import admin from "./firebase.js";
import { connectDB } from "./db.js";
import rateLimit from "express-rate-limit";

// Import routes
import managementRoutes from "./routes/management.js";
import blogPostRoutes from "./routes/tours.js";
import policiesuserRoutes from "./routes/policiesuser.js";
import insuranceservicesRoutes from "./routes/insuranceservices.js";
import visitorRoutes from "./routes/visitors.js";
import customerRoutes from "./routes/customers.js";
import profiledesignRoutes from "./routes/profiledesign.js";
import usersRoutes from "./routes/users.js";
import policiesRoutes from "./routes/policies.js";
import createOrderRoutes from "./routes/payments.js";
import InsuranceCarouselRoutes from "./routes/InsuranceCarousel.js";
import contactRoutes from "./routes/contact.js";
import HeroCarouselRoutes from "./routes/HeroCarousel.js";
import paymentsInsuranceRoutes from "./routes/paymentsInsurance.js";

dotenv.config();

// Check env
if (!process.env.JWT_SECRET || !process.env.STRIPE_SECRET_KEY || !process.env.ADMIN_EMAIL) {
  console.error("❌ Missing environment variables. Check .env file.");
  process.exit(1);
}

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Please try again later." },
});

// 🔐 JWT Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ✅ Connect DB and start server
connectDB()
  .then(() => {
    // Routes
    app.use("/management", managementRoutes);
    app.use("/blogpost", blogPostRoutes);
    app.use("/policiesuser", policiesuserRoutes);
    app.use("/insuranceservices", insuranceservicesRoutes);
    app.use("/visitors", visitorRoutes);
    app.use("/customer", customerRoutes);
    app.use("/contact", contactRoutes);
    app.use("/profiledesign", profiledesignRoutes);
    app.use("/users", usersRoutes);
    app.use("/policies", policiesRoutes);
    app.use("/payments", createOrderRoutes);
    app.use("/InsuranceCarousel", InsuranceCarouselRoutes);
    app.use("/HeroCarousel", HeroCarouselRoutes);
    app.use("/paymentsInsurance", paymentsInsuranceRoutes);

    // Firebase login → JWT
    app.post("/customer/login", authLimiter, async (req, res) => {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ error: "idToken missing" });

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const payload = { uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name || decodedToken.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ success: true, token, user: payload });
      } catch (error) {
        console.error("Firebase ID token verification error:", error);
        res.status(401).json({ error: "Invalid Firebase ID token" });
      }
    });

    // Stripe Payment Intent
    app.post("/create-payment-intent", authLimiter, async (req, res) => {
      const { amount } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("Stripe error:", error);
        res.status(500).json({ error: "Failed to create payment intent" });
      }
    });

    // Protected route
    app.get("/customer/protected", authenticateJWT, (req, res) => {
      res.json({ success: true, message: "Protected content", user: req.user });
    });

    // Admin-only route
    app.delete("/admin/delete", authenticateJWT, (req, res) => {
      if (req.user.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: "Access denied: Admin only" });
      }
      res.json({ message: "Admin deletion access granted" });
    });

    // Root & 404
    app.get("/", (req, res) => res.send(" Insurance & Stripe API is running..."));
    app.use((req, res) => res.status(404).json({ error: "Route not found" }));

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("Server Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });

    app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
