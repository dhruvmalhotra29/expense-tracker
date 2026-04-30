import "../styles/InsightCardPlaceholder.css"

const InsightCardPlaceholder = ({ type }) => {
  // Placeholder height/width based on card type
  let figureHeight = "24px";       // default
  let figureWidth = "50%";

  if (type === "prediction") figureHeight = "36px"; // big number
  if (type === "trend") figureWidth = "70%";
  if (type === "alert") figureWidth = "80%";
  if (type === "budget") figureHeight = "28px";

    return (
    <div className="insight-card-placeholder">
      <div className="insight-skeleton icon" />

      <div className="insight-skeleton title" />

      <div
        className="insight-skeleton figure"
        style={{ width: figureWidth, height: figureHeight }}
      />
    </div>
  );
};

export default InsightCardPlaceholder;