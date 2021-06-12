export interface SuccessResponse {
    success: boolean;
    message: string;
}

export interface TokenPayloadResponse {
    success:boolean;
    shop:string;
    accessToken:string;
    message:string;
}

export interface ShopAndBearerHeaders {
    shop: string;
    headers: any;
}