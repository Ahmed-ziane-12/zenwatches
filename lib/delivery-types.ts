export type DeliveryPrice = {
  home: number;
  desk: number;
};

export type DeliveryConfig = {
  shippingPrices: Record<string, DeliveryPrice>;
  officeLocations: Record<string, string[]>;
};
