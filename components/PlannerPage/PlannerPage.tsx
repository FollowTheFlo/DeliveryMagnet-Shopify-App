import React, { useEffect } from "react";

/*
DeliveryMagnet App displayed in an Iframe
https://app.deliverymagnet.com
*/
const PlannerPage: React.FC = (props) => {
  return (
    <React.Fragment>
      <iframe
        frameBorder="0"
        width="100%"
        height="980px"
        src={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}`}
      ></iframe>
    </React.Fragment>
  );
};

export default PlannerPage;