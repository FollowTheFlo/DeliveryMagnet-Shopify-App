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
} from '@shopify/polaris';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { SuccessResponse } from '../../model/responses.model';
import axios from 'axios';
import AdminContext from '../../store/admin-context';


const Settings:React.FC = (props) => {

  //  const [value, setValue] = useState('manual');
    const adminCtx = useContext(AdminContext);

    useEffect(() => {
      console.log('useEffect');
      async function getOption() {
        const res = await getOptionValuefromShopify();
        console.log('res', res);
      }
      // at initial time, get the actual option, only run once, which means at initial state where all options are false
      if(!adminCtx.mode.auto_create && !adminCtx.mode.auto_fullfill && !adminCtx.mode.manual) {       
        getOption();
      }
     
    },[])

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
  
    return (
      <React.Fragment>
       <br/> 
      
      <Card title="Orders Push Methods from Shopify to RouteMagnet">
        <Card.Section>
        <Stack vertical>
          <RadioButton
            label="Manualy"
            helpText="Push orders manually into RouteMagnet queue from Orders tabs"
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
            helpText="Orders are pushed to RouteMagnet Delivery queue when an order is fullfilled"
            id="auto_fullfill"
            name="transferMode"
            checked={adminCtx.mode.auto_fullfill}
            onChange={handleChange}
          />
        </Stack>
        </Card.Section>
      </Card>
      <Card title="Delivery Service time">
        <Card.Section>
        </Card.Section>
      </Card>
      </React.Fragment>
    );
}

export default Settings;