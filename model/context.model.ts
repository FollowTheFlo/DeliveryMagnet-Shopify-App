import { RmJob, RmJobWithStep } from "./jobs.model";
import { JobOrder } from "./orders.model";
import { WhMode } from "./webhooks.model";

export interface AdminContextType{
    mode:WhMode;
    onModeSelected:(option:string,checked:boolean) => void;
    domain:string;
    onDomainChange:(d:string) => void;
    jobOrders: JobOrder[];
    onOneJobOrderChange:(j:JobOrder) => void;
    onJobOrdersChange:(j:JobOrder[]) => void;
    onJobOrderPush:(j:RmJob) => void;
    isIntegrated:boolean;
    onIntegrationChange: (value:boolean) => void;
}