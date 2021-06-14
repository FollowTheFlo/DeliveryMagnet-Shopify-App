import fetchApi from '../../fetchApi';
import {getAccessTokenFromDB, getShopFromBearerHeader} from '../../shared';
import type { NextApiRequest, NextApiResponse } from 'next';
import { FulfillmentApiInput, FulFillmentInput, ShopifyOrderFullFillment, ShopifyOrderFullFillments } from '../../model/fulfillments.model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('fulfillment api handler',req.headers.authorization);
    console.log('req.method',req.method);
    console.log('req.body',req.body);
   
    const shop = await getShopFromBearerHeader(req);
    if(!shop) {
        res.status(200).json({success:false,message:'shop not found'});
        return;
    }
    const sessionToken = req.headers.authorization.replace('Bearer ','');
  
    const accessToken = await getAccessTokenFromDB(sessionToken);
    if(!accessToken) {
      res.status(200).json({success:false,message:'accesstoken value null'});
      return;
    }
    console.log('accessToken response', accessToken);

    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    }

    const data:FulFillmentInput = req.body;
    const { action, orderId } = data;
    if(!orderId) {
        res.status(200).json({success:false,message:'orderId null'});
        return;
    }
    const fulfillmentRes = await getOrderFulfillment(headers, shop, orderId);
    if(fulfillmentRes && fulfillmentRes.fulfillments && fulfillmentRes.fulfillments.length > 0) {
        res.status(200).json({success:false,message:'order already fulfilled'});
        return;
    }
    const success = await postOrderFullfillment(headers, shop, orderId);
    res.status(200).json({success:success,message:`Fulfillment created succesfully for order  + ${orderId}`});

    
}

const getOrderFulfillment = async (headers,shop,orderId):Promise<ShopifyOrderFullFillments> => {
    console.log('getOrderFulfillment');
    try {
        const fulfillment:ShopifyOrderFullFillments = await fetchApi({
          method:'get',
          headers,
          url:`https://${shop}/admin/api/2021-04/orders/${orderId}/fulfillments.json`,       
    },
        )
        //  body:JSON.stringify({fulfillment: { location_id: 123456789 }})
      // .get('https://' + shop + '/admin/api/2020-04/webhooks.json', {headers})
        console.log('fulfillment',JSON.stringify(fulfillment));
       return fulfillment;
      } catch(err) {
        console.log('fulfillment err',err);
        return null;
       
      }
}

const postOrderFullfillment = async (headers,shop,orderId) => {
    console.log('postOrderFullfillment');
    try {
      const fulfillmentApiInput:FulfillmentApiInput = {
        fulfillment:{
        location_id:59096170667,
        notify_customer:false,
        tracking_company:'RouteMagnet',
        message:'Delivery managed by RM',
        shipment_status:'ready_for_pickup',
          tracking_urls:['https://app.routemagnet.com/delivery/60ad045a047fb50017f81841']
      }
    };
        const response = await fetchApi({
          method:'post',
          headers,
          url:`https://${shop}/admin/api/2021-04/orders/${orderId}/fulfillments.json`,
          body:JSON.stringify(fulfillmentApiInput)      
    },
        )
        //  body:JSON.stringify({fulfillment: { location_id: 123456789 }})
      // .get('https://' + shop + '/admin/api/2020-04/webhooks.json', {headers})
        console.log('fulfillment',JSON.stringify(response));
        if(!response.fulfillment)return false;

        const fulfillment = response.fulfillment as ShopifyOrderFullFillment;

       return true;
      } catch(err) {
        console.log('fulfillment err',err);
        return false;
       
      }
    /*
    {
 "fulfillment": {
    "location_id": 905684977,
    "tracking_number": "CJ274101086US",
    "tracking_url": "http://www.custom-tracking.com/?tracking_number=CJ274101086US",
    "line_items": [
      {
        "id": 466157049
      },
      {
        "id": 518995019
      },
      {
        "id": 703073504
      }
    ]
  }
    */
}

export default handler;