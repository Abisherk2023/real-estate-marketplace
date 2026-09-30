const User = require("../models/User");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");

const removeFile = (filename) => {
  if (!filename) return;
  fs.unlink(path.join(__dirname, "..", "uploads", filename), () => {});
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [users, properties, pending, inquiries] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ status: "pending" }),
      Inquiry.countDocuments(),
    ]);
    res.json({ users, properties, pending, inquiries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/properties?status=pending
exports.getAllProperties = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const properties = await Property.find(query)
      .populate("agent", "name email")
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/properties/:id/status  body: { status }
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -favorites").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const props = await Property.find({ agent: user._id });
    props.forEach((p) => p.images.forEach((img) => removeFile(img.public_id)));
    await Property.deleteMany({ agent: user._id });

    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/verifications?status=pending
exports.getVerifications = async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const users = await User.find({ verificationStatus: status })
      .select("name email phone licenseNo verificationNote verificationStatus updatedAt")
      .sort({ updatedAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id/verification  body: { status: "verified" | "rejected" }
exports.setVerification = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { returnDocument: "after" }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id/active  body: { isActive: true | false }
exports.setUserActive = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot suspend your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin accounts cannot be suspended" });
    }

    user.isActive = Boolean(req.body.isActive);
    await user.save();
    res.json({ _id: user._id, isActive: user.isActive });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/admin/properties/:id/featured  body: { featured: true | false }
exports.setFeatured = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { featured: Boolean(req.body.featured) },
      { returnDocument: "after" }
    );
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/admin/reports?status=open
exports.getReports = async (req, res) => {
  try {
    const status = req.query.status || "open";
    const reports = await Report.find({ status })
      .populate("property", "title city status")
      .populate("reporter", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/reports/:id  body: { status: "resolved" | "dismissed" }
exports.updateReport = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};