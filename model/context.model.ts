import { PageInfo } from "./input.model";
import { RmJob, RmJobWithStep } from "./jobs.model";
import { JobOrder, ShopifyGraphQLOrder } from "./orders.model";
import { WhMode } from "./webhooks.model";

export interface OrdersContextType {
  jobOrders: JobOrder[];
  onOneJobOrderChange: (j: JobOrder) => void;
  onJobOrdersChange: (j: JobOrder[]) => void;
  onJobOrderPush: (j: RmJob) => void;
  pageInfo: PageInfo;
  onPageInfoChange: (value: PageInfo) => void;
  refreshDate: string;
  onRefreshDateChange: (value: string) => void;
  ordersTitle: string;
  onSetOrdersTitle: (value: string) => void;
  selectedDeliveryType: string[];
  onSetSelectedDeliveryType: (value: string[]) => void;
  newJobsCount: number;
  onSetNewJobsCount: (value: number) => void;
}

export interface IntegrationContextType {
  domain: string;
  onDomainChange: (d: string) => void;
  isIntegrated: boolean;
  onIntegrationChange: (value: boolean) => void;
  defaultServiceDuration: number;
  onDefaultServiceDurationChange: (value: number) => void;
  language: string;
  onSetLanguage: () => void;
}
