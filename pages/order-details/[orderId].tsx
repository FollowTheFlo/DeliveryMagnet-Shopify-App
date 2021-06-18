
import React, { useContext } from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {CircleTickMajor, ArrowLeftMinor, CirclePlusOutlineMinor, ArrowDownMinor} from '@shopify/polaris-icons';
import { Card, 
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Layout,
  ButtonGroup,
  Button,
  Page,
  Tabs,
  TextField,
  Heading,
  Badge,
} from '@shopify/polaris';

import AdminContext from '../../store/admin-context';
import { useRouter } from 'next/router';
import { JobOrder, WHOrder } from '../../model/orders.model';
import { Header } from '@shopify/polaris/dist/types/latest/src/components/Card/components';
import FulfillCard from '../../components/OrderList/OrderItem/fulfill-card/FulfillCard';
import RouteMagnetCard from '../../components/RouteMagnetCard/RouteMagnetCard';
import fetchApi from '../../components/utils/fetchApi';
import { RmJob } from '../../model/jobs.model';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';


const OrderDetails:React.FC = (props) => {

  const fulfillMapping = {
    FULFILLED:'Fulfilled',
    UNFULFILLED:'Unfulfilled'
  }
  
  const router = useRouter();
  const orderId = router.query.orderId;
  const adminCtx = useContext(AdminContext);
  const [order, setOrder] = useState<JobOrder>(null);

  useEffect(() => {
    const o = adminCtx.jobOrders.find(o => o.id === orderId);
    setOrder(o);
  },[])

  const onPushToRM = (whOrder:WHOrder) => {
    console.log('onPushToRM', whOrder);
    
  
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
        adminCtx.onJobOrderPush({...job});
        const o = adminCtx.jobOrders.find(o => o.id === orderId);
         setOrder(o);
      })
  }

  

  return order ? 
  <Page
  breadcrumbs={[{content: `order ${order.name}`, onAction: () => router.push("/") }]}
  title={`Order ${order.name}`}
  subtitle= {"Created at" + order?.createdAt + " - " + fulfillMapping[order.displayFulfillmentStatus ] + " - " + order?.job?.status ?? ""}

>
  <Layout>

  <Layout.Section>
    <FulfillCard
     order = {order}
    />
      
  </Layout.Section>
  <Layout.Section secondary>
    <RouteMagnetCard
     order = {order}
    />
  
  </Layout.Section>
  </Layout> </Page> :
  <p>Loading Order</p>
 
}


export default OrderDetails;