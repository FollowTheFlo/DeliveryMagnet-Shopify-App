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
import React from 'react';

const OrderItem = (props) => {

    const {order, onPush} = props;

    const pushToRm = orderSelection => {
        console.log('pushToRm orderId', orderSelection);
        const whOrder = convertGraphQlToWebHookOrder(orderSelection);        
        onPush(whOrder);
       
    }

    const convertGraphQlToWebHookOrder = o => {
        return {
            id: o.id.replace('gid://shopify/Order/',''), // original format gid://shopify/Order/3772116238507
            test: false, // o.test
            app_id: 'flo app ID',
            cancel_reason: o.cancelReason,
            cancelled_at: o.cancelledAt,
            currency: o.totalPriceSet.shopMoney.currencyCode,
            current_total_price: o.totalPriceSet.shopMoney.amount,
            total_price:o.totalPriceSet.shopMoney.amount,
            email: o.email,
            order_status_url: 'https://routemagnet.myshopify.com/order/12312897',
            shipping_address : o.shippingAddress ? {
                first_name:o.shippingAddress.FirstName,
                address1:o.shippingAddress.address1,
                phone:o.shippingAddress.phone,
                city:o.shippingAddress,
                zip:o.shippingAddress,
                province:o.shippingAddress.provinceCode,
                country:o.shippingAddress.country,
                last_name:o.shippingAddress.lastName,
                address2:o.shippingAddress.address2,
                company:o.shippingAddress.company,
                latitude:o.shippingAddress.latitude,
                longitude:o.shippingAddress.longitude,
                name:o.shippingAddress.name,
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
    


    return (
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
                        order && order.job && order.job.step.customerLink ?
                        <Stack.Item fill><a target='_blank' href={order.job.step.customerLink}>Track Link</a> </Stack.Item> :
                        <Stack.Item fill></Stack.Item>
                }
                 {                    
                        order && order.displayFulfillmentStatus ?
                        <Stack.Item fill>{ order.displayFulfillmentStatus} </Stack.Item> :
                        <Stack.Item fill></Stack.Item>
                }
                <Stack.Item fill>
                <h3>
                    <TextStyle variation="strong">
                    
                    {
                     order && order.job &&  order && order.job.status ?
                        <React.Fragment>
                            <Badge>{order.job.status}</Badge> 
                            <Button onClick={() => pushToRm(order)}>
                            Push to RM
                           </Button>
                       </React.Fragment>
                         :<p>Null</p>
                        // (order && order.id ?
                        //     <Button onClick={() => pushToRm(order)}>
                        //     Push to RM
                        //   </Button>:
                        //   <p>Null</p>
                        //   )
                    }
                    </TextStyle>
                </h3>
                </Stack.Item>
          </Stack>
      </ResourceList.Item>
    )
}

export default OrderItem;