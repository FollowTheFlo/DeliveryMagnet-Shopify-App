const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
const axios = require('axios');

import { useAppBridge } from "@shopify/app-bridge-react";
import fetchApi from '../../components/utils/fetchApi';
import { authenticatedFetch, getSessionToken } from "@shopify/app-bridge-utils";
import {getAccessTokenFromDB, getShopFromBearerHeader} from '../shared';
// const RM_SERVER_URL = 'https://83e781cb2720.ngrok.io';

const getListActiveWebHooks = async (headers, shop) => {

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


async function handler(req, res) {
     console.log('fetch order api handler',req.headers.authorization);
     console.log('req.method',req.method);

    //  if (req.method !== 'POST' || req.method !== 'post') {
    //   console.log('GET method');
    //   res.status(200).json({success:false,message:'POST method, Must be GET method'});
    //   return;      
    // }
  
    const data = req.body
    const { option } = data;

    if(!option){
      console.log('No option value in body');
      res.status(200).json({success:false,message:'No option value in body'});
      return;      
    }
    console.log('option', option);
      
   
  const shop = await getShopFromBearerHeader(req);
  // if(!shop){
  //   console.log('no shop');
  //   res.status(200).json({success:false,message:'Shop value null'});
  //   return;
  // }
  console.log('shop response', shop);

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

  
    const activeListAtStart = await getListActiveWebHooks(headers, shop)
    console.log('activeList', activeListAtStart);


    // 3 options: manual, auto_create, auto_fullfill
    // output the actual option based on subscribed webhook
    if(option === 'list') {
      if(activeListAtStart && activeListAtStart.length > 1) {
        res.status(200).json({success:false,message:'more than 1 hook, should never happens'});
        return;
      }
      if(activeListAtStart && activeListAtStart.length === 1) {
        console.log('option:',activeListAtStart[0].topic);
        const option = activeListAtStart[0].topic === 'orders/create' ? 'auto_create' : 'auto_fullfill';
        res.status(200).json({success:true,message:option});
        return;
      }
      // if list undefined or empty, option is manual
      res.status(200).json({success:true,message:'manual'});
      return;
    }

    if(activeListAtStart && activeListAtStart.length > 0){
      const successDeletion = await deleteAllWebHooks(headers, shop);
      console.log('delete success', successDeletion);

      if(!successDeletion) {
        res.status(200).json({success:false, message:'Error in WebHooks deletion'});
        return;
      };
    } else (console.log('list already null, no need delete'))

    if(option === 'list') {
      const activeListAtEnd = await getListActiveWebHooks(headers, shop)
      console.log('activeList', activeListAtEnd);
      res.status(200).json({success:true,message:''});

    } else if(option === 'manual') {
      
      // do nothing as wbehooks are already deleted
      console.log('manual, delete all webhooks');   

    } else if(option === 'auto_create') {
      // register Order Creation WebHook
      const successCreation = await createWebHook(headers,'orders/create', shop, "https://8587ba880439.ngrok.io/shopify/order/add/");
      console.log('successCreation', successCreation);
  
    } else if(option === 'auto_fullfill') {
      // register Order Fullfill WebHook
      const successCreation = await createWebHook(headers,'orders/fulfilled', shop, "https://8587ba880439.ngrok.io/shopify/order/add/");
      console.log('successCreation', successCreation);
    }

    const activeListAtEnd = await getListActiveWebHooks(headers, shop)
    console.log('activeList', activeListAtEnd);

    res.status(200).json({success:true,message:''});
  
    return;
}

export default handler;