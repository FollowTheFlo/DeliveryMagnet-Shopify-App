import React, { useContext } from "react";

import { Page, Spinner } from "@shopify/polaris";
import store from "store-js";
import { useState, useEffect, useCallback } from "react";
import OrderList from "../components/OrderList/OrderList";
import Settings from "../components/Settings/Settings";
import Inscription from "../components/Inscription/Inscription";
import axios from "axios";
import { SuccessResponse } from "../model/responses.model";
import AdminContext from "../store/orders-context";
import IntegrationContext from "../store/integration-context";
import NavCard from "../components/NavCard/NavCard";
import PlannerPage from "../components/PlannerPage/PlannerPage";
import styles from "./index.module.css";
import SkeletonLoader from "../components/SkeletonLoader/SkeletonLoader";

const Index: React.FC = (props) => {
  const adminCtx = useContext(AdminContext);
  const integrationCtx = useContext(IntegrationContext);

  const [tabIndex, setTabIndex] = useState<number>(0);
  const [loading, setloading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Index useEffect");
    setloading(true);
    integrationCtx.onSetLanguage();
    // cehck the access token to see if integration with RM is setup
    async function getAccessTokenFromDBAsync() {
      try {
        const response = await axios.get("api/integration");
        const result = response?.data as SuccessResponse;
        if (result?.success) {
          console.log("Integration is correct");
          integrationCtx.onIntegrationChange(true);
        } else {
          console.log("Integration is NOT correct");
          integrationCtx.onIntegrationChange(false);
        }
      } catch (err) {
        console.log("err", err);
      }
      setloading(false);
    }

    if (!integrationCtx.isIntegrated) {
      console.log("not integrated: getAccessToken");
      getAccessTokenFromDBAsync();
    } else setloading(false);
  }, []);

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
        isIntegrated={integrationCtx.isIntegrated}
        onClickpageSelection={onClickpageSelection}
        newJobsCount={adminCtx.newJobsCount}
        language={integrationCtx.language}
      />

      {loading ? (
        <React.Fragment>
          <SkeletonLoader />
        </React.Fragment>
      ) : integrationCtx.isIntegrated ? (
        displayTabsPage()
      ) : (
        <Inscription />
      )}
      <div className={tabIndex === 3 ? styles.show : styles.hide}>
        <PlannerPage />
      </div>
    </Page>
  );
};

export default Index;
