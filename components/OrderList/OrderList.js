import styles from './OrderList.module.css';
import React, { useEffect, useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { Query, useQuery, useLazyQuery, useApolloClient } from 'react-apollo';
import { Card,
    ResourceList,
    Stack,
    TextStyle,
    Thumbnail,
    ButtonGroup,
    Button,
    Tabs,
    TextField,
    Heading,
    Badge,
} from '@shopify/polaris';
import OrderItem from './OrderItem/OrderItem';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context, useAppBridge } from '@shopify/app-bridge-react';
import { GET_DOMAIN, GET_ORDERS, GET_PRODUCTS_BY_ID } from '../utils/graphQlQueries'
import fetchApi from '../utils/fetchApi';


const OrderList = (props) => {
console.log('flo OrderList');

// const client = useApolloClient();
   // const contextType = Context;
   const client = useApolloClient();
    const app = useAppBridge();
    const [domain, setDomain] = useState('flo domain');
    
    // JobOrder is combination of Shopify Order with job property containing RouteMagnet Job obj
    // fetching jobOrders will need graphql Orders request to shopify + REST request to RM jobs
    const [jobOrders, setJobOrders] = useState([]);
    const [refreshDate, setRefreshDate] = useState('');
    // inform on loading stage: requesting data on shopify or RM
    const [loadingMessage, setLoadingMessage] = useState('');
    const { loading, error, data, networkStatus } = useQuery(GET_DOMAIN);
    
    useEffect(() => {
      console.log('flo useEffect');
      client.query({ query: GET_DOMAIN }).then(domain => {
        console.log('domain', domain.data.shop.primaryDomain.url);
        if(domain.data.shop.primaryDomain.url){
          setDomain(domain.data.shop.primaryDomain.url);
          fetchJobOrders();
        }
      })
      .catch(err => console.log('err', err))
    }, [])

    const fetchJobOrders = () => {
      console.log('fetchJobOrders');
      setLoadingMessage('Loading Shopify Orders');
      queryShopifyOrders()
      .then(shopifyOrders => {
        console.log('return queryShopifyOrders', shopifyOrders);
        setLoadingMessage('Loading RouteMagnet data');
        return queryRmOrders(shopifyOrders);
      })     
      .then(data => {
        console.log('return data', data);        
        setJobOrders(data);
        setRefreshDate(new Date().toLocaleString());
        setLoadingMessage('');
      })
      .catch(errMessage => {
        console.log('err2', errMessage);
        setJobOrders([]);
        setLoadingMessage(errMessage);
      })
    }


        const queryShopifyOrders = () => {
            console.log('queryShopifyOrders');
           
          // Graphl Apollo client
          // fetch Shopify orders
          return client.query({ query: GET_ORDERS })
          .then(data => {
            console.log('ordersdata', data);
            const ordersList = data.data.orders.edges.map(o => o.node);
            return ordersList;
          })
          .catch(err => {
          //  return []
          console.log('queryShopifyOrders error', err);
           throw 'Error fetching Shopify Orders';
           
          })
        }

        const queryRmOrders = (ordersList) => {
          console.log('queryRmOrders', ordersList);
          // const {orderIDsList, ordersList} = params;

          const orderIDsList = ordersList.map(o => o.id.replace('gid://shopify/Order/',''));
          //ordersList ist is string[]
          console.log('queryRmOrders orderIDsList',orderIDsList);
          const obj =  {
            shop:"shop",
            orderIdsList:orderIDsList
        };       

        return fetchApi({
          method:'post',
          body:JSON.stringify(obj),
          url:'https://route-magnet.herokuapp.com/shopify/orderslist/status',
        })
          .then(jobs => {
            console.log('RmOrders:',JSON.stringify(jobs));
           // add associated RM job data to each shopify order, we have now all data we need: status on RM, track link...
           // list order item index order is ensure to be same as RM job index order, thus we map by index
            const fullJobOrderList = ordersList.map((order,i) => ({...order, job:jobs[i]}));      
         //   setJobOrders(fullJobOrderList.slice());
            return fullJobOrderList.slice();
          
           
           
          })
          .catch(err => {
            console.log('err', err);
             throw 'Error fetching RouteMagnet data';
          //  return [];
            // setLoadingMessage('Error loading Routemagnet data: ', err);
          })      
        }


        const  getDomain = () => {
          console.log('getDomain');
          const { loading, error, data } = useQuery(GET_DOMAIN);
        
        }

        const onRefresh = () => {
            console.log('refresh');
            fetchJobOrders();
        }

        const onPushToRM = (whOrder) => {
          console.log('onPushToRM', whOrder);
          fetchApi({
            method:'post',
            body:JSON.stringify(whOrder),
            url:'https://route-magnet.herokuapp.com/shopify/order/add',
          })
            .then(response => {
              console.log('response', response);
            })
        }
  
      return (
        
        <React.Fragment>
              <Card>
                  <div  className={styles.refreshMessage}>
                   <Button onClick={() => onRefresh()}>
                            Refresh
                    </Button>
                    </div>
                    <div  className={styles.refreshMessage}>Last refresh at {refreshDate}</div>
                    { 
                      loadingMessage && <div  className={styles.refreshMessage}>{loadingMessage}</div>
                    }
                 <p>Shop:{domain}</p>
                 {/* <ResourceList>
                    <Stack>
                        <Stack.Item fill>
                            Order Id
                        </Stack.Item>
                    </Stack>
                    <Stack>
                        <Stack.Item fill>
                            Link
                        </Stack.Item>
                    </Stack>
                    <Stack>
                        <Stack.Item fill>
                            RouteMagnet Status
                        </Stack.Item>
                    </Stack>
                 </ResourceList> */}
              { jobOrders && jobOrders.length > 0 && <ResourceList
                showHeader={true}
                resourceName={{ singular: 'Order', plural: 'Orders' }}
                items={jobOrders}
                renderItem={(item,itemId, index) => {
                  const {id, name} = item;

                 // const price = item.variants.edges[0].node.price;
                  return (
                    <OrderItem
                      key={id}
                      id={id}
                      order={item}
                      onPush={onPushToRM}               
                    />
                   );
                 }}
               />}
               </Card>            

</React.Fragment>
        )
 
    }
  
  
  export default OrderList;