/* eslint-disable @typescript-eslint/naming-convention */
import {ServiceProvider} from "./ServiceProvider";

export interface User {
  id?: number;
  username?: string;
  email?: string;
  phone_number?: string;
  names?: string;
  password?: string;
  password_confirmation?: string;
  created_at?: string;
  updated_at?: string;
  is_provider?: boolean;
  provider?: ServiceProvider;
}
