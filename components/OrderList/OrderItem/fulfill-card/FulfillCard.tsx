import React, { useContext, useState } from 'react';
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
import { JobOrder, WHOrder } from '../../../../model/orders.model';
import { currencyMapping, statusBadgeColorMapping, wordsMapping } from '../../../utils/mapping';
import { useReactiveVar } from '@apollo/client';
import { JobOrderProps } from '../../../../model/input.model';




const FulfillCard  = (props:JobOrderProps) => {
 const {order, onPushOrder, onFulfillOrder} = props;



 const onActionClicked = (action:string) => {
  console.log('onAction',action);
  if(action === 'PUSH_TO_ROUTEMAGNET') {
    onPushOrder({...order});
    return;
  }
  if(action === 'PREPARE_DELIVERY') {
    if(order.displayFulfillmentStatus !== 'UNFULFILLED') return;

    onFulfillOrder({...order});
  }
 }


const displayCardSections = () => {
return (
  <React.Fragment>
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
                {quantity} x { currencyMapping[order.totalPriceSet.shopMoney.currencyCode]}{originalUnitPriceSet.shopMoney.amount}
              </Stack.Item>
              <Stack.Item>
                <Badge status={statusBadgeColorMapping[fulfillmentStatus] ?? 'new'}>{fulfillmentStatus}</Badge>
              </Stack.Item>
              </Stack>
            </ResourceList.Item>
          );
        }}
      />
    </Card.Section>
    <Card.Section>
    Total: { currencyMapping[order.totalPriceSet.shopMoney.currencyCode]}{order.totalPriceSet.shopMoney.amount}
    </Card.Section>
  </React.Fragment>
)
}
    // display bottom action button if action property not null
    return order.statusAction.action && !order.cancelledAt ? (<Card
      title="Items"
    primaryFooterAction={{
      content: wordsMapping[order.statusAction.action],
      onAction: () => onActionClicked(order.statusAction.action)
     }}
    actions={[{
      content: wordsMapping[order.statusAction.action],
      onAction: () => onActionClicked(order.statusAction.action)
    }]}
    >
      {
      displayCardSections()
      }

  </Card>)
  :
  (
    <Card title="Items">
      {
      displayCardSections()
      }
    </Card>
  )
}

export default FulfillCard;