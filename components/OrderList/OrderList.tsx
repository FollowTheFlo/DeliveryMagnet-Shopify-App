import styles from "./OrderList.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState, useCallback, useContext } from "react";
const axios = require("axios");
import OrdersContext from "../../store/orders-context";
import { useApolloClient } from "react-apollo";
import {
  Card,
  Button,
  IndexTable,
  useIndexResourceState,
  Pagination,
  TextStyle,
  Heading,
  Stack,
} from "@shopify/polaris";
import OrderItem from "./OrderItem/OrderItem";
import {
  GET_DOMAIN,
  GET_ONE_ORDER,
  GET_ORDERS,
  GET_ORDERS_AFTER,
  GET_ORDERS_PREVIOUS,
} from "../utils/graphQlQueries";
import fetchApi from "../utils/fetchApi";
import { JobOrder, ShopifyGraphQLOrder } from "../../model/orders.model";
import { RmJob, RmJobWithStep } from "../../model/jobs.model";
import { SuccessResponse } from "../../model/responses.model";
import {
  CursorSelection,
  IndexListSelection,
  PageInfo,
  StatusAction,
} from "../../model/input.model";
import { convertGraphQlToWebHookOrder } from "../utils/convertion";
import OrdersFilter from "./OrdersFilter/OrdersFilter";
import useErrorToast from "../../hooks/ErrorToast/ErrorToast";
import useSuccessToast from "../../hooks/SuccessToast/SuccessToast";
import { en } from "../utils/localMapping";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader";
import { formatOrder, getStatusAction } from "../utils/orderUtils";
import IntegrationContext from "../../store/integration-context";

/*
Orders list displayed in grid, by page of NEXT_PUBLIC_PAGINATION_NUM orders.
Filter selectbox set on top with 2 types( LocalDeliver & Shipment).
Refresh button besides Filter selectbox.
Pagination arrows on bottom, 
*/

const OrderList: React.FC = (props) => {
  console.log("flo OrderList");

  const client = useApolloClient();

  // const [domain, setDomain] = useState('flo domain');
  const ordersCtx = useContext(OrdersContext);
  const integrationCtx = useContext(IntegrationContext);
  const router = useRouter();
  // displayErrorToast is a jsx element, when setErrorToastText has non empty text, toast appears.
  const { displayErrorToast, setErrorToastText } = useErrorToast(5000); //5sec toast display duration
  // flag to avoid row selection when pressing Button within the row
  let preventRowSelection = false;

  // IndexListSelection values are given when changing selection, we keep track on it as local state
  const [selectedResources, setSelectedResources] =
    useState<IndexListSelection>({
      selectionType: "Single",
      toggleType: false,
      selection: [],
    });
  // inform on loading stage: requesting data on shopify or RM
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  let pageInfo: PageInfo = null; // use for cursor-based pagination, contains hasNextPage:bool, hasPreviousPage:bool

  useEffect(() => {
    console.log("useEffect OrderList");
    // don't fetch orders again if there are already loaded
    if (ordersCtx.jobOrders.length > 0) {
      console.log("dont refresh");
      return;
    }

    // fetch domain from shopify to know which store we dealing with
    client
      .query({ query: GET_DOMAIN })
      .then((domain) => {
        console.log("domain", domain.data.shop.myshopifyDomain);
        if (domain?.data?.shop?.myshopifyDomain) {
          integrationCtx.onDomainChange(domain.data.shop.myshopifyDomain);
          // once we have domain, run JobOrders that will fetch shopify orders then associated jobs from RM
          fetchJobOrders([...ordersCtx.selectedDeliveryType]);
        }
      })
      .catch((err) => console.log("err", err));
  }, []);

  const fetchJobOrders = (filter: string[], cursor?: CursorSelection) => {
    console.log("fetchJobOrders");
    setLoadingMessage("Loading Shopify Orders");
    // 1 -> fetch shopify orders
    queryShopifyOrders(filter, cursor)
      .then((shopifyOrders) => {
        console.log("return queryShopifyOrders", shopifyOrders);
        setLoadingMessage("Loading DeliveryMagnet data");
        // 2 -> fetch Deliveries (called Jobs) on RM associated with shopify order IDs
        return queryRmOrders(shopifyOrders);
      })
      .then((data) => {
        console.log("return data", data);
        // fill context so data are avaialble accross the app
        ordersCtx.onJobOrdersChange(data);
        console.log("pageInfo before ctx", pageInfo);
        // pageInfo is use for cursor-based Pagination, cursor based, shopify gives us hasNextPage hasPreviousPage booleans
        // see https://www.shopify.ca/partners/blog/graphql-pagination
        ordersCtx.onPageInfoChange(pageInfo);
        ordersCtx.onRefreshDateChange(new Date().toLocaleString());
        setLoadingMessage("");
      })
      .catch((errMessage) => {
        console.log("err2", errMessage);
        // when failure, fill empty orders list
        ordersCtx.onJobOrdersChange([]);
        setLoadingMessage(errMessage);
        setErrorToastText(errMessage);
      });
  };

  const buildFilterQuery = (filterList: string[]): string => {
    if (!filterList) {
      ordersCtx.onSetOrdersTitle("Local Delivery Orders");
      return "delivery_method:local";
    }
    let deliveryTypeQuery = "";
    if (filterList.includes("local") && !filterList.includes("shipping")) {
      ordersCtx.onSetOrdersTitle("Local Delivery Orders");
      deliveryTypeQuery += "delivery_method:local";
    } else if (
      !filterList.includes("local") &&
      filterList.includes("shipping")
    ) {
      ordersCtx.onSetOrdersTitle("Shipping Orders");
      deliveryTypeQuery += "delivery_method:shipping";
    } else if (
      filterList.includes("local") &&
      filterList.includes("shipping")
    ) {
      ordersCtx.onSetOrdersTitle("Local Delivery & Shipping Orders");
      // below deliveryTypeQuery will be set as graphql filter in query
      deliveryTypeQuery += "delivery_method:local OR delivery_method:shipping";
    } else {
      deliveryTypeQuery += "delivery_method:local";
    }
    return deliveryTypeQuery;
  };

  const fetchOneShopifyOrder = (orderId: string): Promise<JobOrder> => {
    console.log("getOneShopifyOrder", orderId);
    let gqlQuery = GET_ONE_ORDER(orderId);
    return client
      .query({ query: gqlQuery, fetchPolicy: "no-cache" })
      .then((data) => {
        console.log("getOneShopifyOrder", orderId);
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
  const queryShopifyOrders = (
    deliveryType: string[],
    cursor?: CursorSelection
  ): Promise<ShopifyGraphQLOrder[]> => {
    console.log("queryShopifyOrders", deliveryType);
    const filterQuery = buildFilterQuery(deliveryType);
    // cursor is use for pagination in Graphql, see https://www.shopify.ca/partners/blog/graphql-pagination
    // filterQuery is added in gql query parameter
    // eg of filterQuery: 'delivery_local=local OR delivery_local=shipping'
    let gqlQuery = GET_ORDERS(
      +process.env.NEXT_PUBLIC_PAGINATION_NUM,
      filterQuery
    );
    // get GQL query according to pagination action: befor or after
    if (cursor?.action === "after")
      gqlQuery = GET_ORDERS_AFTER(
        +process.env.NEXT_PUBLIC_PAGINATION_NUM,
        cursor.value,
        filterQuery
      );
    if (cursor?.action === "before")
      gqlQuery = GET_ORDERS_PREVIOUS(
        +process.env.NEXT_PUBLIC_PAGINATION_NUM,
        cursor.value,
        filterQuery
      );

    // fetch Shopify orders with Graphl Apollo client, no-cache as we want to query server at each run
    return client
      .query({ query: gqlQuery, fetchPolicy: "no-cache" })
      .then((data) => {
        // go through encapsulation data.data.orders.edges
        console.log("ordersdata", data);

        if (data?.data?.orders?.pageInfo) {
          console.log("set pageInfo");
          pageInfo = data.data.orders.pageInfo;
        }
        // node obj contains order data, cursor value is one parent above, to easily access it later, we add it in ShopifyGraphQLOrder obj
        // reformat date in friendly format
        const ordersList = data.data.orders.edges.map((o) => {
          return {
            ...o.node,
            cursor: o.cursor,
            // createdAt = new Date(o.createdAt).toLocaleString('en-GB').replace(/(:\d{2}| [AP]M)$/, ""),
          };
        }) as ShopifyGraphQLOrder[];

        // format date with friendly form, eg: 17/06/2021, 15:07
        // note that this operation in map iterator above give us 'Unknow Date', below is the workaround
        ordersList.forEach((o) => {
          formatOrder(o);
        });
        return ordersList;
      })
      .catch((err) => {
        console.log("queryShopifyOrders error", err);
        throw "Error fetching Shopify Orders";
      });
  };

  const queryRmOrders = (
    ordersList: ShopifyGraphQLOrder[]
  ): Promise<JobOrder[]> => {
    // fetch RouteMagnet jobs list then bind it with Shopify Orders, binding based on index matching
    // list of shopify order ids, will be use to retrieve associated RM jobs.
    const orderIDsList = ordersList.map((o) => o.id);
    // ordersList is string[] type
    console.log("queryRmOrders orderIDsList", orderIDsList);
    const shopOrderIDsObj = {
      shop: "shop",
      orderIdsList: orderIDsList,
    };
    // fetch RM jobs with shopify Ids as inputs. shopify id is stored as ExtId on RM Job object.
    return axios
      .post(
        `${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/orderslist/status`,
        JSON.stringify(shopOrderIDsObj)
      )
      .then((response) => {
        const jobs = response?.data as RmJobWithStep[];
        console.log("RmOrders:", JSON.stringify(jobs));

        const fullJobOrderList: JobOrder[] = ordersList.map((order, i) => ({
          ...order,
          job: jobs[i],
          statusAction: getStatusAction(
            order.displayFulfillmentStatus,
            jobs[i]
          ),
        }));

        return fullJobOrderList.slice();
      })
      .catch((err) => {
        console.log("err", err);
        throw "Error fetching RouteMagnet data";
      });
  };

  const onRefresh = (filter?: string[]) => {
    console.log("refresh");
    fetchJobOrders(filter);
  };

  const onPushToRM = (jOrder: JobOrder) => {
    preventRowSelection = true;
    console.log("onPushToRM", jOrder);
    console.log("setPreventSel", true);
    console.log("domain", integrationCtx.domain);

    // convert order in WebHook order format, RM is expecting this format. handy as WebHook also send order in this this format.
    const whOrder = convertGraphQlToWebHookOrder(jOrder, integrationCtx.domain);

    axios
      .post(
        `${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add_from_app`,
        JSON.stringify(whOrder)
      )
      .then((response) => {
        // if error, returned Object conatins property error. check its presence
        if (response.error || !response.data) {
          console.log(response.error);
          setErrorToastText(response.error);
          return;
        }
        const job = response.data as RmJob;
        console.log("push job", job);
        ordersCtx.onJobOrderPush({ ...job });
      })
      .catch((err) => {
        setErrorToastText("" + (en[err?.response?.data?.message] ?? err));
      });
  };

  const onFulfillOneOrder = (o: JobOrder) => {
    console.log("onFulfillOneOrder1", o);
    preventRowSelection = true;
    const orderId = o.id;
    // use REST api to fulfill an order, send request to our NextJS server, then our server will request Shopify
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
        console.log("response webhooks api", result);
        if (result.success) {
          fetchOneShopifyOrder("gid://shopify/Order/" + orderId).then(
            (order) => {
              ordersCtx.onOneJobOrderChange(order);
            }
          );
        }
      })
      .catch((err) => {
        console.log("err fulfillment", err);
      });
  };

  const onSelectionChangeHandler = (
    selectionType: any,
    toggleType: boolean,
    selectedOrderId: any
  ) => {
    console.log(
      "onSelectionChange",
      selectionType,
      toggleType,
      selectedOrderId
    );

    setSelectedResources((prevValue) => {
      return {
        selectionType,
        toggleType,
        selection: selectedOrderId ?? prevValue.selection,
      };
    });

    console.log("preventRowSelection", preventRowSelection);
    // preventRowSelection is true when we press Action button, in this scenario we don't want to select the row, we want button click method.
    // this flag allows us to handle those 2 scenario: row selection click and Action button click
    if (preventRowSelection) {
      console.log("in preventRowSelection condition");
      preventRowSelection = false;
      return;
    }
    if (!selectedOrderId) return;
    // open order details page
    router.push(`/order-details/${selectedOrderId}`);
  };
  // display jobOrder rows form list
  const jobOrderRows = (list: JobOrder[]) => {
    console.log("rowMarkup");
    return list.map((o, i) => {
      return (
        <OrderItem
          index={i}
          key={o.id}
          id={o.id}
          order={o}
          onPushOrder={onPushToRM}
          onFulfillOrder={onFulfillOneOrder}
          selectedResources={selectedResources.selection}
        />
      );
    });
  };
  // grid is a polaris index-table : https://polaris.shopify.com/components/lists-and-tables/index-table#navigation
  const IndexTableBlock = () => {
    return (
      <IndexTable
        selectable={true}
        resourceName={{ singular: "Order", plural: "Orders" }}
        itemCount={ordersCtx.jobOrders.length}
        selectedItemsCount={0}
        loading={loadingMessage ? true : false}
        onSelectionChange={onSelectionChangeHandler}
        headings={[
          { title: "Name" },
          { title: "Created" },
          { title: "Customer" },
          { title: "Status" },
          { title: "Action" },
          { title: "Price" },
          { title: "Delivery Method" },
          { title: "Payment" },
          { title: "items" },
        ]}
      >
        {jobOrderRows(ordersCtx.jobOrders.slice())}
      </IndexTable>
    );
  };

  const onPaginationPrevious = () => {
    // pagination Previous button clicked, get first cursor of jobOrder list as we seek the page before it
    console.log("onPaginationPrevious");
    const firstCursor = ordersCtx?.jobOrders[0]?.cursor ?? null;
    if (!firstCursor) {
      console.log("firstCursor is null");
      return;
    }

    console.log("firstCursor", firstCursor);

    fetchJobOrders([...ordersCtx.selectedDeliveryType], {
      action: "before",
      value: firstCursor,
    });
  };
  const onPaginationNext = () => {
    // pagination Next button clicked, get last cursor of jobOrder list as we seek the page after it
    console.log("onPaginationNext");
    const lastIndex = ordersCtx?.jobOrders?.length - 1 ?? null;
    if (!lastIndex) {
      console.log("lastIndex is null");
      return;
    }
    const lastCursor =
      ordersCtx?.jobOrders[ordersCtx.jobOrders.length - 1]?.cursor ?? null;
    if (!lastCursor) {
      console.log("lastCursor is null");
      return;
    }

    console.log("lastCursor", lastCursor);

    fetchJobOrders([...ordersCtx.selectedDeliveryType], {
      action: "after",
      value: lastCursor,
    });
  };

  const handleDeliveryTypeChange = useCallback((choicesList: string[]) => {
    console.log("handleDeliveryTypeChange", choicesList);
    if (!choicesList || choicesList.length === 0) {
      console.log("empty choice");
      return;
    }
    ordersCtx.onSetSelectedDeliveryType([...choicesList]);
    onRefresh([...choicesList]);
  }, []);

  return (
    <React.Fragment>
      {/* <Image src="/me.png" alt="me" width={100} height={100} />          */}
      <br />
      <Stack>
        <Stack.Item fill>
          <Heading element="h1">{ordersCtx.ordersTitle}</Heading>
        </Stack.Item>
        <Stack.Item fill>
          <div style={{ textAlign: "end" }}>
            {!loadingMessage && (
              <span className={styles.refreshMessage}>
                Last refresh at {ordersCtx.refreshDate}
              </span>
            )}
            {loadingMessage && (
              <span className={styles.refreshMessage}>{loadingMessage}</span>
            )}
            &nbsp;
            <Button onClick={() => onRefresh(["local", "shipping"])}>
              Refresh
            </Button>
          </div>
        </Stack.Item>
      </Stack>
      <br />
      {!loadingMessage || ordersCtx?.jobOrders?.length > 0 ? (
        <Card>
          <Card.Section>
            <Stack alignment="center" distribution="center">
              <Stack.Item>
                <OrdersFilter
                  selectedDeliveryType={ordersCtx.selectedDeliveryType}
                  handleDeliveryTypeChange={handleDeliveryTypeChange}
                />
              </Stack.Item>
            </Stack>

            {ordersCtx?.jobOrders?.length > 0 && IndexTableBlock()}

            <Pagination
              hasPrevious={ordersCtx.pageInfo.hasPreviousPage}
              onPrevious={onPaginationPrevious}
              hasNext={
                ordersCtx.pageInfo.hasNextPage &&
                ordersCtx.jobOrders.length ===
                  +process.env.NEXT_PUBLIC_PAGINATION_NUM
              }
              onNext={onPaginationNext}
            />
          </Card.Section>
        </Card>
      ) : (
        <SkeletonLoader />
      )}
      {displayErrorToast}
    </React.Fragment>
  );
};

export default OrderList;
