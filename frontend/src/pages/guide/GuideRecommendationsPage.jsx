import React from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";

const GuideRecommendationsPage = () => {
  return (
    <div className="rounded-2xl bg-[#071120] p-6">
      <h1 className="text-2xl font-semibold text-white">Recommendations</h1>
      <p className="mt-2 text-sm text-white/60">
        Recommended tours and ideas to feature on your profile.
      </p>

      <div className="mt-6">
        <EmptyState
          title="No recommendations yet"
          description={
            <>
              We don't have personalized recommendations for you yet. Visit
              <Link to="/guide/tours" className="text-[#75d780] ml-1">
                Manage Tours
              </Link>
              to add listings.
            </>
          }
        />
      </div>
    </div>
  );
};

export default GuideRecommendationsPage;
