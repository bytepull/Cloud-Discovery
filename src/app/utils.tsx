export const baseAWSUrl = "https://pricing.us-east-1.amazonaws.com";
export const offersAWSUrl = "/offers/v1.0/aws/index.json";
export const regionsAWSUrl = "/current/region_index.json";

export interface Offers {
  formatVersion: string;
  disclaimer: string;
  publicationDate: string;
  offers: {
    [key: string]: Offer;
  };
}

interface Offer {
  [key: string]: string;
}

export interface Regions {
  [key: string]: {
    [key: string]: string;
  };
}

interface Attribute {
  [key: string]: string;
}

interface Product {
  sku: string;
  productFamily: string;
  attributes: Attribute;
}

export interface PriceDimensions {
  rateCode: string;
  description: string;
  beginRange: string;
  endRange: string;
  unit: string;
  pricePerUnit: {
    [key: string]: string;
  };
  appliesTo: [];
}

export interface PricingData {
  formatVersion: string;
  disclaimer: string;
  offerCode: string;
  version: string;
  publicationDate: string;
  products: {
    [key: string]: Product;
  };
  terms: {
    // OnDemand, Reserved, ...
    [key: string]: {
      // SKU: RACFGSRGMXAJUC8H
      [key: string]: {
        // Offer Code: RACFGSRGMXAJUC8H.JRTCKXETXF
        [key: string]: {
          offerTermCode: string;
          sku: string;
          effectiveDate: string;
          priceDimensions: {
            // Price Dimension: RACFGSRGMXAJUC8H.JRTCKXETXF.6YS6EN2CT7
            [key: string]: PriceDimensions;
          };
        };
      };
    };
  };
}
