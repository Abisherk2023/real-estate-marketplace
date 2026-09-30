const Property = require("../models/Property");
const fs = require("fs");
const path = require("path");

const fileUrl = (req, file) =>
  `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

const removeFile = (filename) => {
  if (!filename) return;
  fs.unlink(path.join(__dirname, "..", "uploads", filename), () => {});
};

const isOwnerOrAdmin = (property, user) =>
  property.agent.toString() === user._id.toString() || user.role === "admin";

// POST /api/properties  (agent, admin)
exports.createProperty = async (req, res) => {
  try {
    const images = (req.files || []).map((file) => ({
      url: fileUrl(req, file),
      public_id: file.filename,
    }));

    const property = await Property.create({
      ...req.body,
      images,
      agent: req.user._id,
      status: req.user.role === "admin" ? "approved" : "pending",
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

// GET /api/properties  (public) - search, filter, sort, pagination
exports.getProperties = async (req, res) => {
  try {
    const {
      keyword, city, listingType, propertyType,
      minPrice, maxPrice, bedrooms, sort,
      page = 1, limit = 9,
    } = req.query;

    const query = { status: "approved" };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword,$options: "i" } },
        { address: { $regex: keyword,$options: "i" } },
      ];
    }
    if (city) query.city = { $regex: city,$options: "i" };
    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
    };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate("agent", "name email phone verificationStatus")
      .sort({ featured: -1, ...(sortOptions[sort] || sortOptions.newest) })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      properties,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/properties/:id  (public)
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "agent",
      "name email phone verificationStatus"
    );
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: "Invalid property id" });
  }
};

// GET /api/properties/mine  (agent, admin)
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ agent: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/properties/:id  (owner or admin)
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (!isOwnerOrAdmin(property, req.user)) {
      return res.status(403).json({ message: "Not allowed to edit this property" });
    }

    // Add newly uploaded images to the existing ones
    for (const file of req.files || []) {
      property.images.push({ url: fileUrl(req, file), public_id: file.filename });
    }

    const fields = [
      "title", "description", "price", "listingType", "propertyType",
      "bedrooms", "bathrooms", "area", "address", "city",
      "latitude", "longitude",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) property[f] = req.body[f];
    });

    await property.save();
    res.json(property);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/properties/:id  (owner or admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (!isOwnerOrAdmin(property, req.user)) {
      return res.status(403).json({ message: "Not allowed to delete this property" });
    }

    property.images.forEach((img) => removeFile(img.public_id));

    await property.deleteOne();
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/properties/:id/image?public_id=<filename>  (owner or admin)
exports.deletePropertyImage = async (req, res) => {
  try {
    const { public_id } = req.query;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (!isOwnerOrAdmin(property, req.user)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    removeFile(public_id);
    property.images = property.images.filter((img) => img.public_id !== public_id);
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/properties/:id/view  (public)
exports.incrementViews = async (req, res) => {
  try {
    await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { timestamps: false }
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: "Invalid property id" });
  }
};

// GET /api/properties/:id/similar  (public)
exports.getSimilarProperties = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // 1) Same listing type and property type, price within +/- 30%
    let similar = await Property.find({
      _id: { $ne: property._id },
      status: "approved",
      listingType: property.listingType,
      propertyType: property.propertyType,
      price: { $gte: property.price * 0.7, $lte: property.price * 1.3 },
    })
      .populate("agent", "name")
      .sort({ featured: -1, createdAt: -1 })
      .limit(3);

    // 2) If there are fewer than 3, fill up with the same city
    if (similar.length < 3) {
      const excludeIds = [property._id, ...similar.map((p) => p._id)];
      const more = await Property.find({
        _id: { $nin: excludeIds },
        status: "approved",
        listingType: property.listingType,
        city: property.city,
      })
        .populate("agent", "name")
        .sort({ createdAt: -1 })
        .limit(3 - similar.length);
      similar = [...similar, ...more];
    }

    res.json(similar);
  } catch (error) {
    res.status(400).json({ message: "Invalid property id" });
  }
};