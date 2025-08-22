const express = require('express');
const { ObjectId } = require('mongodb');
const { getProfiledesignCollection } = require('../db');

const router = express.Router();

// GET all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await getProfiledesignCollection().find().toArray();
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// GET profile by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid profile ID' });
  }

  try {
    const profile = await getProfiledesignCollection().findOne({ _id: new ObjectId(id) });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error retrieving profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// POST new profile
router.post('/', async (req, res) => {
  const profile = req.body;

  if (!profile.bio || !profile.coverImage) {
    return res.status(400).json({ error: 'Missing bio or coverImage' });
  }

  profile.date = new Date().toISOString();
  profile.socialLinks = profile.socialLinks || {};

  try {
    const result = await getProfiledesignCollection().insertOne(profile);
    res.status(201).json({
      message: 'Profile created successfully',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PUT update profile by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedProfile = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid profile ID' });
  }

  try {
    const result = await getProfiledesignCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProfile }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE profile by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid profile ID' });
  }

  try {
    const result = await getProfiledesignCollection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

module.exports = router;
