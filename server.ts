// require('isomorphic-fetch');

// import { SuccessResponse } from "./model/responses.model";

// @ts-ignore
const dotenv = require("dotenv");
const Koa = require("koa");
const next = require("next");
const https = require("https");
//const axios = require('axios');
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const { default: Shopify, ApiVersion } = require("@shopify/shopify-api");
// const getSubscriptionUrl = require("./server/getSubscriptionUrl");
const Router = require("koa-router");
const jwt = require("jsonwebtoken");

// import fetchApi from './utils';

dotenv.config();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const ACTIVE_SHOPIFY_SHOPS = {};

const saveAccessTokenInDB = (shop, accessToken) => {
  console.log("saveAccessTokenInDB", process.env.SHOPIFY_API_SECRET);
  console.log("key", shop);

  console.log("server accessToken", accessToken);

  const bearerToken = jwt.sign(
    JSON.stringify({
      shop: shop,
      accessToken: accessToken,
      exp: new Date().getTime() + 60000,
    }),
    process.env.SHOPIFY_API_SECRET
  );
  // no need post as shop and token are encrypted in header
  return fetch(`${process.env.RM_SERVER_URL}/shopify/access_token/save`, {
    method: "get",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((data) => {
      if (data.status >= 200 && data.status <= 299) {
        console.log("in data 200");
        return data.json();
      } else {
        console.log("error saving token");
        return data.text();
      }
    })
    .then((val) => {
      console.log("val", val);
      return val;
    })
    .catch((err) => {
      console.log("err", err);
      return {
        success: false,
        message: JSON.stringify(err),
      };
    });
};

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  console.log("server beforeAuth");
  server.use(
    createShopifyAuth({
      accessMode: "offline",
      async afterAuth(ctx) {
        console.log("server afterAuth");
        const { shop, scope, accessToken } = ctx.state.shopify;
        console.log("accessToken", accessToken);
        console.log("shop", shop);
        console.log("env var", process.env.RM_SERVER_URL);

        const response = await saveAccessTokenInDB(shop, accessToken);
        console.log("response save token", response);
        if (!response.success) {
          if (response.message)
            console.log("error saving token, message:", response.message);
          return;
        }
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;
        ctx.redirect(`/?shop=${shop}`);
      },
    })
  );

  router.post(
    "/graphql",
    verifyRequest({ accessMode: "offline", returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  const handleRequest = async (ctx) => {
    console.log("flo handle");
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/api/(.*)", async (ctx) => {
    console.log("api route post");
    await handle(ctx.req, ctx.res);
  });

  router.get("/api/(.*)", async (ctx) => {
    console.log("api route get");
    await handle(ctx.req, ctx.res);
  });

  // router.get("/api/(.*)", async (ctx) => {
  //   console.log('api route get',ctx.req.headers);
  //   await handle(ctx.req, ctx.res);
  //   ctx.respond = false;
  //   ctx.res.statusCode = 200;
  // });

  // router.get("/flo", async (ctx) => {
  //   console.log('flo route get');
  //   await handle(ctx.req, ctx.res);
  //   fetch(
  //     `${process.env.RM_SERVER_URL}/shopify/test`,
  //     { method:'get',
  //       headers: {
  //           'Accept': 'application/json',
  //           'Content-Type': 'application/json',
  //         }
  //       }
  //    )

  //    .then(data => {
  //     if (data.status >= 200 && data.status <= 299) {
  //         console.log('response', data.json());

  //     } else{
  //       console.log('error',data);
  //       return data;
  //     }
  //     return data.json();
  //   })
  //   .then(val => console.log('val',val))
  //   .catch(err => console.log('err',err))
  //   ctx.respond = false;
  //   ctx.res.statusCode = 200;
  // });

  router.get("/", async (ctx) => {
    console.log("flo ctx");
    const shop = ctx.query.shop;

    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      console.log("do nothing");
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  router.get("(/_next/static/.*)", handleRequest);
  router.get("/_next/webpack-hmr", handleRequest);

  // router.get("/fetchorder",async (ctx) => {
  //   console.log('flo here');
  //  // await handleRequest(ctx);
  // })

  // router.post('/webhooks', async (ctx) => {
  //   await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
  //   console.log(`Webhook processed with status code 200!`, ctx.req);
  // });

  // router.post('/order_create', async (ctx) => {
  //   await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
  //   console.log(`Webhook order created`, ctx.req);
  // });

  // router.post('/order_fullfilled', async (ctx) => {
  //   console.log(`Webhook order_fullfilled1` );
  //   await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
  //   console.log(`Webhook order_fullfilled2` );
  // });

  router.get("(.*)", verifyRequest(), async (ctx) => {
    // Your application code goes here
    console.log("flo ctx");
  });
  // router.get("/fetchorder",async (ctx) => {
  //   console.log('flo here');
  //  // await handleRequest(ctx);
  // })
  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

// runHttpRequest = (url) => {
//     return new Promise((resolve, reject) => {

//       console.log('flo5',url);

//       https.get(url, (res) => {
//           console.log('flo7',res);
//         let tempData = '';

//         res.on('data', (d) => {
//           console.log('flo8',d);
//           tempData += d;
//         });

//         res.on('end', () => {
//           console.log('flo9',tempData);
//           data = JSON.parse(tempData);
//           if (res.statusCode !== 200) {
//               console.log('flo10');
//             reject(tempData);
//           } else {
//               console.log('flo11');
//             resolve(tempData);
//           }
//         });

//       }).on('error', (e) => {
//         console.error(e);
//       });
//     });
//   }
