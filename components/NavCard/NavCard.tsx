import { Button, ButtonGroup, Card } from "@shopify/polaris";
import React, { useState } from "react";
import { translate } from "../utils/mapping";
import styles from "./NavCard.module.css";

const NavCard = (props) => {
  return (
    <Card>
      <Card.Section>
        {/* <div style={{ verticalAlign: "middle" }}> */}
        <ButtonGroup>
          <Button
            primary
            pressed={props.tabIndex === 0 ? true : false}
            disabled={!props.isIntegrated}
            onClick={() => props.onClickpageSelection(0)}
          >
            {translate.ORDERS[props.language]}
          </Button>
          <Button
            pressed={props.tabIndex === 3 ? true : false}
            primary
            disabled={!props.isIntegrated}
            onClick={() => props.onClickpageSelection(3)}
          >
            {translate.PLANNER[props.language]}{" "}
            {props?.newJobsCount > 0 ? " +" + props.newJobsCount : ""}
          </Button>
          <Button
            pressed={props.tabIndex === 1 ? true : false}
            disabled={!props.isIntegrated}
            onClick={() => props.onClickpageSelection(1)}
          >
            {translate.SETTINGS[props.language]}
          </Button>

          <Button>FAQ - Support</Button>
        </ButtonGroup>
      </Card.Section>
    </Card>
  );
};

export default NavCard;
