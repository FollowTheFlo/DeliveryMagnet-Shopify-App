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

export interface PageInfo {
    hasNextPage:boolean;
    hasPreviousPage:boolean;
  }

export interface CursorSelection {
    action:'before'|'after';
    value:string;
}