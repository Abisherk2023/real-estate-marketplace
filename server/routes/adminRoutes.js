const express = require("express");
const {
  getStats, getAllProperties, updatePropertyStatus, getUsers, deleteUser,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin")); // every route below is admin-only

router.get("/stats", getStats);
router.get("/properties", getAllProperties);
router.put("/properties/:id/status", updatePropertyStatus);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;