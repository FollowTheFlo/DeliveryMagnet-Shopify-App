import React, { useState, useEffect } from 'react';

const AdminContext = React.createContext({
  mode: {
    manual:true,
    auto_create:false,
    auto_fullfill:false,
  }, // manual, auto_create, auto_fullfill
  sessionToken: '',
  onSelectionChange: () => {}, 
});

export const AdminContextProvider = (props) => {
  const [mode, setMode] = useState({
    manual:true,
    auto_create:false,
    auto_fullfill:false,
  });
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    // get mode from server
  },[]);

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

  const sessionTokenHandler = (value) => {
    console.log('modeSelectionHandler');
    setSessionToken(value);
  };

  return (
    <AdminContext.Provider
      value={{
        mode: mode,
        onModeSelected: modeSelectionHandler,
      }}
    >
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContext;