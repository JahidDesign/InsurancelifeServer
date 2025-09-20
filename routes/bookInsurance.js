// routes/insuranceBookings.js
const express = require("express");
const { ObjectId } = require("mongodb");
const { getBookInsuranceCollection } = require("../db");

const router = express.Router();

/* ===================== CREATE BOOKING ===================== */
router.post("/bookInsurance", async (req, res) => {
  try {
    const {
      insuranceId,
      serviceName,
      providerName,
      coverageAmount,
      premium,
      userName,
      userEmail,
      userPhoto,
    } = req.body;

    if (!insuranceId || !userEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Insurance ID and user email are required" });
    }

    const booking = {
      insuranceId: new ObjectId(insuranceId),
      serviceName,
      providerName,
      coverageAmount,
      premium,
      userName,
      userEmail,
      userPhoto,
      bookedAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getBookInsuranceCollection();
    const result = await collection.insertOne(booking);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* ===================== READ BOOKINGS ===================== */

// Get all bookings (admin/agent)
router.get("/bookInsurance/all", async (req, res) => {
  try {
    const collection = await getBookInsuranceCollection();
    const bookings = await collection.find().sort({ bookedAt: -1 }).toArray();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Get all bookings error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get bookings by user email
router.get("/bookInsurance/user/:email", async (req, res) => {
  try {
    const collection = await getBookInsuranceCollection();
    const bookings = await collection
      .find({ userEmail: req.params.email })
      .sort({ bookedAt: -1 })
      .toArray();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Get user bookings error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get single booking by ID
router.get("/bookInsurance/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid booking ID" });

    const collection = await getBookInsuranceCollection();
    const booking = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* ===================== UPDATE BOOKING ===================== */
router.put("/bookInsurance/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid booking ID" });

    const collection = await getBookInsuranceCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: "Booking updated successfully" });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* ===================== DELETE BOOKING ===================== */
router.delete("/bookInsurance/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid booking ID" });

    const collection = await getBookInsuranceCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
