export class UserAuthenticated {
  public id: string;
  public username: string;
  public roles?: string[];
  public account?: string;
  public requiredAction?: string;

  constructor(data?: Partial<UserAuthenticated>) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.roles = data.roles;
      this.account = data.account;
      this.requiredAction = data.requiredAction;
    }
  }
}

export class UserEntity extends UserAuthenticated {
  public password: string;

  constructor(data?: Partial<UserEntity>) {
    super(data);

    if (data) {
      this.password = data.password;
    }
  }
}
