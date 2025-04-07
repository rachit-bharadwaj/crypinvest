import { TopCard } from "@/types/investments";
import { Check, File, Lock, Monitor } from "lucide-react";

export const topCardItems: TopCard[] = [
  {
    title: "Bank-Grade Security",
    subtitle: "256-bit encription",
    Icon: Lock,
  },
  {
    title: "Licensed & Regulated",
    subtitle: "SEC Register",
    Icon: File,
  },
  {
    title: "24/7 Monitoring",
    subtitle: "Real-time protection",
    Icon: Monitor,
  },
  {
    title: "Verified Platform",
    subtitle: "ISO 27001 Certified",
    Icon: Check,
  },
];
