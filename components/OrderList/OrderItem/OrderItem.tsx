import {
  TextStyle,
  Button,
  Badge,
  IndexTable,
  Spinner,
  Link,
} from "@shopify/polaris";

import React, { useEffect, useState } from "react";
import { JobOrder } from "../../../model/orders.model";
import {
  wordsMapping,
  currencyMapping,
  paidStatusMapping,
} from "../../utils/mapping";

type OrderItemProps = {
  id: string;
  order: JobOrder;
  onPushOrder: (o: JobOrder) => void;
  onFulfillOrder: (o: JobOrder) => void;
  onSelectOrder: (iId: string) => void;
  index: number;
  selectedResources: string[];
};

const OrderItem = (props: OrderItemProps) => {
  const { selectedResources, index, order, onPushOrder, onFulfillOrder } =
    props;
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("OrderItem useEffect");
    // always hide loading spinner, it could be re-render after async Actions: Fullfil or PushToRM
    setBtnLoading(false);
  }, [order.statusAction.action]);

  const pushToRm = (orderSelection: JobOrder) => {
    console.log("pushToRm orderId", orderSelection);
    setBtnLoading(true);
    onPushOrder(orderSelection);
  };

  const fulfillOrder = (o: JobOrder) => {
    console.log("fulfillOrder", o);
    if (o.displayFulfillmentStatus !== "UNFULFILLED") return;
    setBtnLoading(true);
    onFulfillOrder(o);
  };

  const deliveryMethodCol = (o: JobOrder) => {
    const rawMethod =
      o?.fulfillmentOrders?.edges[0]?.node?.deliveryMethod?.methodType ?? null;

    return rawMethod == "LOCAL" ? "Local Delivery" : "Shipment";
  };

  const statusCol = (o: JobOrder) => {
    // const statusAction = getStatusAction(o);
    const status =
      o.statusAction.status === "UNFULFILLED" ||
      o.statusAction.status === "READY_FOR_DELIVERY"
        ? "attention"
        : "info";
    return <Badge status={status}>{wordsMapping[o.statusAction.status]}</Badge>;
  };
  const actionCol = (o: JobOrder) => {
    // no action button if order is canceled
    if (o.cancelledAt) return "";

    if (btnLoading) {
      return <Spinner accessibilityLabel="Loading" size="small" />;
    }
    if (o.statusAction.status === "UNFULFILLED" && !btnLoading) {
      return (
        <Button size="slim" onClick={() => fulfillOrder(order)}>
          {wordsMapping[o.statusAction.action]}
        </Button>
      );
    }
    if (o.statusAction.status === "READY_FOR_DELIVERY" && !btnLoading) {
      return (
        <Button size="slim" onClick={() => pushToRm(order)}>
          {wordsMapping[o.statusAction.action]}
        </Button>
      );
    }
    return "";
  };

  const itemsCountCol = (o: JobOrder) => {
    const count = o.lineItems.edges.length;

    return count === 1 ? " item" : " items";
  };

  const paidCol = (o: JobOrder) => {
    return (
      <Badge status={paidStatusMapping[o.displayFinancialStatus].color}>
        {paidStatusMapping[o.displayFinancialStatus].value}
      </Badge>
    );
  };

  return (
    <IndexTable.Row
      id={props.id}
      selected={selectedResources.includes(props.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Link onClick={() => props.onSelectOrder(props.id)}>
          <TextStyle variation="strong">
            {order.cancelledAt ? <del>{order.name}</del> : order.name}
          </TextStyle>
        </Link>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {order.cancelledAt ? <del> {order?.createdAt}</del> : order?.createdAt}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {order.cancelledAt ? (
          <del>
            {" "}
            {order?.shippingAddress?.firstName}{" "}
            {order?.shippingAddress?.lastName}
          </del>
        ) : (
          <p>
            {order?.shippingAddress?.firstName}{" "}
            {order?.shippingAddress?.lastName}
          </p>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>{statusCol(order)}</IndexTable.Cell>
      <IndexTable.Cell>{actionCol(order)}</IndexTable.Cell>
      <IndexTable.Cell>
        {order.cancelledAt ? (
          <del>
            {" "}
            {currencyMapping[order?.totalPriceSet.shopMoney.currencyCode]}
            {order?.totalPriceSet.shopMoney.amount}
          </del>
        ) : (
          <p>
            {currencyMapping[order?.totalPriceSet.shopMoney.currencyCode]}
            {order?.totalPriceSet.shopMoney.amount}
          </p>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>{deliveryMethodCol(order)}</IndexTable.Cell>
      <IndexTable.Cell>{paidCol(order)}</IndexTable.Cell>
      <IndexTable.Cell>
        {order.cancelledAt ? (
          <del> {order.lineItems.edges.length + itemsCountCol(order)}</del>
        ) : (
          order.lineItems.edges.length + itemsCountCol(order)
        )}
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};

export default OrderItem;
