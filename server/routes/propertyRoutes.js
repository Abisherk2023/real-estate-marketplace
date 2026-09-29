const express = require("express");
const {
  createProperty, getProperties, getPropertyById,
  getMyProperties, updateProperty, deleteProperty, deletePropertyImage
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getProperties);
router.get("/mine", protect, authorize("agent", "admin"), getMyProperties); // must be above /:id
router.get("/:id", getPropertyById);

router.post("/", protect, authorize("agent", "admin"), upload.array("images", 6), createProperty);
router.put("/:id", protect, authorize("agent", "admin"), upload.array("images", 6), updateProperty);
router.delete("/:id", protect, authorize("agent", "admin"), deleteProperty);
router.delete("/:id/image", protect, authorize("agent", "admin"), deletePropertyImage);

module.exports = router;