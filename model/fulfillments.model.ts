export interface FulFillmentInput {
    action: string;
    orderId: string;
}

export interface ShopifyOrderFullFillment {
  id: number,
          order_id: number,
          status: string,
          created_at: string,
          service: string,
          updated_at: string,
          tracking_company: string,
          shipment_status: string,
          location_id: number,
          line_items: [
            {
              id: number,
              variant_id: number,
              title: string,
              quantity: number,
              sku: string,
              variant_title: string,
              vendor: string,
              fulfillment_service: string,
              product_id: number,
              requires_shipping: boolean,
              taxable: boolean,
              gift_card: boolean,
              name: string,
              variant_inventory_management: string,
              properties: [],
              product_exists: boolean,
              fulfillable_quantity: number,
              grams: number,
              price: string,
              total_discount: string,
              fulfillment_status: string,
              price_set: {
                shop_money: {
                  amount: string,
                  currency_code: string
                },
                presentment_money: {
                  amount: string,
                  currency_code: string
                }
              },
              total_discount_set: {
                shop_money: {
                  amount: string,
                  currency_code: string
                },
                presentment_money: {
                  amount: string,
                  currency_code: string
                }
              },
              discount_allocations: any[],
              admin_graphql_api_id: string,
              tax_lines: any[]
            }
          ],
          tracking_number: string,
          tracking_numbers: [
            string
          ],
          tracking_url: string,
          tracking_urls: [
            string
          ],
          receipt: any,
          name: string,
          admin_graphql_api_id: string
}
export interface ShopifyOrderFullFillments {
    fulfillments: ShopifyOrderFullFillment[
       
      ]
}
