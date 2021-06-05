const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
const axios = require('axios');
const jwt = require('jsonwebtoken');
import { useAppBridge } from "@shopify/app-bridge-react";
import fetchApi from '../../components/utils/fetchApi';
import { authenticatedFetch, getSessionToken } from "@shopify/app-bridge-utils";

// const RM_SERVER_URL = 'https://83e781cb2720.ngrok.io';

const getAccessTokenFromDB = async (sessionToken) => {
  console.log('getAccessTokenFromDB');

  try{
    const response = await fetchApi(
      {
        method:'get',
        url:`${process.env.RM_SERVER_URL}/shopify/access_token`,
        headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if(!response || response.error !== '' || !response.accessToken) {
        console.log('accessTokenResponse error', response.error);
        return null;
      }
    return response.accessToken;
  } catch(err){
    console.log('err',err);
    return null;
  }
  // const response = await fetchApi({
  //   method:'post',  
  //   url:`${RM_SERVER_URL}/shopify/access_token`,
  //   body:JSON.stringify({shop:shop}),
  //   headers:{
  //     'Content-Type': 'application/json'
  //   }
  // })
  
 
}

const getListActiveWebHooks = async (headers, shop) => {
  /* eg of returned obj list
 [ {
      id: 1039184724139,
      address: 'https://route-magnet.herokuapp.com/shopify/order/add',
      topic: 'orders/create',
      created_at: '2021-06-03T15:43:06-04:00',
      updated_at: '2021-06-03T15:43:06-04:00',
      format: 'json',
      fields: [],
      metafield_namespaces: [],
      api_version: '2021-04',
      private_metafield_namespaces: []
    }]
  */
  try {
    const list =   await fetchApi({
      method:'get',
    headers,
      url:`https://${shop}/admin/api/2021-04/webhooks.json`,
    })
  // .get('https://' + shop + '/admin/api/2020-04/webhooks.json', {headers})
    console.log('getListActiveWebHooks',list);
    if(list && list.webhooks && list.webhooks.length > 0 ) return list.webhooks;
    return [];
  } catch(err) {
    console.log('getActiveList err',err);
    return [];
  }
  
}

const deleteAllWebHooks = async (headers, shop) => {

  try {
      const list = await getListActiveWebHooks(headers, shop);
      console.log('inside delete,list',list);
    if(list && list.length > 0 ) {
      console.log('deleteAllWebHooks');
      for(let i=0;i<list.length;i++) {
        if(!list[i].id) {
          console.log('id not found, jump loop');
          continue;
        }
        const deleteRes = await fetchApi({
          method:'delete',
          headers,
          url:`https://${shop}/admin/api/2021-04/webhooks/${list[i].id}.json`})
        console.log('deleteRes', deleteRes.status);
      }
    } else return true; // return success, if no webhooks, no need to delete anything
  } catch(err) {
    console.log('deleteAllWebHooks err', err);
    return false;
  }
 
return true;
}

const createWebHook = async (headers, topic, shop, url) => {
  // doc: https://shopify.dev/docs/admin-api/rest/reference/events/webhook?api%5Bversion%5D=2021-04
  try{
    const regCreateWHRes = await fetchApi({
      method:"post",
      url:`https://${shop}/admin/api/2021-04/webhooks.json`, 
      body:JSON.stringify({ 
          webhook: {
          topic: topic,
          address: url,
          format: "json"
        }})
    ,headers})
    console.log('regCreateWHRes',regCreateWHRes);
    // console.log('regCreateWHRes status',regCreateWHRes.webhook);
    // for response format see https://shopify.dev/docs/admin-api/rest/reference/events/webhook
    return regCreateWHRes && regCreateWHRes.webhook && regCreateWHRes.webhook.id  ?  true : false;
    } catch(err) {
      console.log('err', err);
    }
}

const getShopFromBearerHeader = async (req) => {  
  
  return new Promise((resolve,reject) =>{
    try {
      if(!req.headers.authorization){
        throw 'malformed header';
      }
      const encrypted = req.headers.authorization.replace('Bearer ','');
  
     // console.log(secret, process.env.TOKEN_KEY);
      jwt.verify(encrypted, process.env.SHOPIFY_API_SECRET, (err, decoded) => {
         // console.log('err', err);
         // console.log('decoded', decoded);
         console.log('decoded',decoded);
         console.log('exp', new Date(decoded.exp) );
         console.log('nbf', new Date(decoded.nbf));
         console.log('dest', decoded.dest);
       const shop = decoded.dest.replace('https://','');
        return resolve(shop);  
      });
      //console.log('flo20DecodedToken: ',decodedToken);
  } catch (err) {
     console.log('err1',err); 
     return resolve('');  // will be seen as an error     
  }
  })
 
}
async function handler(req, res) {
     console.log('fetch order api handler',req.headers.authorization);
   
  const shop = await getShopFromBearerHeader(req);
  if(!shop){
    console.log('no shop');
    res.status(200).json({success:false,message:'Shop value null'});
    return;
  }
  console.log('shop response', shop);

  const sessionToken = req.headers.authorization.replace('Bearer ','');
  
  console.log('before axios');
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
    
    const successDeletion = await deleteAllWebHooks(headers, shop);
    console.log('delete success', successDeletion);

    if(!successDeletion) {
      res.status(200).json({success:false, message:'Error in WebHooks deletion'});
      return;
    };

    const successCreation = await createWebHook(headers,'orders/create', shop, "https://route-magnet.herokuapp.com/shopify/order/add/");
    console.log('successCreation', successCreation);

    const activeList = await getListActiveWebHooks(headers, shop)
    console.log('activeList', activeList);

    res.status(200).json({success:true,message:true});
  
    return true;
}

export default handler;