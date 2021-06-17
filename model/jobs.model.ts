export interface RmJob {
    uId: string;
    id: number;
    label: string;
    service: number; // time the job take
    amount: number; // only one number but must be in array
    location: LocationGeo;
    email: string;
    phone: string;
    skills: number[];
    instructions: string;
    description: string;
    strField: string;
    boolField: boolean;
    status:string; // status used for shopify order
    time_windows: [{
        earliest: number;
        latest: number;
     }
    ]
    inQueue: boolean;
    addedBy: string;
    addedByLabel: string;
    addedAt: string;
    teamId: string;
    routeId: string
    stepId: string;
    pickedBy: string;
    pickedByLabel: string
    pickedAt: string;
    source: string;
    price: number;
    extId: string;
    extUrl: string;
    test:boolean;
    currency:string;
}

export interface LocationGeo {
    address: string;
    lat: number;
    lng: number;
}

export interface OutputError {
    error:string;
}

export interface Step {
    routeStartedAt:string,
    routeInProgress:boolean,
    routeFinished:boolean,
    startedAt:string,
    inProgress:boolean,
    completedAt:string,
    completedBy:string,
    completed:boolean,
    canceled:boolean,
    canceledAt:string,
    canceledBy:string,
    driverLabel: string,
    imageUrl:string,
    assignedByLabel:string,
    assignedToLabel:string,
    assignedAt:string,
    customerLink: string
}

export interface RmJobWithStep extends RmJob {
    step: Step;
}