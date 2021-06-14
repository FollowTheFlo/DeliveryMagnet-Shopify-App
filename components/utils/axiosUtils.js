import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";


const getAxiosInstance = (props) => {
   // const app = useAppBridge();
  //  const instance = axios.create();
    // intercept all requests on this axios instance
    axios.interceptors.request.use(function (config) {
        console.log('interceptor2');
   // return getSessionToken(app) // requires an App Bridge instance
  //      .then((token) => {
        // append your request headers with an authenticated token
  //      config.headers["Authorization"] = `Bearer ${token}`;
  //      return config;
    //    });
    return config;
    });
   
}
// export your axios instance to use within your app
export default getAxiosInstance;