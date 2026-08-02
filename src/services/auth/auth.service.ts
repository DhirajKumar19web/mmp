export class AuthService {
  public async login(): Promise<string> {
    return Promise.resolve("Login token placeholder");
  }
}

export const authService = new AuthService();
