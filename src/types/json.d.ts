declare module "*.json" {
    const value: {
      users: Array<{
        id: string;
        email: string;
        passwordHash: string;
        token: string;
        createdAt: string;
      }>;
    };
    export default value;
  }