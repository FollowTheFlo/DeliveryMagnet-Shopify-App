export interface Company {
  _id;
  name: string;
  email: string;
  phone: string;
  location: LocationGeo;
  imageUrl: string;
  createdBy: string;
  createdAt: Date;
}

export interface LocationGeo {
  address: string;
  lat: number;
  lng: number;
}
