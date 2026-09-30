const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const User = require("../models/User");

// Returns ["2026-09-01", ..., today] for the last n days (UTC)
const lastNDays = (n) => {
  const days = [];
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (n - 1));
  d.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
};

// Fill days that have no data with 0
const fillDays = (days, rows, key) => {
  const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return days.map((date) => ({ date, [key]: map[date] || 0 }));
};

const dailyCount = (model, match, since) =>
  model.aggregate([
    { $match: { ...match, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

// GET /api/analytics/agent  (agent, admin)
exports.getAgentAnalytics = async (req, res) => {
  try {
    const me = req.user._id;
    const days = lastNDays(30);
    const since = new Date(`${days[0]}T00:00:00.000Z`);

    const props = await Property.find({ agent: me }).select("title views status");
    const ids = props.map((p) => p._id);

    const [inqCounts, favCounts, inqDaily] = await Promise.all([
      Inquiry.aggregate([
        { $match: { property: { $in: ids } } },
        { $group: { _id: "$property", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $unwind: "$favorites" },
        { $match: { favorites: { $in: ids } } },
        { $group: { _id: "$favorites", count: { $sum: 1 } } },
      ]),
      dailyCount(Inquiry, { agent: me }, since),
    ]);

    const inqMap = Object.fromEntries(inqCounts.map((r) => [r._id.toString(), r.count]));
    const favMap = Object.fromEntries(favCounts.map((r) => [r._id.toString(), r.count]));

    const perProperty = props.map((p) => ({
      _id: p._id,
      title: p.title,
      status: p.status,
      views: p.views || 0,
      inquiries: inqMap[p._id.toString()] || 0,
      favorites: favMap[p._id.toString()] || 0,
    }));

    const totals = perProperty.reduce(
      (t, p) => ({
        properties: t.properties + 1,
        views: t.views + p.views,
        inquiries: t.inquiries + p.inquiries,
        favorites: t.favorites + p.favorites,
      }),
      { properties: 0, views: 0, inquiries: 0, favorites: 0 }
    );

    res.json({
      totals,
      perProperty,
      inquiriesByDay: fillDays(days, inqDaily, "inquiries"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/analytics/admin  (admin)
exports.getAdminAnalytics = async (req, res) => {
  try {
    const days = lastNDays(30);
    const since = new Date(`${days[0]}T00:00:00.000Z`);

    const [users, properties, pending, inquiries, byCity, byType, signups, topViewed] =
      await Promise.all([
        User.countDocuments(),
        Property.countDocuments(),
        Property.countDocuments({ status: "pending" }),
        Inquiry.countDocuments(),
        Property.aggregate([
          { $match: { status: "approved" } },
          {
            $group: {
              _id: { $toLower: "$city" },
              count: { $sum: 1 },
              avgPricePerSqft: {
                $avg: {
                  $cond: [
                    { $and: [{ $eq: ["$listingType", "sale"] }, { $gt: ["$area", 0] }] },
                    { $divide: ["$price", "$area"] },
                    null,
                  ],
                },
              },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        Property.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: "$listingType", count: { $sum: 1 } } },
        ]),
        dailyCount(User, {}, since),
        Property.find().sort({ views: -1 }).limit(5).select("title city views"),
      ]);

    res.json({
      totals: { users, properties, pending, inquiries },
      byCity: byCity.map((c) => ({
        city: c._id,
        count: c.count,
        avgPricePerSqft: c.avgPricePerSqft ? Math.round(c.avgPricePerSqft) : null,
      })),
      byType: byType.map((t) => ({ type: t._id, count: t.count })),
      signupsByDay: fillDays(days, signups, "signups"),
      topViewed: topViewed.map((p) => ({
        _id: p._id, title: p.title, city: p.city, views: p.views || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};