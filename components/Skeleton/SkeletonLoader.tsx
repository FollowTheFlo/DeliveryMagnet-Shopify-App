import {
  Card,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  TextContainer,
} from "@shopify/polaris";
import React from "react";

const SkeletonLoader = () => {
  return (
    <SkeletonPage>
      <Card sectioned>
        <TextContainer>
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText />
        </TextContainer>
      </Card>
    </SkeletonPage>
  );
};

export default SkeletonLoader;
