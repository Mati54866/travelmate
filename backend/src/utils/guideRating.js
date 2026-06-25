import GuideProfile from "../models/GuideProfile.js";
import Review from "../models/Review.js";

const syncGuideRating = async (guideId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        guideId
      }
    },
    {
      $group: {
        _id: "$guideId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const nextValues =
    stats[0] || {
      avgRating: 0,
      totalReviews: 0
    };

  await GuideProfile.findByIdAndUpdate(guideId, {
    rating: Number(nextValues.avgRating.toFixed ? nextValues.avgRating.toFixed(1) : 0),
    totalReviews: nextValues.totalReviews
  });
};

export default syncGuideRating;
