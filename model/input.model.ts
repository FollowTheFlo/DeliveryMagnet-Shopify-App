import { JobOrder } from "./orders.model";

export interface StatusAction {
    status: string;
    action: string;
}

export interface JobOrderProps {
    order:JobOrder;
    onPushOrder:(o:JobOrder)=>void;
    onFulfillOrder:(o:JobOrder)=>void;
  }