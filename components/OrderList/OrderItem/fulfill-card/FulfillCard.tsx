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
import { JobOrder, WHOrder } from '../../../../model/orders.model';
import { currencyMapping, wordsMapping } from '../../../utils/mapping';
import { useReactiveVar } from '@apollo/client';

interface JobOrderProps {
  order:JobOrder;
  onPushOrder:(o:JobOrder)=>void;
  onFulfillOrder:(o:JobOrder)=>void;
}


const FulfillCard  = (props:JobOrderProps) => {
 const {order, onPushOrder, onFulfillOrder} = props;
 const statusColorMapping = {
   'UNFULFILLED' : 'attention',
   'FULLFILLED' : 'new'
 }

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
                <Badge status={statusColorMapping[fulfillmentStatus] ?? 'new'}>{fulfillmentStatus}</Badge>
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

    return order.statusAction.action ? (<Card
    
    secondaryFooterActions={[{content: 'More', onAction: () => onActionClicked('test')}]}
    primaryFooterAction={{
      content: wordsMapping[order.statusAction.action],
      onAction: () => onActionClicked(order.statusAction.action)
    }}
    >
      {
      displayCardSections()
      }

  </Card>)
  :
  (
    <Card>
      {
      displayCardSections()
      }
    </Card>
  )
}

export default FulfillCard;