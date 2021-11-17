import { StatusAction } from "../../model/input.model";
import { RmJobWithStep } from "../../model/jobs.model";
import { ShopifyGraphQLOrder } from "../../model/orders.model";

const formatOrder = (or: ShopifyGraphQLOrder) => {
  or.id = or.id.replace("gid://shopify/Order/", "");
  or.createdAt = new Date(or.createdAt)
    .toLocaleString("en-GB")
    .replace(/(:\d{2}| [AP]M)$/, "");
  or["customer"]["id"] = or?.customer?.id
    ? or.customer.id.replace("gid://shopify/Customer/", "")
    : "";
  if (or?.lineItems?.edges?.length > 0) {
    console.log("in condition1");
    or.lineItems.edges.forEach((li) => {
      li.node.fulfillmentService.location.id =
        li?.node?.fulfillmentService?.location?.id.replace(
          "gid://shopify/Location/",
          ""
        ) ?? "";
    });
  }
};

const getStatusAction = (
  displayFulfillmentStatus: string,
  job: RmJobWithStep | null
): StatusAction => {
  // status and associated action, use to display action button in Action column, if action is empty we display nothing
  // we have only 2 actions: Prepare Delivery when sattus Unfulfilled & Push to RM when status is ready for delivery
  if (displayFulfillmentStatus === "UNFULFILLED")
    return { status: "UNFULFILLED", action: "PREPARE_DELIVERY" };
  if (displayFulfillmentStatus === "FULFILLED") {
    if (!job || !job.uId)
      return { status: "READY_FOR_DELIVERY", action: "PUSH_TO_ROUTEMAGNET" };
    if (job?.status === "IN_WAITING_QUEUE")
      return { status: "IN_WAITING_QUEUE", action: "" };
    if (job?.status === "IN_PLANNER_BUILDER")
      return { status: "IN_PLANNER_BUILDER", action: "" };
    if (job?.status === "IN_ITINERARY_SAVED")
      return { status: "IN_ITINERARY_SAVED", action: "" };
    if (job?.status === "IN_ITINERARY_ASSIGNED")
      return { status: "IN_ITINERARY_ASSIGNED", action: "" };
    if (job?.status === "ITINERARY_STARTED")
      return { status: "ITINERARY_STARTED", action: "" };
    if (job?.status === "ON_THE_WAY")
      return { status: "ON_THE_WAY", action: "" };
    if (job?.status === "COMPLETED") return { status: "COMPLETED", action: "" };
    if (job?.status === "CANCELED") return { status: "CANCELED", action: "" };
    if (job?.status === "UNKNOWN") return { status: "UNKNOWN", action: "" };
  }
  return { status: "UNKNOWN", action: "" };
};

export { formatOrder, getStatusAction };
