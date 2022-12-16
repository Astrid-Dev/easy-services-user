import {Service} from "./Service";
import {User} from "./User";

export interface ServiceProvider {
  id: number;
  user_id: number;
  organization_id?: number | null;
  applications?: ServiceProviderApplication[];
  user?: User;
  organization?: {
    name: string;
    email1: string;
    phone_number1: string;
    email2?: string;
    phone_number2?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    logo?: string;
    country?: string;
    city?: string;
    address?: string;
  }
}

export interface ServiceProviderApplication{
  service_provider_id: number;
  service_id: number;
  service?: Service,
  provider?: ServiceProvider
}
