import { Heading, Layout, Toast, Frame } from "@shopify/polaris";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { SuccessResponse } from "../../model/responses.model";
import axios from "axios";
import AdminContext from "../../store/orders-context";
import { ShopifyConfig } from "../../model/config.model";
import Inscription from "../Inscription/Inscription";
import TestConnection from "./TestConnection/TestConnection";
import IntegrationContext from "../../store/integration-context";

const Settings: React.FC = (props) => {
  // const adminCtx = useContext(AdminContext);
  const integrationCtx = useContext(IntegrationContext);
  const [successSaved, setSuccessSaved] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  useEffect(() => {
    // fetch config vlaues form DeliveryMagnet server,
    // shop,teamId,active,service,accessToken,code,domain,exp
    // avoid to run it everytime, 0 is initial state, so will rune only once
    if (integrationCtx.defaultServiceDuration === 0) {
      console.log("in useEffect service duration");
      fetchConfigFromRM()
        .then((success) => {
          console.log("fetchDefaultService", success);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const fetchConfigFromRM = (): Promise<boolean> => {
    console.log("fetchDefaultService");
    setConfigLoading(true);
    return axios
      .get(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/config`)
      .then((response) => {
        setConfigLoading(false);
        const config = response?.data as ShopifyConfig;
        console.log("config", config);
        if (config?.service) {
          // sec to min
          //  setServiceDuration(config.service / 60);
          integrationCtx.onDefaultServiceDurationChange(config.service / 60);
          return true;
        }
        return false;
      })
      .catch((err) => {
        setConfigLoading(false);
        console.log(err);
        return false;
      });
  };

  const successToast = successSaved ? (
    <div style={{ height: "50px" }}>
      <Frame>
        <Toast
          content="Saved"
          onDismiss={() => setSuccessSaved(!successSaved)}
          duration={4500}
        />
      </Frame>
    </div>
  ) : null;

  return (
    <React.Fragment>
      <br />
      <Heading element="h1">Settings</Heading>
      <br />
      {!integrationCtx.isIntegrated ? (
        <Inscription />
      ) : (
        <Layout>
          <Layout.Section oneHalf>
            <TestConnection />
          </Layout.Section>
        </Layout>
      )}
      {successToast}
    </React.Fragment>
  );
};

export default Settings;
