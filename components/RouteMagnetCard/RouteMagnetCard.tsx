import React, { useContext, useState } from "react";
import { Card, Stack, TextStyle, Badge, Icon } from "@shopify/polaris";
import { JobOrder } from "../../model/orders.model";
import { ChevronRightMinor, ChevronDownMinor } from "@shopify/polaris-icons";
import { wordsMapping } from "../utils/mapping";
import { JobOrderProps } from "../../model/input.model";

/* 
Order Status list pulled form DeliveryMagnet, 8 in total, 
filling each status with details. eg: completion date, driver name, delivery tracking url
current and completed status details can be expand/hidden
*/

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

  const currentStatusIndex = statusList.findIndex(
    (s) => order.statusAction.status === s
  );

  // expand/withdraw section as local state to be able to re-render on changes
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
      return <p>Action needed: Push to Planner</p>;
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
          <div> Waiting Queue</div>
        </React.Fragment>
      );
    }
    return <p>Not in DeliveryMagnet waiting list</p>;
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
      <Card title="DeliveryMagnet deliveries">
        <Card.Section>
          {statusList.map((status, i) => {
            // detailsMapping[status].show = i === index ? true  : false;
            const badgeStatus =
              i === currentStatusIndex
                ? "attention"
                : i > currentStatusIndex
                ? "new"
                : "success";
            const futureStep = i <= currentStatusIndex ? false : true;
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
                          i === currentStatusIndex ? true : false
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
