import { Page, Tabs } from "@shopify/polaris";
import React, { useCallback, useContext, useState } from "react";
import Inscription from "../../components/Inscription/Inscription";
import OrderList from "../../components/OrderList/OrderList";
import Settings from "../../components/Settings/Settings";

const OrdersListPage: React.FC = (props) => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const tabs = [
    {
      id: "orders",
      content: "Orders",
    },
    {
      id: "config",
      content: "Config",
    },
  ];

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setTabIndex(selectedTabIndex),
    []
  );

  const displayTabsPage = () => {
    return tabIndex === 0 ? (
      <React.Fragment>
        <OrderList />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <Settings />
      </React.Fragment>
    );
  };

  return (
    <Page>
      <Tabs
        tabs={tabs}
        selected={tabIndex}
        onSelect={handleTabChange}
        fitted
      ></Tabs>
      {displayTabsPage()}
    </Page>
  );
};

export default OrdersListPage;
