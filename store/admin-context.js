import React, { useState, useEffect } from 'react';

const AdminContext = React.createContext({
  domain:'',
  onDomainChange: (value) => {},
  mode: {
    manual:true,
    auto_create:false,
    auto_fullfill:false,
  }, // manual, auto_create, auto_fullfill
  sessionToken: '',
  onSelectionChange: (option,value) => {}, 
  jobOrders:[],
  onJobOrdersChange: (jOrders) => {},
});

export const AdminContextProvider = (props) => {
  const [mode, setMode] = useState({
    manual:true,
    auto_create:false,
    auto_fullfill:false,
  });
 
  const [domain, setDomain] = useState('');
  const [jobOrders, setJobOrders] = useState([]);

  useEffect(() => {
    // get mode from server
    console.log('admin context');
  },[]);

  

  const domainHandler = (value) => {
    console.log('domainHandler',value);
    setDomain(value);
  }

  const modeSelectionHandler = (option, checked) => {
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

  const onJobOrdersHandler = (value) => {
    console.log('onJobOrdersHandler',value);
    setJobOrders(value);
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
      }}
    >
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContext;