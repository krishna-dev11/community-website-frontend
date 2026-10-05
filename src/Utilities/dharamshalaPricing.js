export const getDharamshalaPrice = (room) => {
  if (room?.pricing?.publicPricePaise) return Math.round(room.pricing.publicPricePaise / 100);
  const price = Number(room?.pricePerNight);
  if (Number.isFinite(price) && price > 0) return price;

  return null;
};

export const formatDharamshalaPrice = (price, unavailableLabel = "Contact for pricing") => (
  price ? `₹${Number(price).toLocaleString("en-IN")}` : unavailableLabel
);
