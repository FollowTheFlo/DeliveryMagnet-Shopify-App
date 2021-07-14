import { PageInfo } from "./input.model";
import { RmJob, RmJobWithStep } from "./jobs.model";
import { JobOrder } from "./orders.model";
import { WhMode } from "./webhooks.model";

export interface AdminContextType {
  mode: WhMode;
  onModeSelected: (option: string, checked: boolean) => void;
  domain: string;
  onDomainChange: (d: string) => void;
  jobOrders: JobOrder[];
  onOneJobOrderChange: (j: JobOrder) => void;
  onJobOrdersChange: (j: JobOrder[]) => void;
  onJobOrderPush: (j: RmJob) => void;
  isIntegrated: boolean;
  onIntegrationChange: (value: boolean) => void;
  defaultServiceDuration: number;
  onDefaultServiceDurationChange: (value: number) => void;
  pageInfo: PageInfo;
  onPageInfoChange: (value: PageInfo) => void;
  refreshDate: string;
  onRefreshDateChange: (value: string) => void;
  ordersTitle: string;
  onSetOrdersTitle: (value: string) => void;
  selectedDeliveryType: string[];
  onSetSelectedDeliveryType: (value: string[]) => void;
}
