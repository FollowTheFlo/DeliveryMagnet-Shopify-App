const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
const axios = require('axios');

import { useAppBridge } from "@shopify/app-bridge-react";
import fetchApi from '../../components/utils/fetchApi';
import { authenticatedFetch, getSessionToken } from "@shopify/app-bridge-utils";
import {getAccessTokenFromDB, getShopAndBearerHeaders, getShopFromBearerHeader} from '../../shared';
import { WebHook } from "../../model/webhooks.model";
import { ShopAndBearerHeaders, SuccessResponse } from "../../model/responses.model";
// const RM_SERVER_URL = 'https://83e781cb2720.ngrok.io';

const getListActiveWebHooks = async (headers:any, shop:string):Promise<WebHook[]> => {

  try {
    const list =   await fetchApi({
      method:'get',
    headers,
      url:`https://${shop}/admin/api/2021-04/webhooks.json`,
    })
    if(!list?.webhooks){
      console.log('fetch webshooks: no response')
      return[];
    }
    const webHooks = list.webhooks as WebHook[];
  // .get('https://' + shop + '/admin/api/2020-04/webhooks.json', {headers})
    console.log('getListActiveWebHooks',list);
    if(webHooks?.length > 0 ) {
      console.log('rmWebHooks1',webHooks);
      // filter webhooks that belong to us
      const rmWebHooks = webHooks.filter(w => w.address.includes(process.env.WEBHOOK_TARGET_URL))
      console.log('rmWebHooks2',rmWebHooks);
      return rmWebHooks;
    };
    return [];
  } catch(err) {
    console.log('getActiveList err',err);
    return [];
  }
  
}

const deleteAllWebHooks = async (headers, shop):Promise<SuccessResponse> => {

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
    } else return {success:true,message:'no webhooks registered, no deletion was needed'}; // return success, if no webhooks, no need to delete anything
  } catch(err) {
    console.log('deleteAllWebHooks err', err);
    return {success:false,message:'exception in deletion request:' + JSON.stringify(err)};
  }
 
  return {success:true,message:'webhooks deleted successfully'};
}

const createWebHook = async (headers:any, topic:string, shop:string, url:string):Promise<SuccessResponse> => {
  // doc: https://shopify.dev/docs/admin-api/rest/reference/events/webhook?api%5Bversion%5D=2021-04
  try{
    const createWHRes = await fetchApi({
      method:"post",
      url:`https://${shop}/admin/api/2021-04/webhooks.json`, 
      body:JSON.stringify({ 
          webhook: {
          topic: topic,
          address: url,
          format: "json"
        }})
    ,headers})
    console.log('regCreateWHRes',createWHRes);
    if(!createWHRes.webhook) {
      return {success:false,message:'response obj null'};
    }
    const webHook = createWHRes.webhook as WebHook;
    // console.log('regCreateWHRes status',regCreateWHRes.webhook);
    // for response format see https://shopify.dev/docs/admin-api/rest/reference/events/webhook
    return webHook.id  ?  {success:true,message:'success'} : {success:false,message:'webhook has no id'};
    } catch(err) {
      console.log('err', err);
      return {success:false,message:'exception:' + err};
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
      

  let shopAndBearerHeaders:ShopAndBearerHeaders = null;
  try {
    shopAndBearerHeaders = await getShopAndBearerHeaders(req);
  } catch(err) {
    console.log(err);
    // error is type SuccessResult
    res.status(200).json(err);
  }
    
  const {shop,headers} = shopAndBearerHeaders;
  
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

    // if List is not null, trigger deletion action
    if(activeListAtStart && activeListAtStart.length > 0){
      const successDeletion = await deleteAllWebHooks(headers, shop);
      console.log('delete success', successDeletion);

      if(!successDeletion.success) {
        res.status(200).json({success:false, message:successDeletion.message});
        return;
      };
    } else (console.log('list already null, no need delete'))

    // at this stage, all webhooks are deleted, now processing actions depending the option
    if(option === 'manual') {
      
      // do nothing as wbehooks are already deleted
      console.log('manual, no webhooks');   

    } else if(option === 'auto_create') {
      // register Order Creation WebHook
      const createResponse = await createWebHook(headers,'orders/create', shop, `${process.env.WEBHOOK_TARGET_URL}/shopify/order/add/`);
      console.log('successCreation', createResponse);
  
    } else if(option === 'auto_fullfill') {
      // register Order Fullfill WebHook
      const fulfillResponse = await createWebHook(headers,'orders/fulfilled', shop, `${process.env.WEBHOOK_TARGET_URL}/shopify/order/add/`);
      console.log('successCreation', fulfillResponse);
    }

    // check the list processing actions for review purpose
    const activeListAtEnd = await getListActiveWebHooks(headers, shop)
    console.log('activeList', activeListAtEnd);

    res.status(200).json({success:true,message:''});
  
    return;
}

export default handler;