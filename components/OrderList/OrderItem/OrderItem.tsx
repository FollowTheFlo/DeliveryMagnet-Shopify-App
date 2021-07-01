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
    IndexTable,
    Spinner
} from '@shopify/polaris';

import styles from './OrderItem.module.css';


import React, { useCallback, useState } from 'react';
import { JobOrder, ShopifyGraphQLOrder, WHOrder } from '../../../model/orders.model';
import fetchApi from "../../utils/fetchApi";
import LineItem from './lineItem/LineItem';
import LineItemBlock from './lineItem/LineItem';
import { StatusAction } from '../../../model/input.model';
import {wordsMapping, currencyMapping, paidStatusMapping} from '../../utils/mapping';
import { convertGraphQlToWebHookOrder } from '../../utils/convertion';



type OrderItemProps = {   
    id: string;
    order:JobOrder;
    onPushOrder:(o:JobOrder)=>void;
    isManualMode:boolean;
    onFulfillOrder:(o:JobOrder)=>void;
    domain:string;
    index:number;
    selectedResources:string[];
}


const OrderItem = (props:OrderItemProps) => {

    const {selectedResources, index, order, onPushOrder, isManualMode, onFulfillOrder,domain} = props;
    const [open, setOpen] = useState(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const handleToggle =() => {
        console.log('flo');
        setOpen((open) => !open);
    };


    const pushToRm = (orderSelection:JobOrder) => {
        console.log('pushToRm orderId', orderSelection);
        setBtnLoading(true);        
        onPushOrder(orderSelection);
        setBtnLoading(false);      
    }

    const fulfillOrder = (o:JobOrder) => {
        console.log('fulfillOrder', o);
        if(o.displayFulfillmentStatus !== 'UNFULFILLED') return;
        setBtnLoading(true);
        onFulfillOrder(o);
        setBtnLoading(false);
    }

    // const convertGraphQlToWebHookOrder = (o:JobOrder, domainCopy:string):WHOrder => {
       
    //     return {
    //         id: o.id, 
    //         test: false, // o.test
    //         app_id: 'routeMagnet',
    //         cancel_reason: o.cancelReason,
    //         cancelled_at: o.cancelledAt,
    //         currency: o.totalPriceSet.shopMoney.currencyCode,
    //         current_total_price: o.totalPriceSet.shopMoney.amount,
    //         total_price:o.totalPriceSet.shopMoney.amount,
    //         email: o.email,
    //         order_status_url: `${domainCopy}/order/${o.id}`,
    //         shipping_address : o.shippingAddress ? {
    //             first_name:o.shippingAddress.firstName,
    //             address1:o.shippingAddress.address1,
    //             phone:o.phone ?? '',
    //             city:o.shippingAddress.city,
    //             zip:o.shippingAddress.zip,
    //             province:o.shippingAddress.provinceCode,
    //             country:o.shippingAddress.country,
    //             last_name:o.shippingAddress.lastName,
    //             address2:o.shippingAddress.address2,
    //             company:o.shippingAddress.address1, // no company in Shopify order
    //             latitude:o.shippingAddress.latitude,
    //             longitude:o.shippingAddress.longitude,
    //             name:o.shippingAddress.firstName ?? '' + ' ' + o.shippingAddress.lastName ?? '',
    //             country_code:o.shippingAddress.country,
    //             province_code:o.shippingAddress.provinceCode,
    //         } : null,
    //         customer: {
    //             email: o.customer.email,
    //             phone: o.customer.phone,
    //         },
    //         shipping_lines: o.shippingLines.edges.map(s => {
    //             return {
    //                 id: s.node.id,
    //                 carrier_identifier:s.node.carrierIdentifier,
    //                 code: s.node.code,
    //                 delivery_category: s.node.deliveryCategory,
    //                 discounted_price: s.node.discountedPriceSet.shopMoney.amount ?? 0 ,
    //                 phone: s.node.phone ?? '',
    //                 price: s.node.originalPriceSet.shopMoney.amount ?? 0,
    //                 quantity:1 ,
    //                 source: s.node.source ?? '',
    //                 title: s.node.title ?? '', 
    //             }
    //             }),
    //         line_items: o.lineItems.edges.map(s => {
    //             return {
    //                 id:s.node.id,
    //                 title:s.node.title,
    //                 quantity:s.node.quantity,
    //                 price: s.node.originalUnitPriceSet.shopMoney.amount ?? 0,
    //                 name: s.node.name,
    //             }
    //         })            
    //         }
    //     }

    

    const statusCol = (o:JobOrder) => {
       // const statusAction = getStatusAction(o);
        const status = o.statusAction.status === 'UNFULFILLED' ||  o.statusAction.status === 'READY_FOR_DELIVERY' ? 'attention' : 'info';
        return  (
        <Badge status={status}>{ wordsMapping[o.statusAction.status]}</Badge>    
        )
    }
    const actionCol = (o:JobOrder) => {
       // const statusAction = getStatusAction(o);
       console.log('status flo',o.statusAction);
       if(btnLoading) {
         return <Spinner accessibilityLabel="Loading" size="small" />
       }
        if(o.statusAction.status === 'UNFULFILLED' && !btnLoading) {
            return (
                
                <Button size="slim" onClick={() => fulfillOrder(order)}>{wordsMapping[o.statusAction.action]}</Button>  
               
            );
        }
        if(o.statusAction.status === 'READY_FOR_DELIVERY' && !btnLoading) {
            return (
                
                <Button size="slim" onClick={() => pushToRm(order)}>{wordsMapping[o.statusAction.action]}</Button>  
               
            );
        }
        return  (
       ""     
        )
    }


   const itemsCountCol = (o:JobOrder) => {
     
        const count = o.lineItems.edges.length;
        console.log('itemsCountCol',count);
    return  count === 1 ? " item" : " items";
}

    const paidCol = (o:JobOrder) => {       
     
        return (
            <Badge
            status={paidStatusMapping[o.displayFinancialStatus].color}
            >{paidStatusMapping[o.displayFinancialStatus].value}</Badge>
        );
       
    }


    return (
       
        <IndexTable.Row
        id={props.id}       
        selected={selectedResources.includes(props.id)}
        position={index}   
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
                <IndexTable.Cell>
                { currencyMapping[order?.totalPriceSet.shopMoney.currencyCode]}{order?.totalPriceSet.shopMoney.amount}
                </IndexTable.Cell>
                <IndexTable.Cell>
                {
                    paidCol(order)
                }
                </IndexTable.Cell>                          
                <IndexTable.Cell >
                {                    
                    statusCol(order)                                              
                }
                </IndexTable.Cell>
                <IndexTable.Cell >
                {
                    actionCol(order)
                }
                </IndexTable.Cell>
                <IndexTable.Cell >
                {
                    order.lineItems.edges.length + itemsCountCol(order)
                }
                </IndexTable.Cell>
         
      </IndexTable.Row>
    )
}

export default OrderItem;
