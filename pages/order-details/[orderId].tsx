import React, { useContext } from "react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  CircleTickMajor,
  ArrowLeftMinor,
  CirclePlusOutlineMinor,
  ArrowDownMinor,
} from "@shopify/polaris-icons";
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Layout,
  ButtonGroup,
  Button,
  Page,
  Tabs,
  TextField,
  Heading,
  Badge,
} from "@shopify/polaris";

import AdminContext from "../../store/admin-context";
import { useRouter } from "next/router";
import { JobOrder, WHOrder } from "../../model/orders.model";
import { Header } from "@shopify/polaris/dist/types/latest/src/components/Card/components";
import FulfillCard from "../../components/OrderList/OrderItem/fulfill-card/FulfillCard";
import RouteMagnetCard from "../../components/RouteMagnetCard/RouteMagnetCard";
import fetchApi from "../../components/utils/fetchApi";
import { RmJob } from "../../model/jobs.model";
import { wordsMapping } from "../../components/utils/mapping";
import { convertGraphQlToWebHookOrder } from "../../components/utils/convertion";
import { SuccessResponse } from "../../model/responses.model";
import axios from "axios";
import CustomerCard from "../../components/CustomerCard/CustomerCard";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

const OrderDetails: React.FC = (props) => {
  const fulfillMapping = {
    FULFILLED: "Fulfilled",
    UNFULFILLED: "Unfulfilled",
  };

  const router = useRouter();
  const orderId = router.query.orderId;
  const adminCtx = useContext(AdminContext);
  const [order, setOrder] = useState<JobOrder>(null);

  useEffect(() => {
    const o = adminCtx.jobOrders.find((o) => o.id === orderId);
    setOrder(o);
  }, []);

  const onPushToRM = (jOrder: JobOrder) => {
    console.log("onPushToRM", jOrder);
    const whOrder = convertGraphQlToWebHookOrder(jOrder, adminCtx.domain);

    fetchApi({
      method: "post",
      body: JSON.stringify(whOrder),
      url: `${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add`,
    }).then((response) => {
      console.log("response job", response);
      // if error, object returned has property error
      if (response.error) {
        console.log(response.error);
        return;
      }
      const job = response as RmJob;
      adminCtx.onJobOrderPush({ ...job });

      //  const o = adminCtx.jobOrders.find(o => o.id === orderId);
      // console.log('just pushed', o);
      setOrder({
        ...jOrder,
        statusAction: { status: "IN_WAITING_QUEUE", action: "" },
        job: { ...job, step: null },
      });
    });
  };

  const onFulfillOneOrder = (o: JobOrder) => {
    const orderId = o.id; // .replace('gid://shopify/Order/','')
    axios
      .post("/api/fulfillment", {
        action: "create",
        orderId,
        uId: o?.job?.uId ?? null,
      })
      .then((response) => {
        const result = response?.data as SuccessResponse;

        console.log("response webhooks api", result);
        console.log("response fulfillment api", response);
        if (result.success) {
          //
          o.displayFulfillmentStatus = "FULFILLED";
          o.statusAction = {
            status: "READY_FOR_DELIVERY",
            action: "PUSH_TO_ROUTEMAGNET",
          };
          o.lineItems.edges.forEach(
            (item) => (item.node.fulfillmentStatus = "fulfilled")
          );
          adminCtx.onOneJobOrderChange({ ...o });
          setOrder({ ...o });
          // refresh();
        }
      })
      .catch((err) => {
        console.log("err fulfillment", err);
      });
  };

  const refresh = () => {
    const o = adminCtx.jobOrders.find((o) => o.id === orderId);
    setOrder(o);
  };

  return order ? (
    <Page
      fullWidth
      breadcrumbs={[
        { content: `order ${order.name}`, onAction: () => router.push("/") },
      ]}
      title={`Order ${order.name}`}
      subtitle={
        order.cancelledAt
          ? "Created at " +
            order?.createdAt +
            " - Canceled at " +
            order.cancelledAt
          : "Created at " +
            order?.createdAt +
            " - " +
            wordsMapping[order.statusAction.status]
      }
    >
      <Layout>
        <Layout.Section oneThird>
          <FulfillCard
            onPushOrder={onPushToRM}
            onFulfillOrder={onFulfillOneOrder}
            order={order}
          />
        </Layout.Section>
        <Layout.Section oneThird>
          <RouteMagnetCard
            onPushOrder={onPushToRM}
            onFulfillOrder={onFulfillOneOrder}
            order={order}
          />
        </Layout.Section>
        <Layout.Section oneThird>
          <CustomerCard
            onPushOrder={onPushToRM}
            onFulfillOrder={onFulfillOneOrder}
            order={order}
          />
        </Layout.Section>
      </Layout>
    </Page>
  ) : (
    <p>Loading Order</p>
  );
};

export default OrderDetails;
