import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import axios from "axios";

function useAxiosWithBearer(){
    console.log('interceptor1');
    const app = useAppBridge();
    console.log('interceptor2');
    const instance = axios.create();
    instance.interceptors.request.use(function (config) {
    
        return getSessionToken(app) // requires an App Bridge instance
        .then((token) => {
            console.log('interceptor3', token);
            //  append your request headers with an authenticated token
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers['Content-Type'] = 'application/json';
            config.headers['Accept'] = 'application/json';
            return config;
        });
    //  return config;
    });
    return instance
}
