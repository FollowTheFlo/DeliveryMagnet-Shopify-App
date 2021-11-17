import gql from "graphql-tag";

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

const GET_ORDERS = (itemPerpage: number, filterQuery: string) => gql`

  query {
    orders(first: ${itemPerpage}, reverse: true, query: "${filterQuery}") {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          id
          name
          displayFulfillmentStatus
          displayFinancialStatus
          test
          createdAt
          cancelReason
          cancelledAt
          email
          phone
          confirmed
          fullyPaid
          note
          requiresShipping
          fulfillmentOrders(first: 2) {
            edges {
              node {
                deliveryMethod {
                  id
                  methodType
                }
              }
            }
          }
          customer{
          email
          phone
          firstName
          lastName
          id
        }
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          shippingAddress {
            address1
            address2
            city
            provinceCode
            zip
            country
            latitude
            longitude
            firstName
            lastName
          }
          shippingLines(first: 2) {
            edges {
              node {
                phone
                carrierIdentifier
                id
                discountedPriceSet {
                  shopMoney {
                    amount
                  }
                }
                originalPriceSet {
                  shopMoney {
                    amount
                  }
                }
                deliveryCategory
                source
                code
                title
              }
            }
          }
          lineItems(first: 5) {
            edges {
              node {
                id
                title
                fulfillmentStatus
                image {
                  id
                  originalSrc
                }
                fulfillmentService {
                  location {
                    id
                    name
                  }
                }
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                  }
                }
                name
                sku
                product {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_ORDERS_AFTER = (
  itemPerpage: number,
  cursorVal: string,
  filterQuery: string
) => gql`
  query{
    orders(first: ${itemPerpage}, reverse: true, query: "${filterQuery}",after:"${cursorVal}") {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
     edges {
        cursor
        node {
        id
        name
        displayFulfillmentStatus
        displayFinancialStatus
        test
        createdAt
        cancelReason
        cancelledAt
        email
        phone    
        confirmed
        fullyPaid
        note
        requiresShipping
        fulfillmentOrders(first: 2) {
            edges {
              node {
                deliveryMethod {
                  id
                  methodType
                }
              }
            }
          }
          customer{
          email
          phone
          firstName
          lastName
          id
        }
        totalPriceSet{
          shopMoney {
              amount
              currencyCode
            }
          }    
        shippingAddress {
          address1
          address2
          city
          provinceCode
          zip          
          country
          latitude
          longitude
          firstName
          lastName
        }        
        shippingLines(first: 2)
        {
           edges {
              node{
                phone
                carrierIdentifier
                 id
                discountedPriceSet {
                    shopMoney {
                    amount
                    }
                }
                originalPriceSet {
                    shopMoney {
                    amount
                    }
                }             
                deliveryCategory
                source
                code
                title             
        	  }
          }
        }
        lineItems(first: 5) {
          edges {
            node {              
              id
              title
              fulfillmentStatus             
              image {
                id
                originalSrc
              }
              fulfillmentService {
                  location {
                    id
                    name
                  }
                }
              quantity
              originalUnitPriceSet {
                  shopMoney {
                      amount
                  }
              }
              name
              sku
              product {
                id
              }       
            }
          }
        }
      }
    }
  }
}
`;

const GET_ORDERS_PREVIOUS = (
  itemPerpage: number,
  cursorVal: string,
  filterQuery: string
) => gql`
  query{
    orders(last: ${itemPerpage}, reverse: true,query: "${filterQuery}",before:"${cursorVal}") {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
     edges {
        cursor
        node {
        id
        name
        displayFulfillmentStatus
        displayFinancialStatus
        test
        createdAt
        cancelReason
        cancelledAt
        email
        phone    
        confirmed
        fullyPaid
        note
        requiresShipping
        fulfillmentOrders(first: 2) {
            edges {
              node {
                deliveryMethod {
                  id
                  methodType
                }
              }
            }
          }
        customer{
          email
          phone
          firstName
          lastName
          id
        }
        totalPriceSet{
          shopMoney {
              amount
              currencyCode
            }
          }    
        shippingAddress {
          address1
          address2
          city
          provinceCode
          zip          
          country
          latitude
          longitude
          firstName
          lastName
        }        
        shippingLines(first: 2)
        {
           edges {
              node{
                phone
                carrierIdentifier
                 id
                discountedPriceSet {
                    shopMoney {
                    amount
                    }
                }
                originalPriceSet {
                    shopMoney {
                    amount
                    }
                }             
                deliveryCategory
                source
                code
                title             
        	  }
          }
        }
        lineItems(first: 5) {
          edges {
            node {              
              id
              title
              fulfillmentStatus             
              image {
                id
                originalSrc
              }
              quantity
              fulfillmentService {
                  location {
                    id
                    name
                  }
                }
              originalUnitPriceSet {
                  shopMoney {
                      amount
                  }
              }
              name
              sku
              product {
                id
              }       
            }
          }
        }
      }
    }
  }
}
`;

const GET_DOMAIN = gql`
  query {
    shop {
      primaryDomain {
        url
      }
      myshopifyDomain
    }
  }
`;

const GET_ONE_ORDER = (orderId: string) => gql`

  query {
    order(id:"${orderId}") {
          id
          name
          displayFulfillmentStatus
          displayFinancialStatus
          test
          createdAt
          cancelReason
          cancelledAt
          email
          phone
          confirmed
          fullyPaid
          note
          requiresShipping
          fulfillmentOrders(first: 2) {
            edges {
              node {
                deliveryMethod {
                  id
                  methodType
                }
              }
            }
          }
          customer{
          email
          phone
          firstName
          lastName
          id
        }
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          shippingAddress {
            address1
            address2
            city
            provinceCode
            zip
            country
            latitude
            longitude
            firstName
            lastName
          }
          shippingLines(first: 2) {
            edges {
              node {
                phone
                carrierIdentifier
                id
                discountedPriceSet {
                  shopMoney {
                    amount
                  }
                }
                originalPriceSet {
                  shopMoney {
                    amount
                  }
                }
                deliveryCategory
                source
                code
                title
              }
            }
          }
          lineItems(first: 15) {
            edges {
              node {
                id
                title
                fulfillmentStatus
                image {
                  id
                  originalSrc
                }
                fulfillmentService {
                  location {
                    id
                    name
                  }
                }
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                  }
                }
                name
                sku
                product {
                  id
                }
              }
            }
          }
    }
  }
`;

export {
  GET_DOMAIN,
  GET_ORDERS,
  GET_ORDERS_AFTER,
  GET_ORDERS_PREVIOUS,
  GET_PRODUCTS_BY_ID,
  GET_ONE_ORDER,
};
