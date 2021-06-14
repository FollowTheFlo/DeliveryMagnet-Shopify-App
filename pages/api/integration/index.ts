import { NextApiRequest, NextApiResponse } from "next";
import fetchApi from "../../../components/utils/fetchApi";
import { SuccessResponse } from "../../../model/responses.model";
import { getAccessTokenFromDB, getShopFromBearerHeader } from "../../../shared";
import * as jwt from 'jsonwebtoken';

async function handler(req: NextApiRequest, res: NextApiResponse) {

    console.log('integration API');
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
    res.status(200).json({success:true,message:'accesstoken found'});
    return;
}


export default handler;