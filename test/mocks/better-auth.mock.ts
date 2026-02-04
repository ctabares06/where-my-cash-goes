export const Session = jest.fn(() => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Mock decorator that does nothing, since in tests we pass the session manually
    return descriptor;
  };
});

export type UserSession = {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
};

export class AuthService {
  // Mock methods
}
