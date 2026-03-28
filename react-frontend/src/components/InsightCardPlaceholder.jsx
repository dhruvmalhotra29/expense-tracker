const InsightCardPlaceholder = ({ type }) => {
  // Placeholder height/width based on card type
  let figureHeight = "24px";       // default
  let figureWidth = "50%";

  if (type === "prediction") figureHeight = "36px"; // big number
  if (type === "trend") figureWidth = "70%";
  if (type === "alert") figureWidth = "80%";
  if (type === "budget") figureHeight = "28px";

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
      }}
    >
      {/* Icon placeholder */}
      <div
        style={{
          width: "28px",
          height: "28px",
          backgroundColor: "#e0e0e0",
          borderRadius: "50%",
          marginBottom: "12px",
          animation: "pulse 1.5s infinite",
        }}
      />
      {/* Title placeholder */}
      <div
        style={{
          width: "60%",
          height: "18px",
          backgroundColor: "#e0e0e0",
          borderRadius: "4px",
          marginBottom: "8px",
          animation: "pulse 1.5s infinite",
        }}
      />
      {/* Figure / number placeholder */}
      <div
        style={{
          width: figureWidth,
          height: figureHeight,
          backgroundColor: "#e0e0e0",
          borderRadius: "4px",
          animation: "pulse 1.5s infinite",
        }}
      />
    </div>
  );
};

export default InsightCardPlaceholder;