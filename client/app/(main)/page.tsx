"use client";

import { motion } from "framer-motion";
import {
  CurrencyComposition,
  StatsCards,
  TopBar,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <TopBar />
          <div className="flex gap-20 flex-col-reverse lg:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <StatsCards />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:w-[400px]"
            >
              <CurrencyComposition />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
