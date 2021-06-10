export interface SuccessResponse {
    success: boolean;
    message: string;
}

export interface TokenPayloadResponse {
    shop:string;
    accessToken:string;
    error:string;
}

export interface ShopAndBearerHeaders {
    shop: string;
    headers: any;
}