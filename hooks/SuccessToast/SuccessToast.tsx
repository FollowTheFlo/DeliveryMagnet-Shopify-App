import { Frame, Toast } from "@shopify/polaris";
import React, { useState } from "react";

const useSuccessToast = (mseconds?: number) => {
  const [successToastText, setSuccessToastText] = useState("");
  const [duration, setDuration] = useState(mseconds ?? 5000);

  const displaySuccessToast = successToastText ? (
    <div style={{ height: "50px" }}>
      <Frame>
        <Toast
          content={successToastText}
          onDismiss={() => setSuccessToastText("")}
          duration={duration}
        />
      </Frame>
    </div>
  ) : null;

  return {
    displaySuccessToast: displaySuccessToast,
    setSuccessToastText: setSuccessToastText,
    setDuration: setDuration,
  };
};
export default useSuccessToast;
