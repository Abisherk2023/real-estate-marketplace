const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");

// POST /api/inquiries  (logged-in users)
exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const inquiry = await Inquiry.create({
      property: property._id,
      agent: property.agent,
      sender: req.user._id,
      name,
      email,
      phone,
      message,
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/inquiries/received  (agent, admin) - inquiries for my properties
exports.getReceivedInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ agent: req.user._id })
      .populate("property", "title city images")
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/inquiries/:id/read  (agent who owns it)
exports.markAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    if (inquiry.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    inquiry.isRead = true;
    await inquiry.save();
    res.json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};