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

import styles from './OrderItem.module.css';


import React from 'react';
import { JobOrder, ShopifyGraphQLOrder, WHOrder } from '../../../model/orders.model';
import fetchApi from '../../utils/fetchApi';

type OrderItemProps = {
    key: string;
    id: string;
    order:JobOrder;
    onPushOrder:(o:WHOrder)=>void;
    isManualMode:boolean;
    onFulfillOrder:(o:JobOrder)=>void;
}

const OrderItem = (props:OrderItemProps) => {

    const {order, onPushOrder, isManualMode, onFulfillOrder} = props;

    const pushToRm = (orderSelection:JobOrder) => {
        console.log('pushToRm orderId', orderSelection);
        const whOrder = convertGraphQlToWebHookOrder(orderSelection);        
        onPushOrder(whOrder);       
    }

    const fulfillOrder = (o:JobOrder) => {
        console.log('fulfillOrder', o);
        if(o.displayFulfillmentStatus !== 'UNFULFILLED') return;

        onFulfillOrder(o);
    }

    const convertGraphQlToWebHookOrder = (o:JobOrder):WHOrder => {
        return {
            id: o.id.replace('gid://shopify/Order/',''), // original format gid://shopify/Order/3772116238507
            test: false, // o.test
            app_id: 'flo app ID2',
            cancel_reason: o.cancelReason,
            cancelled_at: o.cancelledAt,
            currency: o.totalPriceSet.shopMoney.currencyCode,
            current_total_price: o.totalPriceSet.shopMoney.amount,
            total_price:o.totalPriceSet.shopMoney.amount,
            email: o.email,
            order_status_url: 'https://routemagnet.myshopify.com/order/12312897',
            shipping_address : o.shippingAddress ? {
                first_name:o.shippingAddress.firstName,
                address1:o.shippingAddress.address1,
                phone:o.phone ?? '',
                city:o.shippingAddress.city,
                zip:o.shippingAddress.zip,
                province:o.shippingAddress.provinceCode,
                country:o.shippingAddress.country,
                last_name:o.shippingAddress.lastName,
                address2:o.shippingAddress.address2,
                company:o.shippingAddress.address1, // no company in Shopify order
                latitude:o.shippingAddress.latitude,
                longitude:o.shippingAddress.longitude,
                name:o.shippingAddress.firstName ?? '' + ' ' + o.shippingAddress.lastName ?? '',
                country_code:o.shippingAddress.country,
                province_code:o.shippingAddress.provinceCode,
            } : null,
            customer: {
                email: o.customer.email,
                phone: o.customer.phone,
            },
            shipping_lines: o.shippingLines.edges.map(s => {
                return {
                    id: s.node.id,
                    carrier_identifier:s.node.carrierIdentifier,
                    code: s.node.code,
                    delivery_category: s.node.deliveryCategory,
                    discounted_price: s.node.discountedPriceSet.shopMoney.amount ?? 0 ,
                    phone: s.node.phone ?? '',
                    price: s.node.originalPriceSet.shopMoney.amount ?? 0,
                    quantity:1 ,
                    source: s.node.source ?? '',
                    title: s.node.title ?? '', 
                }
                }),
            line_items: o.lineItems.edges.map(s => {
                return {
                    id:s.node.id,
                    title:s.node.title,
                    quantity:s.node.quantity,
                    price: s.node.originalUnitPriceSet.shopMoney.amount ?? 0,
                    name: s.node.name,
                }
            })            
            }
        }
    
   const fulFillmentBlock = (o:JobOrder) => {
    if(o.displayFulfillmentStatus === 'UNFULFILLED') {
        return (
            <Stack.Item fill>
             <Button onClick={() => fulfillOrder(order)}>FulFill</Button>  
             </Stack.Item>
        );
    }
    return  (
    <Stack.Item fill>{ order.displayFulfillmentStatus} </Stack.Item>
    )
   }

    return (
        // @ts-ignore
        <ResourceList.Item>
            <Stack>
                <Stack.Item fill>
                <h3>
                    <TextStyle variation="strong">
                    {order.name}
                    </TextStyle>
                </h3>
                </Stack.Item>                      
                {                    
                        order?.job?.step?.customerLink ?
                        <Stack.Item fill><a target='_blank' href={order.job.step.customerLink}>Track Link</a> </Stack.Item>
                        :
                        <Stack.Item fill></Stack.Item>
                }
                 {                    
                       fulFillmentBlock(order)                        
                }
                <Stack.Item fill>
                <h3>
                    <TextStyle variation="strong">
                    
                    {
                     order?.job?.status ?
                        <React.Fragment>
                            <Badge>{order.job.status}</Badge>                             
                       </React.Fragment>
                         :
                        (order?.id ?
                            <Button onClick={() => pushToRm(order)}>
                            Push to RM
                          </Button>
                          :
                            <p>No Id</p>
                          )
                    }
                    </TextStyle>
                </h3>
                </Stack.Item>
          </Stack>
      </ResourceList.Item>
    )
}

export default OrderItem;