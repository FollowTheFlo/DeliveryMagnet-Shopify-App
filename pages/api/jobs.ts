import fetchApi from "./../../components/utils/fetchApi";
import { SuccessResponse } from "./../../model/responses.model";
import { getAccessTokenFromDB, getShopFromBearerHeader } from "./../../shared";
import * as jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('integration activate API1'); 
    const { code } =  req.body
    console.log('integration activate API2', code);
    const shop = await getShopFromBearerHeader(req);

    const bearerToken = jwt.sign(JSON.stringify({ 
        shop
      }), process.env.SHOPIFY_API_SECRET);

      try{
        const response:SuccessResponse = await fetchApi(
          {
            method:'get',
            url:`${process.env.RM_SERVER_URL}/shopify/activate`,
            headers:{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`
            }})
            console.log('response',response);
            
        return response;
      } catch(err){
        console.log('err',err);
        return {success:false,message:'Exception:'+err};
      } 
}