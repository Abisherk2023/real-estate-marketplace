const express = require("express");
const {
  getStats, getAllProperties, updatePropertyStatus, getUsers, deleteUser,
  getVerifications, setVerification, setUserActive, setFeatured,
  getReports, updateReport,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin")); // every route below is admin-only

router.get("/stats", getStats);
router.get("/properties", getAllProperties);
router.put("/properties/:id/status", updatePropertyStatus);
router.put("/properties/:id/featured", setFeatured);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/active", setUserActive);
router.put("/users/:id/verification", setVerification);
router.get("/verifications", getVerifications);
router.get("/reports", getReports);
router.put("/reports/:id", updateReport);

module.exports = router;