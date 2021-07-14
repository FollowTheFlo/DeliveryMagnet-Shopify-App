import {
  Button,
  Card,
  Checkbox,
  DescriptionList,
  Form,
  FormLayout,
  Layout,
  List,
  TextField,
  TextStyle,
} from "@shopify/polaris";
import axios from "axios";
import React, { useEffect, useState, useCallback, useContext } from "react";
import { SuccessResponse } from "../../model/responses.model";
import AdminContext from "../../store/admin-context";

const Inscription: React.FC = (props) => {
  const [newsletter, setNewsletter] = useState(false);
  const [code, setCode] = useState("");
  const ctx = useContext(AdminContext);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log("handleSubmit1", code);
    const tempCode = e.target.codeField.value;
    console.log("handleSubmit2", tempCode);
    if (!tempCode || tempCode === "") {
      console.log("Please enter code");
      return;
    }

    // setCode(tempCode);

    console.log("handleSubmit", tempCode);
    axios
      .post("/api/integration/activate", { code: tempCode })
      .then((response) => {
        const result = response?.data as SuccessResponse;
        console.log("response integration api", result);

        if (!result || !result.success) {
          console.log("problem while activation");
          return;
        }

        ctx.onIntegrationChange(true);
      })
      .catch((err) => {
        console.log("err fulfillment", err);
      });
  }, []);

  const handleCodeChange = useCallback((value) => {
    console.log("handleChange", value);
    setCode(value);
  }, []);

  return (
    <Layout>
      <Layout.Section>
        <Card title="Activation">
          <Card.Section>
            <List type="bullet">
              <List.Item>
                <b>Step1:</b> Create a free RouteMagnet account on{" "}
                <a
                  target="_blank"
                  href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/register`}
                >
                  Register
                </a>
              </List.Item>
              <List.Item>
                <b>Step2:</b> Create a team on RouteMagnet{" "}
                <a
                  target="_blank"
                  href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/tabs/dashboard`}
                >
                  Dashboard
                </a>
              </List.Item>
              <List.Item>
                <b>Step3:</b> Generate API code on{" "}
                <a
                  target="_blank"
                  href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/tabs/integration`}
                >
                  Integration page
                </a>
              </List.Item>
              <List.Item>
                <b>Step4:</b> Copy and paste API code below, Press 'Connect with
                RouteMagnet'
              </List.Item>
            </List>

            <br />
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                {/* <Checkbox
                label="Sign up for the Polaris newsletter"
                checked={newsletter}
                onChange={handleNewsLetterChange}
              /> */}

                <TextField
                  id="codeField"
                  value={code}
                  onChange={handleCodeChange}
                  label="API Code"
                  type="text"
                  clearButton
                  onClearButtonClick={() => setCode("")}
                />

                <Button disabled={!code} submit>
                  Connect with RouteMagnet
                </Button>
              </FormLayout>
            </Form>
          </Card.Section>
        </Card>
      </Layout.Section>
      <Layout.Section oneThird></Layout.Section>
    </Layout>
  );
};

export default Inscription;
