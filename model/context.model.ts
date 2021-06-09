import { JobOrder } from "./orders.model";
import { WhMode } from "./webhooks.model";

export interface AdminContextType{
    mode:WhMode;
    onModeSelected:(option:string,checked:boolean) => void;
    domain:string;
    onDomainChange:(d:string) => void;
    jobOrders: JobOrder[];
    onJobOrdersChange:(j:JobOrder[]) => void;

}