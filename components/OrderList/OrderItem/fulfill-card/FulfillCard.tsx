import React, { useContext } from 'react';
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
import { JobOrder } from '../../../../model/orders.model';

interface JobOrderProps {
  order:JobOrder;
}

const FulfillCard  = (props:JobOrderProps) => {
 const {order} = props;
    return <Card>

    <Card.Section>
      <ResourceList
        resourceName={{singular: 'product', plural: 'products'}}
        items={order.lineItems.edges}
     
        renderItem={(item) => {
          const {id,title, originalUnitPriceSet,fulfillmentStatus,image,quantity} = item.node;

          return (
            <ResourceList.Item
              id={id}
              url={''}               
           >
             <Stack
              alignment='center'
             >
                <Stack.Item fill>
             <Thumbnail
          source={image.originalSrc}
          alt={title}
          />
          </Stack.Item>
          <Stack.Item fill>
              
                <TextStyle variation="strong">{title}</TextStyle>
             
             
              </Stack.Item>
              <Stack.Item>
                {quantity} x {order.totalPriceSet.shopMoney.amount} {originalUnitPriceSet.shopMoney.amount}
              </Stack.Item>
              <Stack.Item>
                {fulfillmentStatus}
              </Stack.Item>
              </Stack>
            </ResourceList.Item>
          );
        }}
      />
    </Card.Section>
    <Card.Section>
    Total: {order.totalPriceSet.shopMoney.currencyCode}{order.totalPriceSet.shopMoney.amount}
    </Card.Section>
  </Card>
}

export default FulfillCard;