import { Card,
    ResourceList,
    Stack,
    RadioButton,
    TextStyle,
    SettingToggle,
    Thumbnail,
    ButtonGroup,
    Button,
    Tabs,
    TextField,
    Heading,
    Badge,
    Layout,
} from '@shopify/polaris';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { SuccessResponse } from '../../model/responses.model';
import axios from 'axios';
import AdminContext from '../../store/admin-context';
import { ShopifyConfig } from '../../model/config.model';


const Settings:React.FC = (props) => {

  //  const [value, setValue] = useState('manual');
    const adminCtx = useContext(AdminContext);
   
    

    useEffect(() => {

      // avoid to run it everytime, 0 is initial state, so will rune only once
      if(adminCtx.defaultServiceDuration === 0){
        console.log('in useEffect service duration');
        fetchDefaultService()
        .then(success => {
          console.log('fetchDefaultService', success)
        })
        .catch(err => console.log(err))
      }
    
      async function getOption() {
        const res = await getOptionValuefromShopify();
        console.log('res', res);
      }
      // at initial time, get the actual option, only run once, which means at initial state where all options are false
      if(!adminCtx.mode.auto_create && !adminCtx.mode.auto_fullfill && !adminCtx.mode.manual) {
        getOption();
      }
     
    },[])

    const fetchDefaultService = ():Promise<boolean> => {
      console.log('fetchDefaultService');
      return axios.get(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/config`)
    .then(response => {
      const config = response?.data as ShopifyConfig;
      console.log('config',config);
      if(config?.service) {
        // sec to min
      //  setServiceDuration(config.service / 60);
        adminCtx.onDefaultServiceDurationChange(config.service / 60);
        return true;
      }
      return false;
      })
    .catch(err => {
      console.log(err)
      return false;
    })
    }

    const storeDefaultService = (value:number):Promise<boolean> => {
      console.log('fetchDefaultService');
      return axios.post(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/service`,{
        serviceDuration:value * 60
      })
    .then(response => {
      const config = response?.data as ShopifyConfig;
      console.log('config',config);
      if(config?.service) {
        console.log('config');
        // sec to min
       // setServiceDuration(config.service / 60);
        adminCtx.onDefaultServiceDurationChange(config.service / 60);
       // adminCtx.onDefaultServiceDurationChange(config.service);
        return true;
      }
      return false;
      })
    .catch(err => {
      console.log(err)
      return false;
    })
    }

    const handleChange = useCallback(
      (_checked, option) => {
        console.log('_checked',_checked);
        console.log('option',option);
        axios.post('/api/webhooks',{option})
        .then(response => {
          const result = response?.data as SuccessResponse;
          console.log('response webhooks api', result);
          adminCtx.onModeSelected(option,_checked);
        })
        .catch(err => {
          console.log('err wb change', err);
        })          
        },
      [],
    );

    const getOptionValuefromShopify = ():Promise<SuccessResponse> => {
    
      // reach our API then server will check Shopify webhooks and determine which option is being used
      return axios.post('/api/webhooks',{option:"list"})
      .then(response => {
        console.log('response webhooks api', response.data);
        if(!response.data) return {success:false,message:'empty response'};

        const data = response.data as SuccessResponse;
        if(!data.success) {
          console.log('fail',data.message ?? 'empty message');
          
          // don't set any option
          return data;
        }
        // option value is return in message property when success is true        
        adminCtx.onModeSelected(data.message,true);
        return {success:true,message:'mode found succesfully'};
      })
      .catch(err => {
        console.log('err webhook list:', err);
        return {success:false,message:'error' + err};
      })
    }  

    

    const changeDurationHandle = useCallback(      
      (value) => {
        console.log('changeDurationHandle',value);
        // setServiceDuration(value);
        adminCtx.onDefaultServiceDurationChange(value);
      },
      [],
    );
  
    const onSaveServiceDuration = useCallback( (value:number) => {
      console.log('onSaveServiceDuration', value);
      storeDefaultService(value)
      .then(success => {
        console.log('storeDefaultService', success)
      })
      .catch(err => console.log(err))

    },[])

    return (
      <React.Fragment>
       <br/> 
      
      <Card title="Orders Push Methods from Shopify to RouteMagnet">
        <Card.Section>
        <Stack vertical>
          <RadioButton
            label="Manualy"
            helpText="Push order manually into RouteMagnet queue from Orders tabs"
            checked={adminCtx.mode.manual}
            id="manual"
            name="transferMode"
            onChange={handleChange}
          />
          {/* <RadioButton
            label="Automatic push when orders get created"
            helpText="Orders are pushed to RouteMagnet Delivery queue when an order is confirmed"
            id="auto_create"
            name="transferMode"
            checked={adminCtx.mode.auto_create}
            onChange={handleChange}
          /> */}
          <RadioButton
            label="Automatically when order get fullfilled"
            helpText="Order is pushed to RouteMagnet Delivery queue when an order is fullfilled"
            id="auto_fullfill"
            name="transferMode"
            checked={adminCtx.mode.auto_fullfill}
            onChange={() => handleChange}
          />
        </Stack>
        </Card.Section>
      </Card>
      <br/>
      <Layout>
        <Layout.Section oneThird>
          <Card title="Delivery Service Duration">
            <Card.Section>
            <TextField 
            type="number"
            label="Default Service Duration in minutes" 
            value={adminCtx.defaultServiceDuration.toString()}
            suffix="min"
            onChange={changeDurationHandle} />
            <br/>
            <Button
            onClick={() => onSaveServiceDuration(adminCtx.defaultServiceDuration)}
          >Save</Button>
            </Card.Section>
            
          </Card>
          
        </Layout.Section>
        <Layout.Section oneThird>
          
        </Layout.Section>
      </Layout>
      </React.Fragment>
    );
}

export default Settings;