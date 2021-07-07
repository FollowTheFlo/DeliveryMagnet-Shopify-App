export interface ShopifyConfig{
    shop: string;
    teamId: string;
    active: boolean;
    service?: number;
    accessToken?: string;
    code?: string;
    domain?: string;
    exp?:number;
}