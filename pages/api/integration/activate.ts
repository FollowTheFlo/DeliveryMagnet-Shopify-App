import { NextApiRequest, NextApiResponse } from "next";
import fetchApi from "../../../components/utils/fetchApi";
import { SuccessResponse } from "../../../model/responses.model";
import { getAccessTokenFromDB, getShopFromBearerHeader } from "../../../shared";
import * as jwt from "jsonwebtoken";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("integration activate API1");
  const { code } = req.body;
  console.log("integration activate API2", code);
  const shop = await getShopFromBearerHeader(req);
  if (!shop) {
    res.status(200).json({ success: false, message: "shop not found" });
    return;
  }
  const result = await activateIntegration(code, shop);
  // const sessionToken = req.headers.authorization.replace('Bearer ','');

  // const accessToken = await getAccessTokenFromDB(sessionToken);
  // if(!accessToken) {
  //   res.status(200).json({success:false,message:'accesstoken value null'});
  //   return;
  // }
  // console.log('accessToken response', accessToken);
  res.status(200).json(result);
  return;
}

async function activateIntegration(
  code: string,
  shop: string
): Promise<SuccessResponse> {
  console.log("activateIntegration", code);
  const bearerToken = jwt.sign(
    JSON.stringify({
      shop,
      code,
      exp: new Date().getTime() + 60000,
    }),
    process.env.SHOPIFY_API_SECRET
  );

  try {
    const response: SuccessResponse = await fetchApi({
      method: "get",
      url: `${process.env.RM_SERVER_URL}/shopify/activate`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    console.log("response", response);

    return response;
  } catch (err) {
    console.log("err", err);
    return { success: false, message: "Exception:" + err };
  }
}

export default handler;
