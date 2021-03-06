import { Button, ButtonGroup, Card, Heading } from "@shopify/polaris";
import React, { useContext, useState } from "react";
import { Company } from "../../../model/company.model";
import { RmJob } from "../../../model/jobs.model";
import useErrorToast from "../../../hooks/ErrorToast/ErrorToast";
import { en } from "../../utils/localMapping";
import { TestOrder } from "../../utils/templates";
import useSuccessToast from "../../../hooks/SuccessToast/SuccessToast";
import styles from "./TestConnection.module.css";
import IntegrationContext from "../../../store/integration-context";
import SkeletonLoader from "../../SkeletonLoader/SkeletonLoader";
const axios = require("axios");

const TestConnection = (props) => {
  const [company, setCompany] = useState<Company>(null);
  const [successToast, setSuccessToast] = useState("");
  const [loading, setLoading] = useState(false);
  const { displayErrorToast, setErrorToastText } = useErrorToast();
  const { displaySuccessToast, setSuccessToastText } = useSuccessToast();
  const integrationCtx = useContext(IntegrationContext);

  const fetchCompany = (): Promise<Company> => {
    return axios
      .get(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/company`)
      .then((response) => {
        const company = response?.data as Company;
        return company;
      });
  };

  const pushTestOrder = (): Promise<Company> => {
    return axios
      .post(
        `${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add_from_app`,
        JSON.stringify({
          ...TestOrder,
          order_status_url: TestOrder.order_status_url.replace(
            "domain",
            integrationCtx.domain
          ),
        })
      )
      .then((response) => {
        if (response?.error) {
          console.log(response.error);
          setErrorToastText("" + response.error ?? "Server error");
          return null;
        }
        const job = response.data as RmJob;
        return job;
      });
  };

  const unactiveIntegration = (): Promise<boolean> => {
    return axios
      .get(`${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/unactivate`)
      .then((response) => {
        if (response?.error || !response?.data?.success) {
          console.log(response.error);
          return null;
        }
        const success = response.data.success as boolean;
        return success;
      });
  };

  const onCheckCompanyInfo = async () => {
    console.log("onCheckCompanyInfo");
    setLoading(true);
    try {
      const company = await fetchCompany();
      setLoading(false);
      if (company._id && !company.location && !company.name) {
        setErrorToastText("Company found but address and name are empty");
        return;
      }
      setCompany(company);
      setSuccessToast("Company found");
    } catch (err) {
      setLoading(false);
      console.log("company err", JSON.stringify(err.response.data.message));
      setErrorToastText("" + (en[err?.response?.data?.message] ?? err));
    }
  };
  const onSendTestOrder = async () => {
    console.log("onSendTestOrder");
    setLoading(true);
    try {
      const job = await pushTestOrder();
      console.log("push test job", job);
      setLoading(false);
      if (job) setSuccessToastText("Order sent successfully");
    } catch (err) {
      setLoading(false);
      setErrorToastText("" + (en[err?.response?.data?.message] ?? err));
    }
  };

  const onUnactiveAccount = async () => {
    console.log("onUnactiveAccount");
    setLoading(true);
    try {
      const success = await unactiveIntegration();
      setLoading(false);
      if (!success) setErrorToastText("Server error");
      if (success) {
        setSuccessToast("DeliveryMagnet Integration unactivated");
        integrationCtx.onIntegrationChange(false);
      }
    } catch (err) {
      setLoading(false);
      setErrorToastText("" + (en[err?.response?.data?.message] ?? err));
    }
  };

  return (
    <Card>
      <Card.Section>
        <Heading>Integration Info</Heading>
        <br />
        <div style={{ textAlign: "center" }}>
          <ButtonGroup>
            <Button onClick={onCheckCompanyInfo}>Check Company Info</Button>
            <Button onClick={onSendTestOrder}>Push Test order</Button>
            <Button onClick={onUnactiveAccount}>Unactivate account</Button>
          </ButtonGroup>
        </div>
        {company && !loading && (
          <Card>
            <Card.Section>
              <div>
                Name: <b>{company.name}</b>
              </div>
              <div>
                Phone: <b>{company.phone}</b>
              </div>
              <div>
                Email: <b>{company.email}</b>
              </div>
              <div>
                Address:<b>{company.location.address}</b>
              </div>
              {company.imageUrl && (
                <div>
                  <img className={styles.logo} src={company.imageUrl}></img>
                </div>
              )}
            </Card.Section>
          </Card>
        )}
        <div>{loading && <SkeletonLoader />}</div>
        <br />
      </Card.Section>
      {displaySuccessToast}
      {displayErrorToast}
    </Card>
  );
};
export default TestConnection;
