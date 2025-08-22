const express = require('express');
const { ObjectId } = require('mongodb');
const { getManagementCollection } = require('../db');

const router = express.Router();

// Allowed values
const allowedInsuranceTypes = ['life', 'health', 'vehicle'];
const allowedPaymentTerms = ['monthly', 'yearly'];
const allowedHealthConditions = ['Yes', 'No'];
const allowedStatuses = ['Pending', 'Accepted', 'Rejected'];

// Validation
function validateApplication(data) {
  const requiredFields = [
    'name','dob','nid','phone','email','insuranceType',
    'coverage','paymentTerm','nomineeName','nomineeRelation','nomineeNid'
  ];
  for (const field of requiredFields) {
    if (!data[field]) return `${field} is required`;
  }
  if (!allowedInsuranceTypes.includes(data.insuranceType)) return `Invalid insuranceType. Allowed: ${allowedInsuranceTypes.join(', ')}`;
  if (!allowedPaymentTerms.includes(data.paymentTerm)) return `Invalid paymentTerm. Allowed: ${allowedPaymentTerms.join(', ')}`;
  if (data.healthCondition && !allowedHealthConditions.includes(data.healthCondition)) return `Invalid healthCondition. Allowed: ${allowedHealthConditions.join(', ')}`;
  if (data.status && !allowedStatuses.includes(data.status)) return `Invalid status. Allowed: ${allowedStatuses.join(', ')}`;
  return null;
}

// GET all
router.get('/', async (req, res) => {
  try {
    const apps = await getManagementCollection().find().toArray();
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const app = await getManagementCollection().findOne({ _id: new ObjectId(id) });
    if (!app) return res.status(404).json({ error: "Application not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// POST new
router.post('/', async (req, res) => {
  const error = validateApplication(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const newApp = { ...req.body, status: req.body.status || "Pending", applicationDate: new Date() };
    const result = await getManagementCollection().insertOne(newApp);
    res.status(201).json({ ...newApp, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add application" });
  }
});

// PUT full update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  const error = validateApplication(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const updatedApp = { ...req.body, applicationDate: req.body.applicationDate ? new Date(req.body.applicationDate) : new Date() };
    const result = await getManagementCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedApp },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: "Application not found" });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: "Failed to update application" });
  }
});

// PATCH status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });

  try {
    const result = await getManagementCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: "Application not found" });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const result = await getManagementCollection().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Application not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete application" });
  }
});

module.exports = router;
