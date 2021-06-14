import fetchApi from './fetchApi';
import * as jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ShopAndBearerHeaders, SuccessResponse, TokenPayloadResponse } from './model/responses.model';

const getAccessTokenFromDB = async (sessionToken:string):Promise<string|null> => {
    console.log('getAccessTokenFromDB');
  
    try{
      const response:TokenPayloadResponse = await fetchApi(
        {
          method:'get',
          url:`${process.env.RM_SERVER_URL}/shopify/access_token`,
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          }
        });
        if(!response || !response.success! || !response.accessToken) {
          console.log('accessTokenResponse error', response.message);
          return null;
        }
      return response.accessToken;
    } catch(err){
      console.log('err',err);
      return null;
    } 
}


const getShopFromBearerHeader = async (req:NextApiRequest):Promise<string> => {  
    console.log('getShopFromBearerHeader');
    return new Promise((resolve,reject) =>{
      try {
        if(!req.headers.authorization){
          throw 'malformed header';
        }
        const encrypted = req.headers.authorization.replace('Bearer ','');
       // console.log(secret, process.env.TOKEN_KEY);
        jwt.verify(encrypted, process.env.SHOPIFY_API_SECRET, (err, decoded:any) => {
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

  const getShopAndBearerHeaders = async (req:NextApiRequest):Promise<ShopAndBearerHeaders> => {
    console.log('getShopAndBearerHeaders');
    const shop = await getShopFromBearerHeader(req);
    if(!shop){
      console.log('no shop');     
      throw( {success:false,message:'no shop'});
    }
    console.log('shop response', shop);
  
    const sessionToken = req.headers.authorization.replace('Bearer ','');
    
      const accessToken = await getAccessTokenFromDB(sessionToken);
      if(!accessToken) {        
        throw({success:false,message:'accessToken value null'});
      }
      console.log('accessToken response', accessToken);
  
      const headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }

      return {shop,headers};
  }

  export {getAccessTokenFromDB, getShopFromBearerHeader, getShopAndBearerHeaders}

