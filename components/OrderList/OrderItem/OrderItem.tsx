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
    Collapsible,
    IndexTable
} from '@shopify/polaris';

import styles from './OrderItem.module.css';


import React, { useCallback, useState } from 'react';
import { JobOrder, ShopifyGraphQLOrder, WHOrder } from '../../../model/orders.model';
import fetchApi from "../../utils/fetchApi";
import LineItem from './lineItem/LineItem';
import LineItemBlock from './lineItem/LineItem';

const fulfillMapping = {
    FULFILLED:"Yes",
    UNFULFILLED:"No",
}

type OrderItemProps = {   
    id: string;
    order:JobOrder;
    onPushOrder:(o:WHOrder)=>void;
    isManualMode:boolean;
    onFulfillOrder:(o:JobOrder)=>void;
    domain:string;
    index:number;
    selectedResources:string[];
}

const OrderItem = (props:OrderItemProps) => {

    const {selectedResources, index, order, onPushOrder, isManualMode, onFulfillOrder,domain} = props;
    const [open, setOpen] = useState(false);
    const handleToggle =() => {
        console.log('flo');
        setOpen((open) => !open);
    };


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
            id: o.id, 
            test: false, // o.test
            app_id: 'routeMagnet',
            cancel_reason: o.cancelReason,
            cancelled_at: o.cancelledAt,
            currency: o.totalPriceSet.shopMoney.currencyCode,
            current_total_price: o.totalPriceSet.shopMoney.amount,
            total_price:o.totalPriceSet.shopMoney.amount,
            email: o.email,
            order_status_url: `${domain}/order/${o.id}`,
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
            <IndexTable.Cell >
             <Button onClick={() => fulfillOrder(order)}>FulFill</Button>  
             </IndexTable.Cell>
        );
    }
    return  (
    <IndexTable.Cell >{ fulfillMapping[order.displayFulfillmentStatus]} </IndexTable.Cell>
    )
   }

   const lineItemsBlock = (o:JobOrder) => {
       const lineItems = o.lineItems.edges
        .map(li => li.node);

    return lineItems.map((li,i) => {
        return <LineItemBlock
            key={i.toString()}
            lineItem={li}
        />
            }
    )
        
   }

    return (
        // @ts-ignore
        <IndexTable.Row
        id={props.id}       
        selected={selectedResources.includes(props.id)}
        position={index}
        //   onClick={() => {
        //     // store.set('item', item);
        //     handleToggle();
        //     }}
        >
           
          
                <IndexTable.Cell >
             
                    <TextStyle variation="strong">
                    {order.name}
                    </TextStyle>
                      

                </IndexTable.Cell>
                <IndexTable.Cell>
                    {order?.createdAt}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}
                </IndexTable.Cell>                             
               
                 {                    
                       fulFillmentBlock(order)                        
                }
                <IndexTable.Cell>
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
                            Ready for Delivery
                          </Button>
                          :
                            <p>No Id</p>
                          )
                    }
                    </TextStyle>
                </h3>
                </IndexTable.Cell>
         
      </IndexTable.Row>
    )
}

export default OrderItem;