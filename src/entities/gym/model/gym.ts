export interface Gym {
  id: string;
  name: string;
  address: string;
  description: string | null;
  allowAutoJoin?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
