import { Button, ButtonGroup, Card } from "@shopify/polaris";
import React from "react";
import styles from "./NavCard.module.css";

const NavCard = (props) => {
  return (
    <Card>
      <Card.Section>
        {/* <div style={{ verticalAlign: "middle" }}> */}
        <ButtonGroup>
          <Button
            primary
            disabled={!props.isIntegrated}
            onClick={() => props.onClickpageSelection(0)}
          >
            Orders
          </Button>
          <Button
            disabled={!props.isIntegrated}
            onClick={() => props.onClickpageSelection(1)}
          >
            Settings
          </Button>
          <Button
            primary
            disabled={!props.isIntegrated}
            onClick={() => props.onClickpageSelection(3)}
          >
            Planner
          </Button>
          <Button>FAQ - Support</Button>
        </ButtonGroup>
      </Card.Section>
    </Card>
  );
};

export default NavCard;
