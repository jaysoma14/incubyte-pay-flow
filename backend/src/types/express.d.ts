declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: "HR_MANAGER";
      };
    }
  }
}

export {};
