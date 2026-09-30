const Report = require("../models/Report");
const Property = require("../models/Property");

// POST /api/reports  (logged-in users)
exports.createReport = async (req, res) => {
  try {
    const { propertyId, reason, details } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.agent.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot report your own listing" });
    }

    const existing = await Report.findOne({
      property: property._id,
      reporter: req.user._id,
      status: "open",
    });
    if (existing) {
      return res.status(400).json({ message: "You already reported this listing" });
    }

    await Report.create({
      property: property._id,
      reporter: req.user._id,
      reason,
      details,
    });

    res.status(201).json({ message: "Report submitted. Thank you." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};