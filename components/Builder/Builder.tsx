import React, { useEffect } from "react";

const Builder: React.FC = (props) => {
  useEffect(() => {
    console.log("Builder useEffect");
  });
  return (
    <React.Fragment>
      <iframe
        frameBorder="0"
        width="100%"
        height="800px"
        src={`${process.env.NEXT_PUBLIC_RM_CLIENT_URL}`}
      ></iframe>
    </React.Fragment>
  );
};

export default Builder;
