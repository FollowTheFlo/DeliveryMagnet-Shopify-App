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
const axios = require('axios');
import AdminContext from '../../store/admin-context';


const Settings = (props) => {
    const [active, setActive] = useState(false);
    // WB means WebHook
    const [OrderCreatedWHActive, setOrderCreatedWHActive] = useState(false);
    const [OrderFullfilledWHActive, setOrderFullfilledWHActive] = useState(false);

  //  const [value, setValue] = useState('manual');
    const adminCtx = useContext(AdminContext);

    useEffect(() => {
      console.log('useEffect');
      // at initial time, get the actual option
      getOptionValuefromShopify();
    },[])

    const handleChange = useCallback(
      (_checked, option) => {
        console.log('_checked',_checked);
        console.log('option',option);
        axios.post('/api/webhooks',{option})
        .then(response => {
          console.log('response webhooks api', response);
          adminCtx.onModeSelected(option,_checked);
        })
        .catch(err => {
          console.log('err wb change', err);
        })          
        },
      [],
    );

    const getOptionValuefromShopify = () => {
      axios.post('/api/webhooks',{option:"list"})
      .then(response => {
        console.log('response webhooks api', response);
        if(!response || !response.data || !response.data.success || !response.data.message) {
          if(response && response.data && !response.data.message)(console.log('fail',response.data.message))
          
          // don't set any option
          return;
        }
        // option value is return in message property when success is true        
        adminCtx.onModeSelected(response.data.message,true);
      })
      .catch(err => {
        console.log('err webhook list:', err);
      })
    }
  
    return (
      <Stack vertical>
        <RadioButton
          label="Push manualy only"
          helpText="Push orders manually into RouteMagnet queue from Orders tabs"
          checked={adminCtx.mode.manual}
          id="manual"
          name="transferMode"
          onChange={handleChange}
        />
        <RadioButton
          label="Automatic push when orders get created"
          helpText="Orders are pushed to RouteMagnet Delivery queue when an order is confirmed"
          id="auto_create"
          name="transferMode"
          checked={adminCtx.mode.auto_create}
          onChange={handleChange}
        />
         <RadioButton
          label="Automatic push when order get fullfilled"
          helpText="Orders are pushed to RouteMagnet Delivery queue when an order is fullfilled"
          id="auto_fullfill"
          name="transferMode"
          checked={adminCtx.mode.auto_fullfill}
          onChange={handleChange}
        />
      </Stack>
    );
}

export default Settings;