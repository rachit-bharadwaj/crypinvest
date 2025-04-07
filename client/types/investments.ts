import { ElementType } from "react";

export type TopCard = {
  title: string;
  subtitle: string;
  Icon: ElementType;
};

export type StatsCardProps = {
  title: string;
  amount: number;
  increase: number;
  increaseComment: string;
  comment: string;
  image: string;
};
