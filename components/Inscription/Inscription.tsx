import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  List,
  TextField,
} from "@shopify/polaris";
import axios from "axios";
import React, { useState, useCallback, useContext, useEffect } from "react";
import useErrorToast from "../../hooks/ErrorToast/ErrorToast";
import { SuccessResponse } from "../../model/responses.model";
import IntegrationContext from "../../store/integration-context";
import styles from "./Inscription.module.css";

const Inscription: React.FC = (props) => {
  const [code, setCode] = useState("");
  const [url, setUrl] = useState(
    `${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/tabs/builder?action=register`
  );
  const { displayErrorToast, setErrorToastText } = useErrorToast();
  const ctx = useContext(IntegrationContext);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log("handleSubmit1", code);
    const tempCode = e.target.codeField.value;
    console.log("handleSubmit2", tempCode);
    if (!tempCode || tempCode === "") {
      console.log("Please enter code");
      return;
    }

    console.log("handleSubmit", tempCode);
    axios
      .post("/api/integration/activate", { code: tempCode })
      .then((response) => {
        const result = response?.data as SuccessResponse;
        console.log("response integration api", result);

        if (!result) {
          console.log("problem while activation");
          setErrorToastText("Server error");
          return;
        }
        if (result && !result.success) {
          console.log("problem while activation", result.message);
          setErrorToastText(result.message);
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
      <Layout.Section oneHalf>
        <br />
        <Card title="Activation">
          <Card.Section>
            <List type="bullet">
              <List.Item>
                <b>Step1:</b> Create a free DeliveryMagnet account on{" "}
                <div
                  className={styles.clickable}
                  onClick={() =>
                    setUrl(
                      `${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/tabs/builder?action=register`
                    )
                  }
                >
                  Register
                </div>
              </List.Item>
              <List.Item>
                <b>Step2:</b> Generate API code on{" "}
                <div
                  className={styles.clickable}
                  onClick={() =>
                    setUrl(
                      `${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/tabs/integration`
                    )
                  }
                >
                  Integration page
                </div>
              </List.Item>
              <List.Item>
                <b>Step3:</b> Copy and paste API code below, Press 'Connect with
                DeliveryMagnet'
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
                  autoComplete="off"
                />

                <Button disabled={!code} submit>
                  Connect with DeliveryMagnet
                </Button>
              </FormLayout>
            </Form>
          </Card.Section>
        </Card>
        {displayErrorToast}
      </Layout.Section>
      <Layout.Section oneHalf>
        <React.Fragment>
          <iframe
            frameBorder="0"
            width="100%"
            height="600px"
            src={url}
          ></iframe>
        </React.Fragment>
      </Layout.Section>
    </Layout>
  );
};

export default React.memo(Inscription);
