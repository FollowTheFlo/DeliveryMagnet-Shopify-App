import { StatusAction } from "./input.model";
import { RmJob, RmJobWithStep } from "./jobs.model";

export interface JobOrder extends ShopifyGraphQLOrder {
  job: RmJobWithStep | null;
  statusAction: StatusAction | null;
}

export interface WHOrder {
  id: string;
  test: boolean;
  app_id: string;
  browser_ip?: string;
  cancel_reason: string;
  cancelled_at: string;
  currency: string;
  current_subtotal_price?: string;
  current_total_price: string;
  total_price: string;
  email: string;
  referring_site?: string;
  order_status_url: string;
  shipping_address: null | {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company: string;
    latitude: number;
    longitude: number;
    name: string;
    country_code: string;
    province_code: string;
  };
  customer: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    id: string;
  };
  shipping_lines: Shipping_line[];
  line_items: Line_item[];
}

export interface Shipping_line {
  id: string;
  carrier_identifier: string;
  code: string;
  delivery_category: string;
  discounted_price: string;
  phone: string;
  price: string;
  quantity: number;
  source: string;
  title: string;
}

export interface Line_item {
  id: string;
  title: string;
  quantity: number;
  price: number;
  name: string;
}

export interface ShopifySessionToken {
  iss: string;
  dest: string;
  aud: string;
  sub: string;
  exp: string;
  nbf: string;
  iat: string;
  jti: string;
  sid: string;
}

export interface ShopifyGraphQLOrder {
  cursor;
  id;
  name;
  displayFulfillmentStatus;
  displayFinancialStatus: string;
  test;
  cancelReason;
  createdAt;
  cancelledAt;
  email;
  phone;
  confirmed;
  fullyPaid;
  note;
  requiresShipping;
  fulfillmentOrders: {
    edges: [
      {
        node: {
          deliveryMethod: {
            id;
            methodType: "LOCAL" | "NONE" | "PICK_UP" | "RETAIL" | "SHIPPING";
          };
        };
      }
    ];
  };
  customer: {
    email;
    phone;
    firstName;
    lastName;
    id;
  };
  totalPriceSet: {
    shopMoney: {
      amount;
      currencyCode;
    };
  };
  shippingAddress: {
    address1;
    address2;
    city;
    provinceCode;
    zip;
    country;
    latitude;
    longitude;
    firstName;
    lastName;
  };
  shippingLines: {
    edges: [
      {
        node: {
          phone;
          carrierIdentifier;
          id;
          discountedPriceSet: {
            shopMoney: {
              amount;
            };
          };
          originalPriceSet: {
            shopMoney: {
              amount;
            };
          };
          deliveryCategory;
          source;
          code;
          title;
        };
      }
    ];
  };
  lineItems: {
    edges: [
      {
        node: LineItem;
      }
    ];
  };
}

export interface LineItem {
  id;
  title: string;
  quantity: number;
  fulfillmentStatus;
  sku: string;
  fulfillmentService: {
    location: {
      id;
      name;
    };
  };
  product: {
    id;
  };
  image: {
    id;
    originalSrc;
  };
  originalUnitPriceSet: {
    shopMoney: {
      amount;
    };
  };
  name;
}
