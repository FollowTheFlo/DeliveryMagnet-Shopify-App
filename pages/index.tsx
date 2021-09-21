import React, { useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Page, Spinner } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import { useState, useEffect, useCallback } from "react";
import OrderList from "../components/OrderList/OrderList";
import Settings from "../components/Settings/Settings";
import { Card, Tabs } from "@shopify/polaris";
import Inscription from "../components/Inscription/Inscription";
import axios from "axios";
import { SuccessResponse } from "../model/responses.model";
import AdminContext from "../store/admin-context";
import NavCard from "../components/NavCard/NavCard";
import Builder from "../components/Builder/Builder";
import styles from "./index.module.css";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

const Index: React.FC = (props) => {
  const router = useRouter();
  const adminCtx = useContext(AdminContext);

  const emptyState = !store.get("ids");
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [loading, setloading] = useState<boolean>(true);

  const tabs = [
    {
      id: "orders",
      content: "Orders",
    },
    {
      id: "config",
      content: "Settings",
    },
  ];

  useEffect(() => {
    console.log("Index useEffect");
    setloading(true);
    // cehck the access token to see if integration with RM is setup
    async function getAccessTokenFromDBAsync() {
      try {
        const response = await axios.get("api/integration");
        const result = response?.data as SuccessResponse;
        if (result?.success) {
          console.log("Integration is correct");
          adminCtx.onIntegrationChange(true);
        } else {
          console.log("Integration is NOT correct");
          adminCtx.onIntegrationChange(false);
        }
      } catch (err) {
        console.log("err", err);
      }
      setloading(false);
    }
    if (!adminCtx.isIntegrated) {
      console.log("not integrated: getAccessToken");
      getAccessTokenFromDBAsync();
    } else setloading(false);
  }, []);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setTabIndex(selectedTabIndex),
    []
  );

  const onClickpageSelection = useCallback((page: number) => {
    setTabIndex(page);
  }, []);

  const displayTabsPage = useCallback(() => {
    console.log("displayTabsPage", tabIndex);
    if (tabIndex === 0) {
      return (
        <React.Fragment>
          <OrderList />
        </React.Fragment>
      );
    } else if (tabIndex === 1) {
      return (
        <React.Fragment>
          <Settings />
        </React.Fragment>
      );
    } else if (tabIndex === 2) {
      return (
        <React.Fragment>
          <Inscription />
        </React.Fragment>
      );
    } else if (tabIndex === 3) {
      console.log("display Builder");
      adminCtx.onSetNewJobsCount(0);
    }
  }, [tabIndex]);

  return (
    <Page fullWidth>
      <NavCard
        tabIndex={tabIndex}
        isIntegrated={adminCtx.isIntegrated}
        onClickpageSelection={onClickpageSelection}
        newJobsCount={adminCtx.newJobsCount}
      />

      {loading ? (
        <React.Fragment>
          <Spinner></Spinner>
        </React.Fragment>
      ) : adminCtx.isIntegrated ? (
        displayTabsPage()
      ) : (
        <Inscription />
      )}
      <div className={tabIndex === 3 ? styles.show : styles.hide}>
        <Builder />
      </div>
    </Page>
  );
};

export default Index;
