const express = require('express');
const { ObjectId } = require('mongodb');
const { getAirTicketCollection } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const applications = await getAirTicketCollection().find().toArray();
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching policy applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  try {
    const application = await getAirTicketCollection().findOne({ _id: new ObjectId(id) });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('Error retrieving application:', error);
    res.status(500).json({ error: 'Failed to retrieve application' });
  }
});

router.post('/', async (req, res) => {
  const application = req.body;
  const requiredFields = ['name', 'email', 'insuranceType', 'coverage', 'paymentTerm'];

  const missing = requiredFields.filter(field => !application[field]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }

  application.status = 'Pending';
  application.date = new Date().toISOString();

  try {
    const result = await getAirTicketCollection().insertOne(application);
    res.status(201).json({
      message: 'Application submitted successfully',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedApplication = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  try {
    const result = await getAirTicketCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedApplication }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({ message: 'Application updated successfully' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  try {
    const result = await getAirTicketCollection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
