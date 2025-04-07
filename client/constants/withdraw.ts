import { UpcomingCardProps } from "@/types/withdraw";

export const upcomingPayments: UpcomingCardProps[] = [
  {
    title: "Upcoming Payment for Standard Plan on",
    amount: 10000,
    // method: "Autocollection Via Crypto",
    date: new Date("2023-01-01"),
    remainingAmount: 5000,
  },
  {
    title: "Upcoming Payment for VIP Plan on",
    amount: 5000,
    // method: "Autocollection Via Crypto",
    date: new Date("2023-01-01"),
    remainingAmount: 5000,
  },
];
