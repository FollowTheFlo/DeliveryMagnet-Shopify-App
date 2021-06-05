
import React from 'react';
import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import { useState, useEffect, useCallback } from 'react';
import OrderList from '../components/OrderList/OrderList';
import Settings from '../components/Settings/Settings'
import { Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  ButtonGroup,
  Button,
  Tabs,
  TextField,
  Heading,
  Badge,
} from '@shopify/polaris';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = (props) => {

  const emptyState = !store.get('ids');
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = [
    {
      id: 'orders',
      content: 'Orders',    
    },
    {
      id: 'config',
      content: 'Config',    },
  ];



  useEffect(() => {
    console.log('flo useEffect');
  
  }, [])

  const handleTabChange = useCallback(
    (selectedTabIndex) => setTabIndex(selectedTabIndex),
    [],
  );

  
    return (
      <Page>     
       
           <Tabs tabs={tabs} selected={tabIndex} onSelect={handleTabChange} fitted>
         </Tabs>
         { tabIndex === 0 ?(
            <React.Fragment>             
              <OrderList/>
            </React.Fragment>
            )
            :
            <React.Fragment>             
            <Settings/>
          </React.Fragment>
         }
        
   
      </Page>
    );

   
  }
 


export default Index;