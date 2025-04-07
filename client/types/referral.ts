export type ReferralData = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  status: "Pending" | "Completed";
  commission: number;
};
