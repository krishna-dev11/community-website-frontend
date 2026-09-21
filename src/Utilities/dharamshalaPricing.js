export const getDharamshalaPrice = (room) => {
  const price = Number(room?.pricePerNight);
  if (Number.isFinite(price) && price > 0) return price;

  const name = String(room?.name || "").toLowerCase();
  if (name.includes("hall")) return 3000;
  if (name.includes("non-ac") || name.includes("non ac")) return 800;
  if (name.includes("ac")) return 1200;
  return null;
};

export const formatDharamshalaPrice = (price, unavailableLabel = "Contact for pricing") => (
  price ? `₹${Number(price).toLocaleString("en-IN")}` : unavailableLabel
);
