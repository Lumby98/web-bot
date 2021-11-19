export interface SavedLoginModel {
  id: number;
  username: string;
  password: string;
  loginType: string;
  salt: string;
  iv: string;
}
