import styles from './OrderList.module.css';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, { useEffect, useState, useCallback, useContext } from 'react';
// require("dotenv").config();
const axios = require('axios');
import Image from 'next/image';
import AdminContext from '../../store/admin-context'
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import gql from 'graphql-tag';
import { Query, useQuery, useLazyQuery, useApolloClient } from 'react-apollo';
import { Card,
    Button,
    IndexTable,
    useIndexResourceState,
    Pagination,
} from '@shopify/polaris';
import OrderItem from './OrderItem/OrderItem';
import { GET_DOMAIN, GET_ORDERS, GET_ORDERS_AFTER, GET_ORDERS_PREVIOUS, GET_PRODUCTS_BY_ID } from '../utils/graphQlQueries'
import fetchApi from '../utils/fetchApi';
import { JobOrder, ShopifyGraphQLOrder, WHOrder } from '../../model/orders.model';
import { RmJob, RmJobWithStep } from '../../model/jobs.model';
import { SuccessResponse } from '../../model/responses.model';
import { SelectionType } from '@shopify/polaris/dist/types/latest/src/utilities/index-provider';
import { CursorSelection, PageInfo, StatusAction } from '../../model/input.model';
import { convertGraphQlToWebHookOrder } from '../utils/convertion';


// const RM_SERVER_URL = process.env.NEXT_PUBLIC_RM_SERVER_URL;


const OrderList:React.FC =  (props) => {
console.log('flo OrderList');
// const RM_SERVER_URL = 'https://83e781cb2720.ngrok.io';
// const RM_SERVER_URL = process.env.NEXT_PUBLIC_RM_SERVER_URL;
// const client = useApolloClient();
   // const contextType = Context;


   const client = useApolloClient();
   
    // const [domain, setDomain] = useState('flo domain');
    const adminCtx = useContext(AdminContext);
    const router = useRouter();
   
    
    let preventRowSelection = false;
   // const [refreshDate, setRefreshDate] = useState<string>('');
    // inform on loading stage: requesting data on shopify or RM
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    let pageInfo:PageInfo = null;
    // const { loading, error, data, networkStatus } = useQuery(GET_DOMAIN);
    

   useEffect(() => {

      // don't fetch orders again if there are already loaded
      if(adminCtx.jobOrders.length > 0){
        console.log('dont refresh');
        return;
      }
     
      // fetch domain from shopify to know which store we dealing with
      client.query({ query: GET_DOMAIN }).then(domain => {
        console.log('domain', domain.data.shop.primaryDomain.url);
        if(domain.data.shop.primaryDomain.url){
          adminCtx.onDomainChange(domain.data.shop.primaryDomain.url);
          // once we have domain, run JobOrders that will fetch shopify orders then associated jobs from RM
          fetchJobOrders();
        }
      })
      .catch(err => console.log('err', err))
    }, [])

    const fetchJobOrders = (cursor?:CursorSelection) => {
      console.log('fetchJobOrders');
      setLoadingMessage('Loading Shopify Orders');
      // 1 -> fetch shopify orders 
      queryShopifyOrders(cursor)
      .then(shopifyOrders => {
        console.log('return queryShopifyOrders', shopifyOrders);
        setLoadingMessage('Loading RouteMagnet data');
        // 2 -> fetch Deliveries (called Jobs) on RM associated with shopify order IDs
        return queryRmOrders(shopifyOrders);
      })     
      .then(data => {
        console.log('return data', data);
        // fill context so data are avaialble accross the app
        adminCtx.onJobOrdersChange(data);
        console.log('pageInfo before ctx', pageInfo);
        // pageInfo is use for cursor-based Pagination, cursor based, shopify gives us hasNextPage hasPreviousPage booleans
        // see https://www.shopify.ca/partners/blog/graphql-pagination
        adminCtx.onPageInfoChange(pageInfo);
        // setRefreshDate(new Date().toLocaleString());
        adminCtx.onRefreshDateChange(new Date().toLocaleString());
        setLoadingMessage('');
      })
      .catch(errMessage => {
        console.log('err2', errMessage);
        // when failure, fill empty orders list
        adminCtx.onJobOrdersChange([]);
        setLoadingMessage(errMessage);
      })
    }

    const getStatusAction = (displayFulfillmentStatus:string, job:RmJobWithStep | null):StatusAction => {
      // status and associated action, use to display action button in Action column, if action is empty we display nothing
      // we have only 2 actions: Prepare Delivery when sattus Unfulfilled & Push to RM when status is ready for delivery
      if(displayFulfillmentStatus === 'UNFULFILLED') return {status:"UNFULFILLED", action:"PREPARE_DELIVERY"};
      if(displayFulfillmentStatus === 'FULFILLED' ){ 
          if(!job || !job.uId) return {status:"READY_FOR_DELIVERY", action:"PUSH_TO_ROUTEMAGNET"};
          if(job?.status === 'IN_WAITING_QUEUE') return {status:"IN_WAITING_QUEUE", action:""};
          if(job?.status === 'IN_PLANNER_BUILDER') return {status:"IN_PLANNER_BUILDER", action:""};
          if(job?.status === 'IN_ITINERARY_SAVED') return {status:"IN_ITINERARY_SAVED", action:""};
          if(job?.status === 'IN_ITINERARY_ASSIGNED') return {status:"IN_ITINERARY_ASSIGNED", action:""};
          if(job?.status === 'ITINERARY_STARTED') return {status:"ITINERARY_STARTED", action:""};
          if(job?.status === 'ON_THE_WAY') return {status:"ON_THE_WAY", action:""};
          if(job?.status === 'COMPLETED') return {status:"COMPLETED", action:""};
          if(job?.status === 'CANCELED') return {status:"CANCELED", action:""};
          if(job?.status === 'UNKNOWN') return {status:"UNKNOWN", action:""};
      }
      return {status:"UNKNOWN", action:""};
  }        
  
 


        const queryShopifyOrders = (cursor?:CursorSelection):Promise<ShopifyGraphQLOrder[]> => {
          // cursor is use for pagination in Graphql, see https://www.shopify.ca/partners/blog/graphql-pagination
            
           let gqlQuery = GET_ORDERS;
           // get GQL query according to pagination action: befor or after
           if(cursor?.action === 'after') (gqlQuery = GET_ORDERS_AFTER(cursor.value))
           if(cursor?.action === 'before') (gqlQuery = GET_ORDERS_PREVIOUS(cursor.value))
        
          // fetch Shopify orders with Graphl Apollo client, no-cache as we want to query server at each run
          return client.query({ query: gqlQuery, fetchPolicy: "no-cache" })
          .then(data => {
            // go through encapsulation data.data.orders.edges
            console.log('ordersdata', data);
          
            if(data?.data?.orders?.pageInfo) {
              console.log('set pageInfo');
              pageInfo = data.data.orders.pageInfo;
            }
            // node obj contains order data, cursor value is one parent above, to easily access it later, we add it in ShopifyGraphQLOrder obj
            // reformat date in friendly format
            const ordersList = data.data.orders.edges.map(o =>  {
              return {
                ...o.node,
                cursor:o.cursor,
                // createdAt = new Date(o.createdAt).toLocaleString('en-GB').replace(/(:\d{2}| [AP]M)$/, ""),
              }
            }) as ShopifyGraphQLOrder[];

            // format date with friendly form, eg: 17/06/2021, 15:07
            // note that this operation in map iterartor above give us 'Unknow Date', below is the workaround
            ordersList.forEach(o => {
              o.createdAt = new Date(o.createdAt).toLocaleString('en-GB').replace(/(:\d{2}| [AP]M)$/, "");             
            })
            return ordersList;
          })
          .catch(err => {
          //  return []
          console.log('queryShopifyOrders error', err);
           throw 'Error fetching Shopify Orders';
           
          })
        }

        const queryRmOrders = (ordersList:ShopifyGraphQLOrder[]):Promise<JobOrder[]> => {
          // fetch RM jobs list then bind it with Shopify Orders, binding based on index matching
          console.log('queryRmOrders', ordersList);          

          ordersList = ordersList.map(o => {
            // format id, we remove prefix 'gid://shopify/Order/' to get the unique id
            return {...o,id:o.id.replace('gid://shopify/Order/','')}
          })

          // list of shopify order ids, will be use to retrieve associated RM jobs.
          const orderIDsList = ordersList.map(o => o.id);
          // ordersList is string[] type
          console.log('queryRmOrders orderIDsList',orderIDsList);
          const obj =  {
            shop:"shop",
            orderIdsList:orderIDsList
        };
        // fetch RM jobs with shopify Ids as inputs. shopify id is stored as ExtId on RM Job object.
        return axios.post(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/orderslist/status`,
          JSON.stringify(obj))
        .then(response => {
          const jobs = response?.data as RmJobWithStep[];
          console.log('RmOrders:',JSON.stringify(jobs));

            const fullJobOrderList:JobOrder[] = ordersList.map((order,i) => ({
              ...order,
              job:jobs[i],
              statusAction:getStatusAction(order.displayFulfillmentStatus,jobs[i])
            }));      
        
            return fullJobOrderList.slice();
          })
          .catch(err => {
            console.log('err', err);
             throw 'Error fetching RouteMagnet data';
          })      
        }


        const onRefresh = () => {
            console.log('refresh');          
              fetchJobOrders();           
        }

        const onPushToRM = (jOrder:JobOrder) => {
          console.log('onPushToRM', jOrder);
          console.log('setPreventSel', true);
          console.log('domain', adminCtx.domain);
          preventRowSelection = true;
          // convert order in WebHook order format, RM is expecting this format. handy as WebHook also send order in this this format.
          const whOrder = convertGraphQlToWebHookOrder(jOrder,adminCtx.domain);
        
          fetchApi({
            method:'post',
            body:JSON.stringify(whOrder),
            url:`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add`,
          })
            .then(response => {
             
              // if error, returned Object has property error. check its presence
              if(response.error) {
                console.log(response.error);
                return;
              }
              const job = response as RmJob;
              console.log('push job', job);
              adminCtx.onJobOrderPush({...job});
            })
        }

        const onFulfillOneOrder = (o:JobOrder) => {
          preventRowSelection = true;
          const orderId = o.id;
          // use REST api to fulfill an order, send request to our NextJS server, the our server will request Shopify
          axios.post('/api/fulfillment',{
            action:'create',
            orderId,
            uId:o?.job?.uId ?? null,
          })
          .then(response => {
            const result = response?.data as SuccessResponse;
            console.log('response webhooks api', result);
            if(result.success) {
              onRefresh();
            }
                      
          })
          .catch(err => {
            console.log('err fulfillment', err);
          })
        }

        // shopify hook use to select element of the list, gives list of selected row
        const {
          selectedResources,
          allResourcesSelected,
          // @ts-ignore
        } = useIndexResourceState(adminCtx.jobOrders);

       const onSelectionChangeHandler = (selectionType: SelectionType, toggleType: boolean, selectedOrderId:any)  => {
          console.log('onSelectionChange',selectionType, toggleType,selectedOrderId);
          console.log('preventRowSelection', preventRowSelection);
          // preventRowSelection is true when we press Action button, in this scenario we don't want to select the row, we want button click method.
          // this flag allows us to handle those 2 scenario: row selection click and Action button click
          if(preventRowSelection) {
            console.log('in preventRowSelection condition');          
            preventRowSelection = false;
            return;
          }
          if(!selectedOrderId) return;
          // open order details page
          router.push(`/order-details/${selectedOrderId}`);
       }
       // display jobOrder rows form list
        const jobOrderRows = (list:JobOrder[]) => {
          console.log('rowMarkup');
          return list.map((o,i)=>{
          return <OrderItem
            index={i}
             key={o.id}
              id={o.id}
              order={o}
              onPushOrder={onPushToRM}
              onFulfillOrder={onFulfillOneOrder}
              isManualMode={adminCtx.mode.manual}
              domain={adminCtx.domain}
              selectedResources={selectedResources}
          />})
        }
      // grid is a polaris index-table : https://polaris.shopify.com/components/lists-and-tables/index-table#navigation
      const IndexTableBlock = () => {
        console.log('IndexTableBlock');
        return <IndexTable
        resourceName={{ singular: 'Order', plural: 'Orders' }}
        itemCount={adminCtx.jobOrders.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        selectable = {false}
        loading = {loadingMessage ? true : false}
        onSelectionChange={onSelectionChangeHandler}
        headings={[
          {title: 'Name'},
          {title: 'Created'},
          {title: 'Customer'},
          {title: 'Price'},
          {title: 'Payment'}, 
          {title: 'Status'},
          {title: 'Action'},
          {title: 'items'},
        ]}
      >
        {
          jobOrderRows(adminCtx.jobOrders.slice())
        }
      </IndexTable>
      }

      const onPaginationPrevious = () => {
        // pagination Previous button clicked, get first cursor of jobOrder list as we seek the page before it
        console.log('onPaginationPrevious');
        const firstCursor = adminCtx.jobOrders[0].cursor;
        if(!firstCursor)return;

        console.log('firstCursor',firstCursor);

        fetchJobOrders({
          action:'before',
          value:firstCursor
        })
      }
      const onPaginationNext = () => {
        // pagination Next button clicked, get last cursor of jobOrder list as we seek the page after it
        console.log('onPaginationNext');
        const lastCursor = adminCtx.jobOrders[adminCtx.jobOrders.length - 1].cursor;
        if(!lastCursor)return;

        console.log('lastCursor',lastCursor);

        fetchJobOrders({
          action:'after',
          value:lastCursor
        })
      }
  
      return (
        
        <React.Fragment>
          {/* <Image src="/me.png" alt="me" width={100} height={100} />          */}
         
          <div  className={styles.refreshMessage}>
                   <Button onClick={() => onRefresh()}>
                            Refresh
                    </Button>
                    </div>
                    {
                      !loadingMessage && <div  className={styles.refreshMessage}>Last refresh at {adminCtx.refreshDate}</div>
                    }
                    { 
                      loadingMessage && <div  className={styles.refreshMessage}>{loadingMessage}</div>
                    }
              <Card>
                  
                
               
              { adminCtx.jobOrders && adminCtx.jobOrders.length > 0 &&
              IndexTableBlock()
            
              }
              
               </Card>
               <Pagination
            hasPrevious={adminCtx.pageInfo.hasPreviousPage}
            onPrevious={onPaginationPrevious}
            hasNext={adminCtx.pageInfo.hasNextPage}
            onNext={onPaginationNext}
          />     

        </React.Fragment>
        )
 
    }
  
  
  export default OrderList;