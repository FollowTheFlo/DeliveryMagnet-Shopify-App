
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
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
import Inscription from '../components/Inscription/Inscription';
import { getAccessTokenFromDB } from '../shared';
import axios from 'axios';
import { SuccessResponse } from '../model/responses.model';
import AdminContext from '../store/admin-context';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index:React.FC = (props) => {
  const router = useRouter();
  const adminCtx = useContext(AdminContext);

  const emptyState = !store.get('ids');
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [loading, setloading] = useState<boolean>(true);
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
    console.log('Index useEffect');
    setloading(true);
    // cehck the access token to see if integration with RM is setup
    async function getAccessTokenFromDBAsync() {
      try{
      const response = await axios.get('api/integration');
      const result = response?.data as SuccessResponse;
      if(result.success) {
        console.log('Integration is correct');
        adminCtx.onIntegrationChange(true);
      
      } else {
        console.log('Integration is NOT correct');
        adminCtx.onIntegrationChange(false);
      }
    } catch(err) {
      console.log('err',err);
      }
      setloading(false);
    }
    if(!adminCtx.isIntegrated) {
      console.log('not integrated: getAccessToken');
      getAccessTokenFromDBAsync();
    } else  setloading(false);
  
  }, [])

  const handleTabChange = useCallback(
    (selectedTabIndex:number) => setTabIndex(selectedTabIndex),
    [],
  );

  const displayTabsPage = () => {
    return tabIndex === 0 ?
      <React.Fragment>             
        <OrderList/>
      </React.Fragment>
      
      :
      <React.Fragment>             
      <Settings/>
    </React.Fragment>
  }

  
    return (
      <Page>
        
       {
       loading ?
       <p>Loading</p> 
       :
        adminCtx.isIntegrated ? 
        <div>
          <Tabs tabs={tabs} selected={tabIndex} onSelect={handleTabChange} fitted>
          </Tabs>
          { displayTabsPage()}
        </div>
        :
        <Inscription/>         
      }
       
      </Page>
    );

   
  }
 


export default Index;