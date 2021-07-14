import { Button, ChoiceList, FormLayout, Popover } from "@shopify/polaris";
import React, { useCallback, useContext, useState } from "react";

const OrdersFilter = (props) => {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    []
  );

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      Delivery Types
    </Button>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      ariaHaspopup={false}
      sectioned
    >
      <FormLayout>
        <ChoiceList
          title="Delivery Type"
          titleHidden
          choices={[
            { label: "Local Delivery", value: "local" },
            { label: "Shipment", value: "shipping" },
          ]}
          selected={props.selectedDeliveryType}
          onChange={props.handleDeliveryTypeChange}
          allowMultiple
        />
      </FormLayout>
    </Popover>
  );
};

export default OrdersFilter;
