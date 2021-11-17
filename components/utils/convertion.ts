import { JobOrder, WHOrder } from "../../model/orders.model";

const convertGraphQlToWebHookOrder = (
  o: JobOrder,
  domainCopy: string
): WHOrder => {
  return {
    id: o.id,
    test: false, // o.test
    app_id: "deliveryMagnet",
    name: o.name,
    cancel_reason: o.cancelReason,
    cancelled_at: o.cancelledAt,
    currency: o.totalPriceSet.shopMoney.currencyCode,
    current_total_price: o.totalPriceSet.shopMoney.amount,
    total_price: o.totalPriceSet.shopMoney.amount,
    email: o.email,
    order_status_url: `https://${domainCopy}/order/${o.id}`,
    shipping_address: o.shippingAddress
      ? {
          first_name: o.shippingAddress.firstName,
          address1: o.shippingAddress.address1,
          phone: o.phone ?? "",
          city: o.shippingAddress.city,
          zip: o.shippingAddress.zip,
          province: o.shippingAddress.provinceCode,
          country: o.shippingAddress.country,
          last_name: o.shippingAddress.lastName,
          address2: o.shippingAddress.address2,
          company: o.shippingAddress.address1, // no company in Shopify order
          latitude: o.shippingAddress.latitude,
          longitude: o.shippingAddress.longitude,
          name:
            o.shippingAddress.firstName ??
            "" + " " + o.shippingAddress.lastName ??
            "",
          country_code: o.shippingAddress.country,
          province_code: o.shippingAddress.provinceCode,
        }
      : null,
    customer: {
      email: o.customer.email,
      phone: o.customer.phone,
      firstName: o.customer.firstName,
      lastName: o.customer.lastName,
      id: o.customer.id,
    },
    shipping_lines: o.shippingLines.edges.map((s) => {
      return {
        id: s.node.id,
        carrier_identifier: s.node.carrierIdentifier,
        code: s.node.code,
        delivery_category: s.node.deliveryCategory,
        discounted_price: s.node.discountedPriceSet.shopMoney.amount ?? 0,
        phone: s.node.phone ?? "",
        price: s.node.originalPriceSet.shopMoney.amount ?? 0,
        quantity: 1,
        source: s.node.source ?? "",
        title: s.node.title ?? "",
      };
    }),
    line_items: o.lineItems.edges.map((s) => {
      return {
        id: s.node.id,
        title: s.node.title,
        quantity: s.node.quantity,
        price: s.node.originalUnitPriceSet.shopMoney.amount ?? 0,
        name: s.node.name,
      };
    }),
  };
};

export { convertGraphQlToWebHookOrder };
