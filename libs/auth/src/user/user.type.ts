export class UserAuthenticated {
  public id: string;
  public username: string;
  public roles?: string[];
  public xAccount?: string;
  public requiredAction?: string;

  constructor(data?: Partial<UserAuthenticated>) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.roles = data.roles;
      this.xAccount = data.xAccount;
      this.requiredAction = data.requiredAction;
    }
  }
}

export class UserEntity extends UserAuthenticated {
  public password: string;
  public isEnable: boolean;

  constructor(data?: Partial<UserEntity>) {
    super(data);

    if (data) {
      this.password = data.password;
      this.isEnable = data.isEnable !== false;
    }
  }
}
