import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { Layout, Page, Spinner } from "@shopify/polaris";

import OrdersContext from "../../store/orders-context";
import { useRouter } from "next/router";
import { JobOrder, ShopifyGraphQLOrder } from "../../model/orders.model";
import FulfillCard from "../../components/OrderList/OrderItem/fulfill-card/FulfillCard";
import RouteMagnetCard from "../../components/RouteMagnetCard/RouteMagnetCard";
import { RmJob } from "../../model/jobs.model";
import { wordsMapping } from "../../components/utils/mapping";
import { convertGraphQlToWebHookOrder } from "../../components/utils/convertion";
import { SuccessResponse } from "../../model/responses.model";
import axios from "axios";
import CustomerCard from "../../components/CustomerCard/CustomerCard";
import useErrorToast from "../../hooks/ErrorToast/ErrorToast";
import { GET_ONE_ORDER } from "../../components/utils/graphQlQueries";
import { useApolloClient } from "react-apollo";
import {
  formatOrder,
  getStatusAction,
} from "../../components/utils/orderUtils";
import IntegrationContext from "../../store/integration-context";

/* Order details page 
param OrderId passed via router
*/
const OrderDetails: React.FC = (props) => {
  const client = useApolloClient();
  const router = useRouter();
  const orderId = router.query.orderId;
  const ordersCtx = useContext(OrdersContext);
  const integrationCtx = useContext(IntegrationContext);
  const [order, setOrder] = useState<JobOrder>(null);
  const { displayErrorToast, setErrorToastText } = useErrorToast(5000);
  const [loader, setLoader] = useState<boolean>(false);

  useEffect(() => {
    const o = ordersCtx.jobOrders.find((o) => o.id === orderId);
    setOrder(o);
  }, []);

  const onPushToRM = (jOrder: JobOrder) => {
    console.log("onPushToRM", jOrder);
    setLoader(true);
    const whOrder = convertGraphQlToWebHookOrder(jOrder, integrationCtx.domain);

    axios
      .post(
        `${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add_from_app`,
        JSON.stringify(whOrder)
      )
      .then((response) => {
        console.log("response job", response);
        setLoader(false);
        // if error, object returned has property error
        if (!response.data) {
          console.log(response);
          setErrorToastText("Error pushing order");
          return;
        }
        const job = response.data as RmJob;
        ordersCtx.onJobOrderPush({ ...job });

        //  const o = adminCtx.jobOrders.find(o => o.id === orderId);
        // console.log('just pushed', o);
        setOrder({
          ...jOrder,
          statusAction: { status: "IN_WAITING_QUEUE", action: "" },
          job: { ...job, step: null },
        });
      })
      .catch((err) => {
        setLoader(false);
        setErrorToastText("" + (err ?? "Server Error"));
      });
  };

  const onFulfillOneOrder = (o: JobOrder) => {
    const orderId = o.id; // .replace('gid://shopify/Order/','')
    setLoader(true);
    axios
      .post("/api/fulfillment", {
        action: "create",
        orderId,
        uId: o?.job?.uId ?? null,
        locationId:
          o.lineItems.edges[0]?.node?.fulfillmentService?.location?.id ??
          "fakeId",
      })
      .then((response) => {
        const result = response?.data as SuccessResponse;
        console.log("response fulfillment api", response);

        // successfully fulfilled, now fetch order from shopify to include its last updates
        if (result.success) {
          fetchOneShopifyOrder("gid://shopify/Order/" + orderId).then(
            (order) => {
              setLoader(false);
              console.log("flo2", order);
              ordersCtx.onOneJobOrderChange(order);
              setOrder({ ...order });
            }
          );
        } else {
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log("err fulfillment", err);
      });
  };

  const fetchOneShopifyOrder = (orderId: string): Promise<JobOrder> => {
    console.log("getOneShopifyOrder", orderId);
    let gqlQuery = GET_ONE_ORDER(orderId);
    return client
      .query({ query: gqlQuery, fetchPolicy: "no-cache" })
      .then((data) => {
        if (!data?.data?.order) return null;

        const or = data.data.order as ShopifyGraphQLOrder;
        // change by ref, no copy returned
        formatOrder(or);
        console.log("flo order", or);
        const jobOrder: JobOrder = {
          ...or,
          job: null,
          statusAction: getStatusAction(or.displayFulfillmentStatus, null),
        };
        return jobOrder;
      });
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
            loader={loader}
          />
        </Layout.Section>
        <Layout.Section oneThird>
          <RouteMagnetCard
            key={order.id}
            onPushOrder={onPushToRM}
            onFulfillOrder={onFulfillOneOrder}
            order={order}
          />
        </Layout.Section>
        <Layout.Section oneThird>
          <CustomerCard
            key={order.id}
            onPushOrder={onPushToRM}
            onFulfillOrder={onFulfillOneOrder}
            order={order}
          />
        </Layout.Section>
      </Layout>
      {displayErrorToast}
    </Page>
  ) : (
    <div style={{ textAlign: "center" }}>
      <Spinner accessibilityLabel="Loading Order" />
    </div>
  );
};

export default OrderDetails;
