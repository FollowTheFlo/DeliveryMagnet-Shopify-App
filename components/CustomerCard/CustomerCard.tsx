import { Button, Card, Form, Link, Stack, TextStyle } from "@shopify/polaris";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { JobOrderProps } from "../../model/input.model";
import AdminContext from "../../store/orders-context";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import styles from "./CustomerCard.module.css";

const CustomerCard = (props: JobOrderProps) => {
  const { order } = props;
  const router = useRouter();
  const adminCtx = useContext(AdminContext);
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const onClickMoreDetails = () => {
    console.log("onClickMoreDetails");
    redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
      name: Redirect.ResourceType.Order,
      resource: {
        id: order.id,
      },
    });
  };

  const onClickCustomer = (id: string) => {
    console.log("onClickCustomer", id);
    redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
      name: Redirect.ResourceType.Customer,
      resource: {
        id: id,
      },
    });
  };

  return (
    <React.Fragment>
      <Card>
        <Card.Section>
          <Stack distribution="center">
            <Stack.Item fill={true}>
              <TextStyle variation="strong">Customer</TextStyle>
            </Stack.Item>
          </Stack>
          {/* "gid://shopify/Customer/5122660073643" */}
          <Stack distribution="leading">
            <Stack.Item fill={true}>
              {order?.customer?.lastName && (
                <Button
                  plain
                  onClick={() => onClickCustomer(order.customer.id)}
                >
                  {order?.customer?.firstName ? order.customer.firstName : ""}{" "}
                  {order?.customer?.lastName ? order.customer.lastName : ""}
                </Button>
              )}
            </Stack.Item>
          </Stack>
        </Card.Section>
        <Card.Section>
          <Stack distribution="center">
            <Stack.Item fill={true}>
              <TextStyle variation="strong">Contact Info</TextStyle>
            </Stack.Item>
          </Stack>

          <Stack distribution="leading">
            <Stack.Item fill={true}>
              {order?.customer?.email ? (
                <TextStyle variation="subdued">
                  {" "}
                  email:{order.customer.email}
                </TextStyle>
              ) : (
                "No email address provided"
              )}
            </Stack.Item>
          </Stack>
          <Stack>
            <Stack.Item fill={true}>
              {order?.customer?.phone ? (
                <TextStyle variation="subdued">
                  phone:{order.customer.phone}
                </TextStyle>
              ) : (
                "No phone number provided"
              )}
            </Stack.Item>
          </Stack>
        </Card.Section>
        <Card.Section>
          <Stack distribution="center">
            <Stack.Item fill={true}>
              <TextStyle variation="strong">Shipment info</TextStyle>
            </Stack.Item>
          </Stack>
          <Stack>
            <Stack.Item fill={true}>
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </Stack.Item>
          </Stack>
          <Stack>
            <Stack.Item fill={true}>
              {order?.shippingAddress?.address1 && (
                <div>
                  <TextStyle variation="subdued">
                    {" "}
                    Address:{order.shippingAddress.address1}
                  </TextStyle>
                </div>
              )}
            </Stack.Item>
          </Stack>

          <Stack>
            <Stack.Item>
              {order?.shippingAddress?.address2 && (
                <div>
                  <TextStyle variation="subdued">
                    {" "}
                    {order.shippingAddress.address2}
                  </TextStyle>
                </div>
              )}
            </Stack.Item>
          </Stack>
          <Stack>
            <Stack.Item>
              {order?.shippingAddress?.provinceCode && (
                <div>
                  <TextStyle variation="subdued">
                    {order.shippingAddress.provinceCode}
                  </TextStyle>
                </div>
              )}
            </Stack.Item>
          </Stack>
          <Stack>
            <Stack.Item>
              {order?.shippingAddress?.country && (
                <div>
                  <TextStyle variation="subdued">
                    {order.shippingAddress.country}
                  </TextStyle>
                </div>
              )}
            </Stack.Item>
          </Stack>

          <Stack>
            <Stack.Item>
              {order?.shippingAddress?.country && (
                <div>
                  <TextStyle variation="subdued">
                    {order.shippingAddress.country}
                  </TextStyle>
                </div>
              )}
            </Stack.Item>
          </Stack>
        </Card.Section>
      </Card>

      <Card title="Additional Details">
        <TextStyle variation="subdued">
          <div className={styles.centerEl}>
            Quick Link to Shopify Order Details
          </div>
        </TextStyle>
        <Card.Section>
          {/* <Form onSubmit={handleSubmit}>
                    
                </Form> */}
          <div className={styles.centerEl}>
            <Button onClick={onClickMoreDetails}>Display</Button>
          </div>
        </Card.Section>
      </Card>
    </React.Fragment>
  );
};

export default CustomerCard;
