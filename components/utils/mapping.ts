const wordsMapping = {
  FULFILLED: "Fulfilled",
  UNFULFILLED: "Unfulfilled",
  READY_FOR_DELIVERY: "Ready for delivery",
  IN_WAITING_QUEUE: "In planner queue",
  IN_PLANNER_BUILDER: "In planner builder",
  IN_ITINERARY_SAVED: "Saved in itinerary",
  IN_ITINERARY_ASSIGNED: "Assigned to a driver",
  ITINERARY_STARTED: "Itinerary started",
  ON_THE_WAY: "Driver on the way",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
  UNKNOWN: "Unknown",
  PREPARE_DELIVERY: "Prepare delivery",
  PUSH_TO_ROUTEMAGNET: "Push to Planner",
  COMPLETE: "Complete",
  CANCEL: "Cancel",
};

const currencyMapping = {
  CAD: "$",
  USD: "$",
  EUR: "€",
};

const paidStatusMapping = {
  AUTHORIZED: {
    value: "Authorized",
    color: "attention",
  },
  EXPIRED: {
    value: "Expired",
    color: "attention",
  },
  PAID: {
    value: "Paid",
    color: "new",
  },
  PARTIALLY_PAID: {
    value: "Partially paid",
    color: "attention",
  },
  PARTIALLY_REFUNDED: {
    value: "Partially refunded",
    color: "attention",
  },
  PENDING: {
    value: "Pending",
    color: "attention",
  },
  REFUNDED: {
    value: "Refunded",
    color: "attention",
  },
  VOIDED: {
    value: "Voided",
    color: "attention",
  },
};

const statusBadgeColorMapping = {
  UNFULFILLED: "attention",
  FULLFILLED: "new",
};

export {
  statusBadgeColorMapping,
  wordsMapping,
  currencyMapping,
  paidStatusMapping,
};
