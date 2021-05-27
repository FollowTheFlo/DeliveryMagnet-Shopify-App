import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider, Context, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ClientRouter from '../components/ClientRouter';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

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

  
function MyProvider(pageProps) {
   // static contextType = Context;
    const app = useAppBridge();
  
    
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
            <Component {...pageProps} />
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