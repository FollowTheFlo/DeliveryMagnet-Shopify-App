import React, { useState, useEffect } from "react";
import { IntegrationContextType } from "../model/context.model";

const IntegrationContext = React.createContext({
  domain: "",
  onDomainChange: (value) => {},
  isIntegrated: false,
  onIntegrationChange: (value) => {},
  defaultServiceDuration: 0,
  onDefaultServiceDurationChange: (value) => {},
  language: "en",
  onSetLanguage: () => {},
} as IntegrationContextType);

export const IntegrationContextProvider = (props) => {
  const [domain, setDomain] = useState<string>("");
  const [isIntegrated, setIsIntegrated] = useState<boolean>(false);
  const [defaultServiceDuration, setDefaultServiceDuration] = useState(0);
  const [language, setLanguage] = useState("en");

  const domainHandler = (value) => {
    console.log("domainHandler", value);
    setDomain(value);
  };

  const onDefaultServiceDurationChangeHandler = (value) => {
    console.log("domainHandler", value);
    setDefaultServiceDuration(value);
  };

  const onIntegrationHandler = (val: boolean) => {
    console.log("onIntegrationHandler:", val);
    setIsIntegrated(val);
  };

  const onSetLanguageHandler = () => {
    let navLocal = navigator.language || window.navigator.language;
    console.log("navLocal", navLocal);
    navLocal = navLocal.split("-")[0];
    if (navLocal === "en" || navLocal === "fr") {
      setLanguage(navLocal);
    }
  };

  return (
    <IntegrationContext.Provider
      value={{
        domain: domain,
        onDomainChange: domainHandler,
        isIntegrated: isIntegrated,
        onIntegrationChange: onIntegrationHandler,
        defaultServiceDuration: defaultServiceDuration,
        onDefaultServiceDurationChange: onDefaultServiceDurationChangeHandler,
        language: language,
        onSetLanguage: onSetLanguageHandler,
      }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};

export default IntegrationContext;
