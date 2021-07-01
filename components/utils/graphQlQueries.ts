import gql from 'graphql-tag';

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

const GET_ORDERS = gql`
  query{
    orders(first: 5, reverse: true) {
    edges {
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
        clientIp
        confirmed
        fullyPaid
        note
        requiresShipping
        customer{
          email
          phone
        }
        totalPriceSet{
          shopMoney {
              amount
              currencyCode
            }
          }
        subtotalPriceSet{
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
        shippingLines(first: 5)
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
        lineItems(first: 2) {
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
  query{
    
  shop {
    primaryDomain {
      url
    }
  
}

  }`

export { GET_DOMAIN, GET_ORDERS, GET_PRODUCTS_BY_ID}