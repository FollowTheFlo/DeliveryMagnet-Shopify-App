import styles from './OrderList.module.css';
import React, { useEffect, useState, useCallback, useContext } from 'react';
// require("dotenv").config();
const axios = require('axios');
import AdminContext from '../../store/admin-context'
import { authenticatedFetch } from '@shopify/app-bridge-utils';
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
import { JobOrder, ShopifyGraphQLOrder, WHOrder } from '../../model/orders.model';
import { RmJob, RmJobWithStep } from '../../model/jobs.model';
import { AdminContextType } from '../../model/context.model';
import { SuccessResponse } from '../../model/responses.model';

// const RM_SERVER_URL = process.env.NEXT_PUBLIC_RM_SERVER_URL;


const OrderList =  (props) => {
console.log('flo OrderList');
// const RM_SERVER_URL = 'https://83e781cb2720.ngrok.io';
// const RM_SERVER_URL = process.env.NEXT_PUBLIC_RM_SERVER_URL;
// const client = useApolloClient();
   // const contextType = Context;


   const client = useApolloClient();
   
    // const [domain, setDomain] = useState('flo domain');
    const adminCtx = useContext(AdminContext);
    
   
    // JobOrder is combination of Shopify Order with job property containing RouteMagnet Job obj
    // fetching jobOrders will need graphql Orders request to shopify + REST request to RM jobs
    // const [jobOrders, setJobOrders] = useState([]);
    const [refreshDate, setRefreshDate] = useState<string>('');
    // inform on loading stage: requesting data on shopify or RM
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    // const { loading, error, data, networkStatus } = useQuery(GET_DOMAIN);
    

    useEffect(() => {

      if(adminCtx.domain) {
        console.log('domain already set');
        return;
      }     

      console.log('flo useEffect');
            
      client.query({ query: GET_DOMAIN }).then(domain => {
        console.log('domain', domain.data.shop.primaryDomain.url);
        if(domain.data.shop.primaryDomain.url){
          adminCtx.onDomainChange(domain.data.shop.primaryDomain.url);
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
        adminCtx.onJobOrdersChange(data);
        setRefreshDate(new Date().toLocaleString());
        setLoadingMessage('');
      })
      .catch(errMessage => {
        console.log('err2', errMessage);
        adminCtx.onJobOrdersChange([]);
        setLoadingMessage(errMessage);
      })
    }


        const queryShopifyOrders = ():Promise<ShopifyGraphQLOrder[]> => {
            console.log('queryShopifyOrders');
           
          // Graphl Apollo client
          // fetch Shopify orders
          return client.query({ query: GET_ORDERS, fetchPolicy: "no-cache" })
          .then(data => {
            // go through encapsulation data.data.orders.edges
            console.log('ordersdata', data);
            const ordersList = data.data.orders.edges.map(o => o.node) as ShopifyGraphQLOrder[];
            return ordersList;
          })
          .catch(err => {
          //  return []
          console.log('queryShopifyOrders error', err);
           throw 'Error fetching Shopify Orders';
           
          })
        }

        const queryRmOrders = (ordersList:ShopifyGraphQLOrder[]):Promise<JobOrder[]> => {
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
          url:`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/orderslist/status`,
        })
          .then((jobs:RmJobWithStep[]) => {
            console.log('RmOrders:',JSON.stringify(jobs));
           // add associated RM job data to each shopify order, we have now all data we need: status on RM, track link...
           // list order item index order is ensure to be same as RM job index order, thus we map by index
            const fullJobOrderList:JobOrder[] = ordersList.map((order,i) => ({...order, job:jobs[i]}));      
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


        const onRefresh = () => {
            console.log('refresh');
            // const res = client.resetStore().then(res => {
            //   console.log('res apollo', res);
              fetchJobOrders();
           // })
           
        }


        const onPushToRM = (whOrder:WHOrder) => {
          console.log('onPushToRM', whOrder);
          // axios.post('/api/fulfillment',{action:'test',orderId:whOrder.id})
          // .then(response => {
          //   console.log('response fulfillment api', response);           
          // })
          // .catch(err => {
          //   console.log('err fulfillment', err);
          // })
        
          fetchApi({
            method:'post',
            body:JSON.stringify(whOrder),
            url:`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add`,
          })
            .then(response => {
              console.log('response job', response);
              // if error, object returned has property error
              if(response.error) {
                console.log(response.error);
                return;
              }
              const job = response as RmJob;

              
                // // get previous state
                // const prevJobOrders = [...adminCtx.jobOrders]; 
                // console.log('prev1',prevJobOrders);
                // const index = prevJobOrders.findIndex(o => (o && o.id && o.id.replace('gid://shopify/Order/','') == job.extId));
                // console.log('index prevJobOrders', index);
                // if(index != -1) {
                //   const updatedJob = {...prevJobOrders[index],job:{...job,step:null}} as JobOrder;            
                //   prevJobOrders[index] = updatedJob;
                //   console.log('prev2',prevJobOrders);  
                // }
                adminCtx.onJobOrderPush({...job});
            })
        }

        const onFulfillOneOrder = (o:JobOrder) => {
          const orderId = o.id.replace('gid://shopify/Order/','') 
          axios.post('/api/fulfillment',{action:'test',orderId})
          .then(response => {
            const result = response?.data as SuccessResponse;

            console.log('response webhooks api', result);
            console.log('response fulfillment api', response);
            if(result.success) {
              onRefresh();
            }
                      
          })
          .catch(err => {
            console.log('err fulfillment', err);
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
                 <p>Shop:{adminCtx.domain}</p>
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
              { adminCtx.jobOrders && adminCtx.jobOrders.length > 0 && <ResourceList
                showHeader={true}
                resourceName={{ singular: 'Order', plural: 'Orders' }}
                items={adminCtx.jobOrders}
                renderItem={(item,itemId, index) => {
                  const {id, name} = item;

                 // const price = item.variants.edges[0].node.price;
                  return (
                    <OrderItem
                      key={id}
                      id={id}
                      order={item}
                      onPushOrder={onPushToRM}
                      onFulfillOrder={onFulfillOneOrder}
                      isManualMode={adminCtx.mode.manual}             
                    />
                   );
                 }}
               />}
               </Card>            

</React.Fragment>
        )
 
    }
  
  
  export default OrderList;