require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const https = require('https');
const axios = require('axios')
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: Shopify, ApiVersion } = require('@shopify/shopify-api');
const getSubscriptionUrl = require('./server/getSubscriptionUrl');
const Router = require('koa-router');

dotenv.config();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

  server.use(
    createShopifyAuth({
        async afterAuth(ctx) {
          console.log('flo afterAuth');
            const { shop, scope, accessToken } = ctx.state.shopify;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;
        ctx.redirect(`/?shop=${shop}`);

        // const registration = await Shopify.Webhooks.Registry.register({
        //     shop,
        //     accessToken,
        //     path: '/webhooks',
        //     topic: 'ORDERS_CREATE',
        //     apiVersion: ApiVersion.October20,
        //     webhookHandler: (_topic, shop, _body) => {
        //       console.log('webhookHandler ORDERS_CREATE',_topic, _body);
        //    //   delete ACTIVE_SHOPIFY_SHOPS[shop];
           
        //    axios
        //    .post('https://route-magnet.herokuapp.com/config', {
        //        data: shop
        //    }).then(res => {
        //     console.log(`statusCode: ${res.statusCode}`)
        //     console.log('axiox res', res);
        //    })
            //  runHttpRequest('https://route-magnet.herokuapp.com/config')
            //  .then(res =>{
            //     console.log('data response:', res);
            //  }, err => console.log('reject:', err));
            
          
           
        //    https.get('https://route-magnet.herokuapp.com/config', (res) => {
        //         console.log('statusCode:', res.statusCode);
        //         // console.log('headers:', res.headers);

        //         res.on('data', (d) => {
        //             console.log('flo8',d);
        //             data += d;
        //           });
          
        //           res.on('end', () => {
        //             console.log('flo9',data);
        //             data = JSON.parse(data);
        //             if (res.statusCode !== 200) {
        //                 console.log('flo10 error');
        //             //  reject(data);
        //             } else {
        //                 console.log('flo11', data);
        //              // resolve(data);
        //             }
        //           });

        //         }).on('error', (e) => {
        //         console.error(e);
        //         });
          //   },
          // });

          // const regOrdersCreation = await Shopify.Webhooks.Registry.register({
          //   shop,
          //   accessToken,
          //   path: '/order_fullfilled',
          //   topic: 'ORDERS_FULFILLED',
          //   apiVersion: ApiVersion.October20,
          //   webhookHandler: (_topic, shop, _body) => {
          //     console.log('ORDERS_FULFILLED webhookHandler',shop,'topic', _topic,'body');

          //     axios
          //     .get(`https://route-magnet.herokuapp.com/shopify/setup/${shop}/12345`).then(res => {
             
          //      console.log('axiox res', res);
          //     })

          //     axios
          //     .post('https://route-magnet.herokuapp.com/shopify/add', {
          //         shop: shop,
          //         teamId: '1234',
          //     }).then(res => {
          //      console.log(`statusCode: ${res.statusCode}`)
          //      console.log('axiox res', res);
          //     })


          //   },
          // });
        
          // if (registration.success) {
          //   console.log('Successfully registered webhook with ORDERS_CREATE!!');
          // } else {
          //   console.log('Failed to register webhook', registration.result);
          // }
          // if (regOrdersCreation.success) {
          //   console.log('Successfully registered ORDERS_FULFILLED !!');
          // } else {
          //   console.log('Failed to register ORDERS_FULFILLED', regOrdersCreation.result);
          // }
//   https://8e0f78705f66.ngrok.io/auth?shop=routemagnet.myshopify.com
        // const returnUrl = `https://${Shopify.Context.HOST_NAME}?shop=${shop}`;
        // const subscriptionUrl = await getSubscriptionUrl(accessToken, shop, returnUrl);
        // ctx.redirect(subscriptionUrl);
    
      },
    }),
  );

  router.post("/graphql", verifyRequest({returnHeader: true}), async (ctx, next) => {
    console.log('flo graphql');
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  });

  const handleRequest = async (ctx) => {
    console.log('flo handle');
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  // Any route starting with `/api` will not be checked for Shopify auth
  router.get("/api/(.*)", async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  

  router.get("/", async (ctx) => {
    console.log('flo ctx');
    const shop = ctx.query.shop;

    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      console.log('do nothing');
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
    console.log('flo ctx');
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