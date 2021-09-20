import {
  Button,
  ButtonGroup,
  Card,
  Frame,
  Heading,
  Spinner,
  Toast,
} from "@shopify/polaris";
import React, { useContext, useState } from "react";
import { Company } from "../../../model/company.model";
import { RmJob } from "../../../model/jobs.model";
import useErrorToast from "../../../hooks/ErrorToast/ErrorToast";
import ErrorToast from "../../../hooks/ErrorToast/ErrorToast";
import { en } from "../../utils/localMapping";
import { TestOrder } from "../../utils/templates";
import useSuccessToast from "../../../hooks/SuccessToast/SuccessToast";
import AdminContext from "../../../store/admin-context";
import styles from "./TestConnection.module.css";
const axios = require("axios");

const TestConnection = (props) => {
  const [company, setCompany] = useState<Company>(null);
  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [loading, setLoading] = useState(false);
  const { displayErrorToast, setErrorToastText } = useErrorToast();
  const { displaySuccessToast, setSuccessToastText } = useSuccessToast();
  const adminCtx = useContext(AdminContext);

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
        JSON.stringify(TestOrder)
      )
      .then((response) => {
        if (response?.error) {
          console.log(response.error);
          setErrorToastText("" + response.error ?? "Server error");
          return null;
        }
        const job = response.data as RmJob;
        //   setSuccessToastText("Test order pushed");
        return job;
      });
    // .catch((err) => {
    //   setErrorToastText("" + (en[err?.response?.data?.message] ?? err));
    // });
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
      if (job) setSuccessToastText("Order sent succefully");
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
        setSuccessToast("RouteMagnet Integration unactivated");
        adminCtx.onIntegrationChange(false);
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
        {loading && <Spinner accessibilityLabel="Loading" size="small" />}
        <br />
        <div style={{ textAlign: "center" }}>
          <ButtonGroup>
            <Button onClick={onCheckCompanyInfo}>Check Company Info</Button>
            <Button onClick={onSendTestOrder}>Push Test order</Button>
            <Button onClick={onUnactiveAccount}>Unactivate account</Button>
          </ButtonGroup>
        </div>
        {company && (
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
        <br />
      </Card.Section>
      {/* <ErrorToast errorToast={errorToast} setErrorToast={setErrorToast} /> */}
      {displaySuccessToast}
      {displayErrorToast}
    </Card>
  );
};
export default TestConnection;
