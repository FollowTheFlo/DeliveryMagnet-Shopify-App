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
import { JobOrder } from '../../model/orders.model';
import {CircleTickMajor, ArrowLeftMinor, CirclePlusOutlineMinor, ArrowDownMinor} from '@shopify/polaris-icons';

interface JobOrderProps {
  order:JobOrder;
}

const RouteMagnetCard  = (props:JobOrderProps) => {
 const {order} = props;
 return <Card title="RouteMagnet Local Delivery">
 <Card.Section>
  
{ order?.job?.status ?
 <Badge>
   {order?.job?.status ?? "Not on RouteMagnet"}
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
order?.job?.status &&
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