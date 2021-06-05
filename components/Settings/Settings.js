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
import AdminContext from '../../store/admin-context';


const Settings = (props) => {
    const [active, setActive] = useState(false);
    // WB means WebHook
    const [OrderCreatedWHActive, setOrderCreatedWHActive] = useState(false);
    const [OrderFullfilledWHActive, setOrderFullfilledWHActive] = useState(false);

  //  const [value, setValue] = useState('manual');
    const adminCtx = useContext(AdminContext);

    const handleChange = useCallback(
      (_checked, option) => {
        console.log('_checked',_checked);
        console.log('option',option);
        adminCtx.onModeSelected(option,_checked);
      //  setValue(newValue);        
        },
      [],
    );
  
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