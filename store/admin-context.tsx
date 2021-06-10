import React, { useState, useEffect } from 'react';
import { AdminContextType } from '../model/context.model';
import { RmJob, RmJobWithStep } from '../model/jobs.model';
import { JobOrder } from '../model/orders.model';
import { WhMode } from '../model/webhooks.model';

const AdminContext = React.createContext({
  domain:'',
  onDomainChange: (value) => {},
  mode: {
    manual:false,
    auto_create:false,
    auto_fullfill:false,
  }, // manual, auto_create, auto_fullfill 
  onModeSelected: (option,value) => {}, 
  jobOrders:[],
  onJobOrdersChange: (jOrders) => {},
  onJobOrderPush:(rMOrderWithStep) => {}
} as AdminContextType);

export const AdminContextProvider = (props) => {
  // initial state with all unchecked option
  // when first visit on Settings, we will fetch the active option from Shopify
  const [mode, setMode] = useState<WhMode>({
    manual:false,
    auto_create:false,
    auto_fullfill:false,
  });
 
  const [domain, setDomain] = useState<string>('');
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);

  useEffect(() => {
    // get mode from server
    console.log('admin context');
  },[]);

  

  const domainHandler = (value) => {
    console.log('domainHandler',value);
    setDomain(value);
  }

  const modeSelectionHandler = (option:string, checked:boolean) => {
    console.log('modeSelectionHandler', option, checked);
    // set all to false
    const updatedMode = {
      manual:false,
      auto_create:false,
      auto_fullfill:false,
    }
    updatedMode[option] = checked;
    console.log('updatedMode',updatedMode);
    setMode(updatedMode);
  };

  const onJobOrdersHandler = (jList:JobOrder[]) => {
    console.log('onJobOrdersHandler',jList);
    setJobOrders(jList);
  }

  const onJobOrderPushHandler = (rmJob:RmJob) => {
    // note that step is present
    setJobOrders((prevJobOrders:JobOrder[]) => {
      const updatedJobOrders = prevJobOrders.slice();
      const index = updatedJobOrders.findIndex(o => (o && o.id && o.id.replace('gid://shopify/Order/','') == rmJob.extId));
      console.log('index prevJobOrders', index);
      if(index != -1) {
        // adding step with null value as new job, not in any itinerary
        const updatedJob = {...updatedJobOrders[index],job:{...rmJob,step:null}} as JobOrder;            
        updatedJobOrders[index] = updatedJob;
        console.log('prev2',prevJobOrders);        
      }
      return updatedJobOrders;
    })
  }

  return (
    <AdminContext.Provider
      value={{
        mode: mode,
        onModeSelected: modeSelectionHandler,
        domain: domain,
        onDomainChange: domainHandler,
        jobOrders:jobOrders,
        onJobOrdersChange: onJobOrdersHandler,
        onJobOrderPush: onJobOrderPushHandler,
      }}
    >
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContext;