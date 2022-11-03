import {Service} from "./Service";
import {User} from "./User";

export interface ServiceProvider {
  id: number;
  user_id: number;
  applications?: ServiceProviderApplication[];
  user?: User;
}

export interface ServiceProviderApplication{
  service_provider_id: number;
  service_id: number;
  service?: Service,
  provider?: ServiceProvider
}
