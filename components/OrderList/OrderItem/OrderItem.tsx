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


import React, { useCallback, useEffect, useState } from 'react';
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
   
    useEffect(() => {
        console.log('OrderItem useEffect');
        // always hide loading spinner, it could be re-render after async Actions: Fullfil or PushToRM
        setBtnLoading(false);
    },[order.statusAction.action])


    const pushToRm = (orderSelection:JobOrder) => {
        console.log('pushToRm orderId', orderSelection);
        setBtnLoading(true);        
        onPushOrder(orderSelection);       
    }

    const fulfillOrder = (o:JobOrder) => {
        console.log('fulfillOrder', o);
        if(o.displayFulfillmentStatus !== 'UNFULFILLED') return;
        setBtnLoading(true);
        onFulfillOrder(o);       
    }
    

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
