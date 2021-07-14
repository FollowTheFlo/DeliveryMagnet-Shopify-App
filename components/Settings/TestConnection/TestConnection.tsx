import {
  Button,
  ButtonGroup,
  Card,
  Frame,
  Heading,
  Spinner,
  Toast,
} from "@shopify/polaris";
import React, { useState } from "react";
import { Company } from "../../../model/company.model";
import { RmJob } from "../../../model/jobs.model";
import { TestOrder } from "../../utils/templates";
const axios = require("axios");

const TestConnection = (props) => {
  const [company, setCompany] = useState<Company>(null);
  const [successTest, setSuccessTest] = useState(false);
  const [errorTest, setErrorTest] = useState(false);
  const [loading, setLoading] = useState(false);

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
        `${process.env.NEXT_PUBLIC_RM_SERVER_URL}/shopify/order/add`,
        JSON.stringify(TestOrder)
      )
      .then((response) => {
        if (response.error) {
          console.log(response.error);
          return null;
        }
        const job = response as RmJob;
        return job;
      });
  };

  const onCheckCompanyInfo = async () => {
    console.log("onCheckCompanyInfo");
    setLoading(true);
    try {
      const company = await fetchCompany();
      setLoading(false);
      setCompany(company);
    } catch (err) {
      setLoading(false);
      setErrorTest(true);
    }
  };
  const onSendTestOrder = async () => {
    console.log("onSendTestOrder");
    setLoading(true);
    try {
      const job = await pushTestOrder();
      console.log("push test job", job);
      setLoading(false);
      setSuccessTest(true);
    } catch (err) {
      setLoading(false);
      setErrorTest(true);
    }
  };

  const successToast = successTest ? (
    <div style={{ height: "50px" }}>
      <Frame>
        <Toast
          content="Success, Test order is now in RouteMagnet waiting List"
          onDismiss={() => setSuccessTest(!successTest)}
          duration={10000}
        />
      </Frame>
    </div>
  ) : null;

  const errorToast = errorTest ? (
    <div style={{ height: "50px" }}>
      <Frame>
        <Toast
          error
          content="Error, connection failed"
          onDismiss={() => setErrorTest(!errorTest)}
          duration={10000}
        />
      </Frame>
    </div>
  ) : null;

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
                  <img src={company.imageUrl}></img>
                </div>
              )}
            </Card.Section>
          </Card>
        )}
        <br />
      </Card.Section>
      {successToast}
      {errorToast}
    </Card>
  );
};
export default TestConnection;
