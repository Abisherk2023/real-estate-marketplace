const User = require("../models/User");

// POST /api/verification/request  (agents)
exports.requestVerification = async (req, res) => {
  try {
    const { licenseNo, note } = req.body;
    if (!licenseNo || !licenseNo.trim()) {
      return res.status(400).json({ message: "License or registration number is required" });
    }

    const user = await User.findById(req.user._id);
    if (user.verificationStatus === "verified") {
      return res.status(400).json({ message: "You are already verified" });
    }
    if (user.verificationStatus === "pending") {
      return res.status(400).json({ message: "Your request is already pending" });
    }

    user.licenseNo = licenseNo.trim();
    user.verificationNote = (note || "").trim().slice(0, 500);
    user.verificationStatus = "pending";
    await user.save();

    res.json({ verificationStatus: user.verificationStatus });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};