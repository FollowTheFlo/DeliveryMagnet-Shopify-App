import React, { useState, useEffect } from "react";
import { OrdersContextType } from "../model/context.model";
import { PageInfo } from "../model/input.model";
import { RmJob } from "../model/jobs.model";
import { JobOrder } from "../model/orders.model";
import { WhMode } from "../model/webhooks.model";

const OrdersContext = React.createContext({
  jobOrders: [],
  onJobOrdersChange: (jOrders) => {},
  onOneJobOrderChange: (jOrder) => {},
  onJobOrderPush: (rMOrderWithStep) => {},
  pageInfo: null,
  onPageInfoChange: (value) => {},
  refreshDate: "",
  onRefreshDateChange: (value) => {},
  newJobsCount: 0,
  onSetNewJobsCount: (value) => {},
} as OrdersContextType);

export const OrdersContextProvider = (props) => {
  // WebHooks about automatic Push: initial state with all unchecked options
  // when first visit on Settings, we will fetch the active option from Shopify
  const [mode, setMode] = useState<WhMode>({
    manual: false,
    auto_create: false,
    auto_fullfill: false,
  });

  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [pageInfo, setPageInfo] = useState({
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [refreshDate, setRefreshDate] = useState<string>("");
  const [selectedDeliveryType, setSelectedDeliveryType] = useState([
    "local",
    "shipping",
  ]);
  const [ordersTitle, setOrdersTitle] = useState(
    "Local Delivery & shipping Orders"
  );
  const [newJobsCount, setNewJobsCount] = useState(0);

  useEffect(() => {
    // get mode from server
    console.log("admin context");
  }, []);

  const onJobOrdersChangeHandler = (jList: JobOrder[]) => {
    console.log("onJobOrdersHandler", jList);
    setJobOrders(jList);
  };

  const onOneJobOrderChangeHandler = (job: JobOrder) => {
    console.log("onOneJobOrderChangeHandler", job);
    // find index first
    const index = jobOrders.findIndex((j) => j.id === job.id);
    if (index === -1) {
      console.log("index not found", job.id);
      return;
    }
    setJobOrders((prevJobOrders: JobOrder[]) => {
      const jobOrdersCopy = prevJobOrders.slice();
      jobOrdersCopy[index] = job;
      return jobOrdersCopy;
    });
  };

  const onJobOrderPushHandler = (rmJob: RmJob) => {
    // pushing to RM
    setJobOrders((prevJobOrders: JobOrder[]) => {
      const updatedJobOrders = prevJobOrders.slice();
      const index = updatedJobOrders.findIndex((o) => o && o.id == rmJob.extId);
      console.log("index prevJobOrders", index);
      if (index != -1) {
        // adding step with null value as new job, not in any itinerary
        const updatedJob = {
          ...updatedJobOrders[index],
          statusAction: { status: "IN_WAITING_QUEUE", action: "" },
          job: { ...rmJob, step: null },
        } as JobOrder;
        updatedJobOrders[index] = updatedJob;
        console.log("prev2", prevJobOrders);
      }

      return updatedJobOrders;
    });
    increaseNewJobsCounter();
  };

  const onOneJobOrderUpdateHandler = (job: JobOrder) => {
    const index = jobOrders.findIndex((j) => j.id === job.id);
    if (index === -1) return;
    //   const jobOrdersCopy = jobOrders.slice();
    // jobOrdersCopy[index] = job;
    //  setJobOrders(jobOrdersCopy);
    setJobOrders((prevJobOrders: JobOrder[]) => {
      const jobOrdersCopy = prevJobOrders.slice();
      jobOrdersCopy[index] = job;
      return jobOrdersCopy;
    });
    return null;
  };

  const onPageInfoChangeHandler = (val: PageInfo) => {
    console.log("onPageInfoChangeHandler:", val);
    setPageInfo(val);
  };

  const onRefreshDateChangeHandler = (val: string) => {
    console.log("onRefreshDateChangeHandler:", val);
    setRefreshDate(val);
  };

  const onSetOrdersTitlehandler = (val: string) => {
    setOrdersTitle(val);
  };

  const onSetSelectedDeliveryTypeHandler = (val: string[]) => {
    setSelectedDeliveryType(val);
  };

  const onSetNewJobsCountHandler = (val: number) => {
    setNewJobsCount(val);
  };

  const increaseNewJobsCounter = () => {
    const updatedCount = newJobsCount + 1;
    setNewJobsCount(updatedCount);
  };

  return (
    <OrdersContext.Provider
      value={{
        // domain: domain,
        //  onDomainChange: domainHandler,
        jobOrders: jobOrders,
        onJobOrdersChange: onJobOrdersChangeHandler,
        onOneJobOrderChange: onOneJobOrderChangeHandler,
        onJobOrderPush: onJobOrderPushHandler,
        //  isIntegrated: isIntegrated,
        //  onIntegrationChange: onIntegrationHandler,
        //   defaultServiceDuration: defaultServiceDuration,
        //   onDefaultServiceDurationChange: onDefaultServiceDurationChangeHandler,
        pageInfo: pageInfo,
        onPageInfoChange: onPageInfoChangeHandler,
        refreshDate: refreshDate,
        onRefreshDateChange: onRefreshDateChangeHandler,
        ordersTitle: ordersTitle,
        onSetOrdersTitle: onSetOrdersTitlehandler,
        selectedDeliveryType: selectedDeliveryType,
        onSetSelectedDeliveryType: onSetSelectedDeliveryTypeHandler,
        newJobsCount: newJobsCount,
        onSetNewJobsCount: onSetNewJobsCountHandler,
      }}
    >
      {props.children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;
