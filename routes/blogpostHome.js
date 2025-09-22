// routes/blogpostHome.js
const express = require("express");
const { ObjectId } = require("mongodb");
const { getBlogpostHomeCollection } = require("../db");

const router = express.Router();

/**
 * GET /blogpostHome
 * Fetch all blogs
 */
router.get("/", async (req, res) => {
  try {
    const blogs = await getBlogpostHomeCollection().find().toArray();
    res.status(200).json(blogs);
  } catch (err) {
    console.error("Failed to fetch blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

/**
 * GET /blogpostHome/search
 * Search blogs by tags and/or keyword
 */
router.get("/search", async (req, res) => {
  const { tags, keyword } = req.query;

  let query = {};

  if (tags) {
    const tagsArray = tags.split(",").map((t) => t.trim());
    query.tags = { $in: tagsArray };
  }

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { details: { $regex: keyword, $options: "i" } },
    ];
  }

  try {
    const blogs = await getBlogpostHomeCollection().find(query).toArray();
    res.status(200).json(blogs);
  } catch (err) {
    console.error("Failed to search blogs:", err);
    res.status(500).json({ message: "Failed to search blogs" });
  }
});

/**
 * GET /blogpostHome/:id
 * Fetch single blog by ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  try {
    const blog = await getBlogpostHomeCollection().findOne({ _id: new ObjectId(id) });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    console.error("Failed to fetch blog:", err);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
});

/**
 * POST /blogpostHome
 * Create new blog
 */
router.post("/", async (req, res) => {
  const { title, details, image, author, authorImage, tags } = req.body;

  if (!title || !details || !author) {
    return res.status(400).json({ message: "Title, details, and author are required" });
  }

  try {
    const newBlog = {
      title,
      details,
      image: image || "",
      author,
      authorImage: authorImage || "",
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      views: 0,
      createdAt: new Date(),
    };

    const result = await getBlogpostHomeCollection().insertOne(newBlog);
    res.status(201).json({ message: "Blog created", blogId: result.insertedId });
  } catch (err) {
    console.error("Failed to create blog:", err);
    res.status(500).json({ message: "Failed to create blog" });
  }
});

/**
 * PUT /blogpostHome/:id
 * Update a blog
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  if (updateData.tags) {
    updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : [updateData.tags];
  }

  try {
    const result = await getBlogpostHomeCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ message: "Blog updated", blog: result.value });
  } catch (err) {
    console.error("Failed to update blog:", err);
    res.status(500).json({ message: "Failed to update blog" });
  }
});

/**
 * DELETE /blogpostHome/:id
 * Delete a blog
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  try {
    const result = await getBlogpostHomeCollection().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ message: "Blog deleted" });
  } catch (err) {
    console.error("Failed to delete blog:", err);
    res.status(500).json({ message: "Failed to delete blog" });
  }
});

/**
 * POST /blogpostHome/:id/increment-view
 * Increment blog views
 */
router.post("/:id/increment-view", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  try {
    const result = await getBlogpostHomeCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ views: result.value.views });
  } catch (err) {
    console.error("Failed to increment views:", err);
    res.status(500).json({ message: "Failed to increment views" });
  }
});

module.exports = router;
