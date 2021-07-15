import { Frame, Toast } from "@shopify/polaris";
import React, { useState } from "react";

const useErrorToast = (d?: number) => {
  const [errorToastText, setErrorToastText] = useState("");
  const [duration, setDuration] = useState(d ?? 10000);

  const displayErrorToast = errorToastText ? (
    <div style={{ height: "50px" }}>
      <Frame>
        <Toast
          error
          content={errorToastText}
          onDismiss={() => setErrorToastText("")}
          duration={duration}
        />
      </Frame>
    </div>
  ) : null;

  return {
    displayErrorToast: displayErrorToast,
    setErrorToastText: setErrorToastText,
    setDuration: setDuration,
  };
};
export default useErrorToast;
