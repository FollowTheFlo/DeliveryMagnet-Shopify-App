import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import { Query, useQuery, useLazyQuery, useApolloClient } from 'react-apollo';
import { Card,
    ResourceList,
    Stack,
    TextStyle,
    Thumbnail,
    ButtonGroup,
    Button,
} from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context, useAppBridge } from '@shopify/app-bridge-react';

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
    orders(first: 15, reverse: true) {
    edges {
      node {
        id
        name
        displayFulfillmentStatus

        lineItems(first: 50) {
          edges {
            node {
              id
              title
              fulfillmentService {
                id
                location {
                  id
                  name
                }
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

const ResourceListWithProducts = (props) => {
console.log('flo ResourceListWithProducts');

// const client = useApolloClient();
   // const contextType = Context;
   const client = useApolloClient();
    const app = useAppBridge();
    const [domain, setDomain] = useState('flo domain');
    const [rmOrders, setRmOrders] = useState([]);
    const { loading, error, data, networkStatus } = useQuery(GET_DOMAIN);
    const [exeGetDomain, { dLoading, dError, dData }] = useLazyQuery(GET_DOMAIN);
    
    useEffect(() => {
      console.log('flo useEffect');
      client.query({ query: GET_DOMAIN }).then(domain => {
        console.log('domain', domain.data.shop.primaryDomain.url);
        if(domain.data.shop.primaryDomain.url){
          setDomain(domain.data.shop.primaryDomain.url);
        }
      })
      .catch(err => console.log('err', err))
    }, [])
    // if (loading) return 'Loading...';
    // if (error) return `Error! ${error.message}`;         
  
 
      //  const app = Context.;
        const redirectToProduct = () => {
          const redirect = Redirect.create(app);
          redirect.dispatch(
            Redirect.Action.APP,
            '/edit-products',
          );
        };

        const queryShopifyOrders = () => {
          client.query({ query: GET_ORDERS }).then(data => {
            console.log('ordersdata', data)
            const idsList = data.data.orders.edges.map(o => o.node.id.replace('gid://shopify/Order/',''));
            console.log('idsList',idsList);
            queryRmOrders(idsList);
          })
          .catch(err => console.log('err', err))
        }

        const queryRmOrders = (ordersList) => {
          //ordersList ist is string[]
          const obj =  {
            shop:"shop",
            orderIdsList:ordersList
        };

        return fetch('https://route-magnet.herokuapp.com/shopify/orderslist/status',{
            
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(obj)
            
          })
          .then(response => response.json())
          .then(data => {
            console.log('RmOrders:',JSON.stringify(data));
            setRmOrders(data);                 
          });       
        }

        const buttonClick = (orderId, shop) => {
          console.log('buttonClick', orderId);

          queryShopifyOrders();

        //   const obj =  {
        //     shop:"shop",
        //     orderId:orderId.replace('gid://shopify/Order/','')
        // };

        //   fetch('https://route-magnet.herokuapp.com/shopify/order/status',{
            
        //       method: 'post',
        //       headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //       },
        //       body: JSON.stringify(obj)
            
        //   })
        //   .then(response => response.json())
        //   .then(data => {
        //     console.log('pickedAt:',data.pickedAt);
        //     console.log('routeId:',data.routeId);
        //   });       
        
          // if (app) {
          //   app.getState()
          //   .then((state) => {
          //     console.log(state);
          //     console.log(state.sessionToken);
          //   })
          //   .catch(err =>  console.log(err))
          // }

          // exeGetDomain();
          // console.log('lodLoadingading', dLoading);
          // console.log('dError', dError);
          // console.log('dData', dData);

          // const { yloading, yerror, ydata, ynetworkStatus} = 

          // console.log('ydata', ydata);
          // console.log('yerror', yerror);

         

          // fetch('/api/fetch-order', {
          //   method: 'GET', // *GET, POST, PUT, DELETE, etc.
          //   mode: 'cors', // no-cors, *cors, same-origin
          //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          //   credentials: 'same-origin', // include, *same-origin, omit
          //   headers: {
          //     'Content-Type': 'application/json'
          //     // 'Content-Type': 'application/x-www-form-urlencoded',
          //   }})
          // .then(response => {
          // return response.text();
          //   }
          // ).then(res => {
          //   console.log('res', res);
          // })
        }

        const  getDomain = () => {
          console.log('getDomain');
          const { loading, error, data } = useQuery(GET_DOMAIN);
        
          // if (loading) return 'Loading...';
          // if (error) return `Error! ${error.message}`;         
        
          console.log('networkStatus', networkStatus);
          console.log('loading', loading);
          console.log('error', error);
          console.log('data', data);
        }


        const twoWeeksFromNow = new Date(Date.now() + 12096e5).toDateString();
      return (
        
      
           
        <Query query={GET_ORDERS}>
          {({ data, loading, error }) => {
            if (loading) return <div>Loading…</div>;
            if (error) return <div>{error.message}</div>;
           
            return (
              
              <Card>
                 <p>{domain}</p>
               <ResourceList
                showHeader
                resourceName={{ singular: 'Order', plural: 'Orders' }}
                items={data.orders.edges.map(o => o.node)}
                renderItem={(item,itemId, index) => {
                  const {id, name} = item;
                  // const media = (
                  //   <Thumbnail
                  //     source={
                  //       item.images.edges[0]
                  //         ? item.images.edges[0].node.originalSrc
                  //         : ''
                  //     }
                  //     alt={
                  //       item.images.edges[0]
                  //         ? item.images.edges[0].node.altText
                  //         : ''
                  //     }
                  //   />
                  // );
                 // const price = item.variants.edges[0].node.price;
                  return (
                    <ResourceList.Item
                      id={id}                      
                      accessibilityLabel={`View details for ${name}`}
                      // onClick={() => {
                      //  // store.set('item', item);
                      //   redirectToProduct();
                      // }}
                    >
                      <Stack>
                        <Stack.Item fill>
                          <h3>
                            <TextStyle variation="strong">
                              {name}
                            </TextStyle>
                          </h3>
                        </Stack.Item>
                        <Stack.Item fill>
                        <ButtonGroup segmented>
                          <Button onClick={() => buttonClick(id, domain)}>
                            Check RMagnet
                          </Button>                        
                        </ButtonGroup>
                        </Stack.Item>
                        <Stack.Item fill>
                          <h3>
                            <TextStyle variation="strong">
                             
                            {
                               rmOrders && rmOrders[index] && rmOrders[index].status &&
                               <Badge>{rmOrders[index].status}</Badge>
                               
                            }
                            </TextStyle>
                          </h3>
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                  );
                }}
              />
              </Card>
            );
          }}
        </Query>)
 
    }
  
  
  export default ResourceListWithProducts;