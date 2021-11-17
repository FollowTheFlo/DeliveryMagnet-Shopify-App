import {
  Card,
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
  Layout,
  Toast,
  Frame,
  Spinner,
} from "@shopify/polaris";
import styles from "./Settings.module.css";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { SuccessResponse } from "../../model/responses.model";
import axios from "axios";
import AdminContext from "../../store/admin-context";
import { ShopifyConfig } from "../../model/config.model";
import Inscription from "../Inscription/Inscription";
import TestConnection from "./TestConnection/TestConnection";

const Settings: React.FC = (props) => {
  //  const [value, setValue] = useState('manual');
  const adminCtx = useContext(AdminContext);

  const [successSaved, setSuccessSaved] = useState(false);
  const [webHooksLoading, setwebHooksLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);

  useEffect(() => {
    // avoid to run it everytime, 0 is initial state, so will rune only once
    if (adminCtx.defaultServiceDuration === 0) {
      console.log("in useEffect service duration");
      fetchDefaultService()
        .then((success) => {
          console.log("fetchDefaultService", success);
        })
        .catch((err) => console.log(err));
    }

    // async function getOption() {
    //   const res = await getOptionValuefromShopify();
    //   console.log('res', res);
    // }
    // // at initial time, get the actual option, only run once, which means at initial state where all options are false
    // if(!adminCtx.mode.auto_create && !adminCtx.mode.auto_fullfill && !adminCtx.mode.manual) {
    //   getOption();
    // }
  }, []);

  const fetchDefaultService = (): Promise<boolean> => {
    console.log("fetchDefaultService");
    setServiceLoading(true);
    return axios
      .get(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/config`)
      .then((response) => {
        setServiceLoading(false);
        const config = response?.data as ShopifyConfig;
        console.log("config", config);
        if (config?.service) {
          // sec to min
          //  setServiceDuration(config.service / 60);
          adminCtx.onDefaultServiceDurationChange(config.service / 60);
          return true;
        }
        return false;
      })
      .catch((err) => {
        setServiceLoading(false);
        console.log(err);
        return false;
      });
  };

  const storeDefaultService = (value: number): Promise<boolean> => {
    console.log("fetchDefaultService");
    setServiceLoading(true);
    return axios
      .post(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/service`, {
        serviceDuration: value * 60,
      })
      .then((response) => {
        setServiceLoading(false);
        const config = response?.data as ShopifyConfig;
        console.log("config", config);
        if (config?.service) {
          console.log("config");
          // sec to min
          // setServiceDuration(config.service / 60);
          adminCtx.onDefaultServiceDurationChange(config.service / 60);
          setSuccessSaved(true);
          // adminCtx.onDefaultServiceDurationChange(config.service);
          return true;
        }
        return false;
      })
      .catch((err) => {
        setServiceLoading(false);
        console.log(err);
        return false;
      });
  };

  const onWebHookChange = useCallback((_checked, option) => {
    setwebHooksLoading(true);
    console.log("_checked", _checked);
    console.log("option", option);
    axios
      .post("/api/webhooks", { option })
      .then((response) => {
        setwebHooksLoading(false);
        const result = response?.data as SuccessResponse;
        console.log("response webhooks api", result);
        adminCtx.onModeSelected(option, _checked);
        setSuccessSaved(true);
      })
      .catch((err) => {
        setwebHooksLoading(false);
        console.log("err wb change", err);
      });
  }, []);

  const getOptionValuefromShopify = (): Promise<SuccessResponse> => {
    setwebHooksLoading(true);
    // reach our API then server will check Shopify webhooks and determine which option is being used
    return axios
      .post("/api/webhooks", { option: "list" })
      .then((response) => {
        setwebHooksLoading(false);
        console.log("response webhooks api", response.data);
        if (!response.data)
          return { success: false, message: "empty response" };

        const data = response.data as SuccessResponse;
        if (!data.success) {
          console.log("fail", data.message ?? "empty message");

          // don't set any option
          return data;
        }
        // option value is return in message property when success is true
        adminCtx.onModeSelected(data.message, true);
        return { success: true, message: "mode found succesfully" };
      })
      .catch((err) => {
        console.log("err webhook list:", err);
        setwebHooksLoading(false);
        return { success: false, message: "error" + err };
      });
  };

  const changeDurationHandle = useCallback((value) => {
    console.log("changeDurationHandle", value);
    // setServiceDuration(value);
    adminCtx.onDefaultServiceDurationChange(value);
  }, []);

  const onSaveServiceDuration = useCallback((value: number) => {
    console.log("onSaveServiceDuration", value);
    storeDefaultService(value)
      .then((success) => {
        console.log("storeDefaultService", success);
      })
      .catch((err) => console.log(err));
  }, []);

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

      {/* <Card title="Orders Push Methods from Shopify to DeliveryMagnet">
       {
         webHooksLoading && <div  className={styles.centerEl}><Spinner accessibilityLabel="Loading" size="small" /></div>
       }
        <Card.Section>
        <Stack vertical>
          <RadioButton
            disabled={webHooksLoading}
            label="Manualy"
            helpText="Push order manually into RouteMagnet queue from Orders tabs"
            checked={adminCtx.mode.manual}
            id="manual"
            name="transferMode"
            onChange={onWebHookChange}
          />
          <RadioButton
            disabled={webHooksLoading}
            label="Automatic push when orders get created"
            helpText="Orders are pushed to RouteMagnet Delivery queue when an order is confirmed"
            id="auto_create"
            name="transferMode"
            checked={adminCtx.mode.auto_create}
            onChange={onWebHookChange}
          />
          <RadioButton
            disabled={webHooksLoading}
            label="Automatically when order get fullfilled"
            helpText="Order is pushed to RouteMagnet Delivery queue when an order is fullfilled"
            id="auto_fullfill"
            name="transferMode"
            checked={adminCtx.mode.auto_fullfill}
            onChange={onWebHookChange}
          />
        </Stack>
        </Card.Section>
      </Card>
      <br/> */}
      <Heading element="h1">Settings</Heading>
      <br />
      {!adminCtx.isIntegrated ? (
        <Inscription />
      ) : (
        <Layout>
          {/* <Layout.Section oneThird>
            <Card title="Delivery Service Duration">
              {serviceLoading && (
                <div className={styles.centerEl}>
                  <Spinner accessibilityLabel="Loading" size="small" />
                </div>
              )}
              <Card.Section>
                <TextField
                  type="number"
                  label="Default service duration on delivery location (in minutes)"
                  value={adminCtx.defaultServiceDuration.toString()}
                  suffix="min"
                  onChange={changeDurationHandle}
                />
                <br />
                <Button
                  disabled={serviceLoading}
                  onClick={() =>
                    onSaveServiceDuration(adminCtx.defaultServiceDuration)
                  }
                >
                  Save
                </Button>
              </Card.Section>
            </Card>
          </Layout.Section> */}
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
