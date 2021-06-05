import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider, Context, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch, getSessionToken } from "@shopify/app-bridge-utils";
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ClientRouter from '../components/ClientRouter';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
const axios = require('axios');

function userLoggedInFetch(app) {
    const fetchFunction = authenticatedFetch(app);
  
    return async (uri, options) => {
      const response = await fetchFunction(uri, options);
  
      if (response.headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1') {
        const authUrlHeader = response.headers.get('X-Shopify-API-Request-Failure-Reauthorize-Url');
  
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
        return null;
      }
  
      return response;
    };
  }

  function AxiosInterceptor(pageProps) {
    console.log('interceptor1');
      const app = useAppBridge();
      console.log('interceptor2');

    axios.interceptors.request.use(function (config) {
      
 return getSessionToken(app) // requires an App Bridge instance
     .then((token) => {
      console.log('interceptor3', token);
    //  append your request headers with an authenticated token
     config.headers["Authorization"] = `Bearer ${token}`;
     config.headers['Content-Type'] = 'application/json';
     return config;
     });
     //  return config;
    });
     return (
        <React.Fragment>
        {pageProps.children}
      </React.Fragment>
      );
  }


  
function MyProvider(pageProps) {
   // static contextType = Context;
   console.log('MyProvider1');
   const app = useAppBridge();
   console.log('MyProvider2');
      // const app = this.context;
  
      const client = new ApolloClient({
        fetch: userLoggedInFetch(app),
        fetchOptions: {
          credentials: "include",
        },
      });
  
      return (
        <ApolloProvider client={client}>
        {pageProps.children}
      </ApolloProvider>
      );
    
  }

function MyApp(props){
 
    const { Component, pageProps, shopOrigin } = props;

  
    const config = { apiKey: API_KEY, shopOrigin, forceRedirect: true };
    return (
      <React.Fragment>
        <Head>
          <title>RouteMagnet Local Delivery</title>
          <meta charSet="utf-8" />
        </Head>
        <Provider config={config}>
          <ClientRouter />
          <AppProvider i18n={translations}>
          
          <MyProvider>
           <AxiosInterceptor>
              <Component {...pageProps} />
             </AxiosInterceptor>
            </MyProvider>
           
          </AppProvider>
        </Provider>
      </React.Fragment>
    );
  
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    shopOrigin: ctx.query.shop,
  }
}

export default MyApp;