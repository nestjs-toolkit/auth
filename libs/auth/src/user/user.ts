export class User {
  public id: string;
  public username: string;
  public password: string;
  public roles?: string[];
  public workspace?: string;
  public requiredAction?: string;
}
