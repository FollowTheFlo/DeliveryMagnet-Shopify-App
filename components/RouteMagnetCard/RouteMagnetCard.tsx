import React, { useContext, useState } from "react";
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Layout,
  ButtonGroup,
  Button,
  Page,
  Tabs,
  TextField,
  Heading,
  Badge,
  Icon,
} from "@shopify/polaris";
import { JobOrder } from "../../model/orders.model";
import {
  CircleTickMajor,
  ArrowLeftMinor,
  ChevronRightMinor,
  CirclePlusOutlineMinor,
  ChevronDownMinor,
  ArrowDownMinor,
} from "@shopify/polaris-icons";
import { wordsMapping, currencyMapping } from "../utils/mapping";
import { JobOrderProps } from "../../model/input.model";

interface DetailsMapping {
  UNFULFILLED: () => void;
  READY_FOR_DELIVERY: () => void;
}

const RouteMagnetCard = (props: JobOrderProps) => {
  const { order } = props;

  const statusList = [
    "UNFULFILLED",
    "READY_FOR_DELIVERY",
    "IN_WAITING_QUEUE",
    "IN_PLANNER_BUILDER",
    "IN_ITINERARY_SAVED",
    "ITINERARY_STARTED",
    "ON_THE_WAY",
    "COMPLETED",
  ];

  const index = statusList.findIndex((s) => order.statusAction.status === s);

  // open/close section as local state to be able to re-render on changes
  const [openSection, setOpenSection] = useState({
    ...{
      UNFULFILLED: {
        show: false,
      },
      READY_FOR_DELIVERY: {
        show: false,
      },
      IN_WAITING_QUEUE: {
        show: false,
      },
      IN_PLANNER_BUILDER: {
        show: false,
      },
      IN_ITINERARY_SAVED: {
        show: false,
      },
      IN_ITINERARY_ASSIGNED: {
        show: false,
      },
      ITINERARY_STARTED: {
        show: false,
      },
      ON_THE_WAY: {
        show: false,
      },
      COMPLETED: {
        show: false,
      },
    },
    [order.statusAction.status]: { show: true },
  });

  // setOpenSection({...openSection, [order.statusAction.status]:{show:true}})

  const unfulfilledDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (isCurrentStatus) {
      return <p>Action needed: Prepare delivery</p>;
    }
    console.log("unfulfilledDetails");
    return (
      <p>
        {j.displayFulfillmentStatus === "FULFILLED"
          ? "Fulfilled status"
          : "Unfulfilled Status"}
      </p>
    );
  };
  const readyForDeliveryDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    console.log("readyForDeliveryDetails");
    if (isCurrentStatus) {
      return <p>Action needed: Push to RouteMagnet</p>;
    }

    return (
      <p>
        {j.displayFulfillmentStatus === "FULFILLED"
          ? "Fulfilled status"
          : "Unfulfilled Status"}
      </p>
    );
  };
  const inWaitingQueueDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (j?.job?.addedAt) {
      return (
        <React.Fragment>
          <TextStyle variation="subdued">
            {new Date(j?.job?.addedAt).toLocaleString()}{" "}
          </TextStyle>
          <div>
            <TextStyle variation="strong">
              {" "}
              Added to waiting queue by{" "}
              {j?.job?.addedByLabel ?? "Shopify Admin"}{" "}
            </TextStyle>
          </div>
          <div>
            {" "}
            <a
              href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/tabs/queue`}
              target="_blank"
            >
              Waiting Queue
            </a>
          </div>
        </React.Fragment>
      );
    }
    return <p>Not in Routemagnet waiting list</p>;
  };
  const inPlannerBuilderDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (j?.job?.pickedAt) {
      return (
        <React.Fragment>
          <TextStyle variation="subdued">
            {new Date(j?.job?.pickedAt).toLocaleString()}{" "}
          </TextStyle>
          <div>
            <TextStyle variation="strong">
              {" "}
              Picked from queue by {order?.job?.pickedByLabel ?? "teamate"}{" "}
            </TextStyle>
          </div>
        </React.Fragment>
      );
    }
    return <p>Not picked from waiting queue</p>;
  };
  const inItinerarySavedDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (j?.job?.routeId) {
      return (
        <React.Fragment>
          <div>
            <TextStyle variation="strong">
              {" "}
              itinerary saved by {j?.job?.pickedByLabel ?? "user"}{" "}
            </TextStyle>
          </div>
        </React.Fragment>
      );
    }

    return <p>Itinerary not saved</p>;
  };
  const inItineraryAssignedDetails = (
    j: JobOrder,
    isCurrentStatus: boolean
  ) => {
    if (j?.job?.step?.assignedAt) {
      return (
        <React.Fragment>
          <TextStyle variation="subdued">
            {new Date(j?.job?.step?.assignedAt).toLocaleString()}{" "}
          </TextStyle>
          <div>
            <TextStyle variation="strong">
              {" "}
              Assigned to {j?.job?.step?.assignedToLabel ?? "user"} by{" "}
              {j?.job?.step?.assignedByLabel ?? "Shopify Admin"}{" "}
            </TextStyle>
          </div>
        </React.Fragment>
      );
    }

    return <p>Itinerary not assigned</p>;
  };
  const inItineraryStartedDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (j?.job?.step?.routeStartedAt) {
      return (
        <React.Fragment>
          <TextStyle variation="subdued">
            {new Date(j?.job?.step?.routeStartedAt).toLocaleString()}{" "}
          </TextStyle>
          <div>
            <TextStyle variation="strong">
              {" "}
              Driver: {j?.job?.step?.driverLabel ?? "user"}{" "}
            </TextStyle>
          </div>
          <div>
            {" "}
            <a
              href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/delivery/${j.job.uId}`}
              target="_blank"
            >
              Tracking link sent to customer
            </a>
          </div>
          <div>
            {" "}
            <a
              href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/live`}
              target="_blank"
            >
              Supervisor Interactive Map
            </a>
          </div>
        </React.Fragment>
      );
    }
    return <p>Itinerary not started</p>;
  };
  const onTheWayDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (j?.job?.step?.startedAt) {
      return (
        <React.Fragment>
          <TextStyle variation="subdued">
            {new Date(j?.job?.step?.startedAt).toLocaleString()}{" "}
          </TextStyle>
          <div>
            <TextStyle variation="strong">
              {" "}
              Driver: {j?.job?.step?.driverLabel ?? "user"}{" "}
            </TextStyle>
          </div>
          <div>
            {" "}
            <a
              href={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}/live`}
              target="_blank"
            >
              Supervisor Interactive map
            </a>
          </div>
        </React.Fragment>
      );
    }
    return <p>Driver Not on the way</p>;
  };
  const completedDetails = (j: JobOrder, isCurrentStatus: boolean) => {
    if (j?.job?.step?.completedAt) {
      return (
        <React.Fragment>
          <TextStyle variation="subdued">
            {new Date(j?.job?.step?.completedAt).toLocaleString()}{" "}
          </TextStyle>
          <div>
            <TextStyle variation="strong">
              {" "}
              Completed By: {j?.job?.step?.completedBy ?? "user"}{" "}
            </TextStyle>
          </div>
        </React.Fragment>
      );
    }
    return <p>Not completed</p>;
  };

  // mapping to run correct function associated with status string
  // to avoid too many if statements and easier to maintain when adding new status in future
  const detailsMapping = {
    UNFULFILLED: {
      action: unfulfilledDetails,
    },
    READY_FOR_DELIVERY: {
      action: readyForDeliveryDetails,
    },
    IN_WAITING_QUEUE: {
      action: inWaitingQueueDetails,
    },
    IN_PLANNER_BUILDER: {
      action: inPlannerBuilderDetails,
    },
    IN_ITINERARY_SAVED: {
      action: inItinerarySavedDetails,
    },
    // IN_ITINERARY_ASSIGNED: {
    //   action:inItineraryAssignedDetails,
    // },
    ITINERARY_STARTED: {
      action: inItineraryStartedDetails,
    },
    ON_THE_WAY: {
      action: onTheWayDetails,
    },
    COMPLETED: {
      action: completedDetails,
    },
  };

  const onSectionClicked = (status: string) => {
    // switch 'show' flag of specific status section
    console.log("onSectionClicked", status);
    setOpenSection({
      ...openSection,
      [status]: { show: !openSection[status].show },
    });
  };
  const statusStack = (o: JobOrder) => {
    return (
      <Card title="RouteMagnet Local Delivery">
        <Card.Section>
          {statusList.map((status, i) => {
            // detailsMapping[status].show = i === index ? true  : false;
            const badgeStatus =
              i === index ? "attention" : i > index ? "new" : "success";
            const futureStep = i <= index ? false : true;
            return (
              <React.Fragment>
                <div onClick={() => onSectionClicked(status)}>
                  <Stack distribution="center">
                    <Stack.Item fill={true}>
                      <Badge status={badgeStatus}>{wordsMapping[status]}</Badge>
                    </Stack.Item>
                    {!futureStep && (
                      <Stack.Item fill={false}>
                        <Icon
                          source={
                            openSection[status].show
                              ? ChevronDownMinor
                              : ChevronRightMinor
                          }
                          color="base"
                        />
                      </Stack.Item>
                    )}
                  </Stack>

                  <Stack>
                    <Stack.Item>
                      {openSection[status].show &&
                        detailsMapping[status].action(
                          o,
                          i === index ? true : false
                        )}
                    </Stack.Item>
                  </Stack>
                  <Stack>
                    <Stack.Item>
                      <br />
                    </Stack.Item>
                  </Stack>
                </div>
              </React.Fragment>
            );
          })}
        </Card.Section>
      </Card>
    );
  };

  return statusStack(order);
};

export default RouteMagnetCard;
