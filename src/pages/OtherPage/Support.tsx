import Community from "./Community";
import QueryPage from "./QueryPage";
import RatingPage from "./RatingPage";

const Support = () => {
  return (
    <div className="space-y-6">
      <Community />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RatingPage />
        <QueryPage />
      </div>
    </div>
  );
};

export default Support;