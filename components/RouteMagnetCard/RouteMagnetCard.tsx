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
    Icon,
  } from '@shopify/polaris';
import { JobOrder } from '../../model/orders.model';
import {CircleTickMajor, ArrowLeftMinor, CirclePlusOutlineMinor, ChevronDownMinor, ArrowDownMinor} from '@shopify/polaris-icons';
import wordsMapping from '../utils/wordsMapping';

interface JobOrderProps {
  order:JobOrder;
}

const RouteMagnetCard  = (props:JobOrderProps) => {
 const {order} = props;

 const statusList = ['UNFULFILLED','READY_FOR_DELIVERY','IN_WAITING_QUEUE','IN_PLANNER_BUILDER',
                    'IN_ITINERARY_SAVED','IN_ITINERARY_ASSIGNED','ITINERARY_STARTED','ON_THE_WAY','COMPLETED']

                    const index = statusList.findIndex(s => order.statusAction.status === s)
 const statusStack = (o:JobOrder) => {
   
  return <Card title="RouteMagnet Local Delivery"> 
  <Card.Section>{
    statusList.map((status,i) => {
      const badgeStatus = i === index ? 'attention' : i > index ? 'new'  : 'success';
      return <React.Fragment>
        <Stack distribution="center">
          <Stack.Item fill={true}>
            <Badge status={badgeStatus}>
              {wordsMapping[status]}
            </Badge>
          </Stack.Item>       
        </Stack>
        <Stack>
          <Stack.Item>
          <Icon
            source={ChevronDownMinor}
            color="base" />
          </Stack.Item>
        </Stack>
      </React.Fragment>
    })}
    </Card.Section>
  </Card>
 }

 return statusStack(order);

 return <Card title="RouteMagnet Local Delivery">
 <Card.Section>
  
{ order?.job?.status ?
 <Badge>
   {wordsMapping[order?.statusAction?.status]}
 </Badge>    
   :
   <Button
   icon={CirclePlusOutlineMinor}
   >
     Ready for Delivery
   </Button>
 }
 </Card.Section>
 
{
order?.statusAction.status &&
<Card.Section>
     <TextStyle variation="strong">Time Line</TextStyle>
     <hr/>
     { order?.job?.step?.canceledAt &&
     <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.step?.canceledAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">  Delivery canceled by {order?.job?.step?.canceledBy ?? 'unknown'} </TextStyle></div>
         </Stack.Item>          
       </Stack>
       <hr/>
       </React.Fragment>
       }

     { order?.job?.step?.completed &&
     <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.step?.completedAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">  Delivery Completed by {order?.job?.step?.completedBy ?? 'unknown'} </TextStyle></div>
         </Stack.Item>          
       </Stack>
       <hr/>
       </React.Fragment>
       }

     { order?.job?.step?.startedAt &&
     <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.step?.startedAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">  On the way to destination by {order?.job?.step?.driverLabel ?? 'unknown'} </TextStyle></div>
         </Stack.Item>          
       </Stack>
       <hr/>
       </React.Fragment>
       }

     { order?.job?.step?.routeStartedAt &&
     <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.step?.routeStartedAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">  Itinerary started by driver {order?.job?.step?.driverLabel ?? 'unknown' } by {order?.job?.step?.driverLabel ?? 'unknown'} </TextStyle></div>
         </Stack.Item>         
       </Stack>
      { 
       order?.job?.uId && <Stack alignment="center">
           <Stack.Item>
         Notification sent to customer with 
         <a href={ "https://app.routemagnet.com/delivery/" + order.job.uId}>
           Delivery Tracker Link
         </a>
           </Stack.Item>
         </Stack>
       }
       <hr/>
       </React.Fragment>
       }

     { order?.job?.step?.assignedAt &&
     <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.step?.assignedAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">   Assigned to {order?.job?.step?.assignedToLabel ?? 'unknown' } by {order?.job?.step?.assignedByLabel ?? 'unknown'} </TextStyle></div>
         </Stack.Item>          
       </Stack>
       <hr/>
       </React.Fragment>
       }

     { order?.job?.pickedAt &&
     <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.pickedAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">   Picked from queue by {order?.job?.pickedByLabel ?? 'teamate' } </TextStyle></div>
         </Stack.Item>          
       </Stack>
       <hr/>
       </React.Fragment>
       }
       
    { order?.job?.addedAt &&
    <React.Fragment>
       <Stack alignment="center">
       <Stack.Item>
         
         </Stack.Item>
         
         <Stack.Item>
         <TextStyle variation="subdued">{new Date(order?.job?.addedAt).toLocaleString() } </TextStyle>
     <div><TextStyle variation="strong">   Added to waiting queue by {order?.job?.addedByLabel ?? 'Shopify Admin' } </TextStyle></div>
         </Stack.Item>
         <Stack.Item>
           <a href="https://app.routemagnet.com/tabs/queue" target="_blank">Waiting Queue</a>
           </Stack.Item>    
       </Stack>
       <hr/>
       </React.Fragment>
       }
     </Card.Section>}
   </Card>
}

export default RouteMagnetCard;