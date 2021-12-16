import { Button, ChoiceList, FormLayout, Popover } from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from "react";

/*
Orders filter popover contains 2 choices: LocalDelivery & Shipment.
*/

type OrdersFilterProps = {
  selectedDeliveryType: string[];
  handleDeliveryTypeChange: (choicesList: string[]) => void;
};

function deepCompareProps(prevProps: any, nextProps: any) {
  const list = prevProps.selectedDeliveryType as string[];
  const isSame =
    prevProps?.selectedDeliveryType?.length ===
      nextProps?.selectedDeliveryType?.length &&
    list.every((item, index) => item === nextProps.selectedDeliveryType[index])
      ? true
      : false;

  console.log("OrdersFilter isDeepCompareSame", isSame);
  return isSame;
}

const OrdersFilter = (props: OrdersFilterProps) => {
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

export default React.memo(OrdersFilter, deepCompareProps);
