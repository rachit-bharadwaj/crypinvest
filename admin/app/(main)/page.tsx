"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  INVESTMENT_BASE_URL,
  REFERRAL_BASE_URL,
  USER_BASE_URL,
  WITHDRAWAL_BASE_URL,
} from "@/constants/api";
import axios from "axios";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [investmentData, setInvestmentData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const [usersData, setUsersData] = useState({
    total: 0,
    growth: 0,
  });
  const [investmentsData, setInvestmentsData] = useState({
    total: 0,
    growth: 0,
  });
  const [withdrawalsData, setWithdrawalsData] = useState({
    total: 0,
    growth: 0,
  });
  const [referralsData, setReferralsData] = useState({
    total: 0,
    growth: 0,
  });

  const stats = [
    {
      name: "Total Users",
      value: usersData.total,
      change: `${usersData.growth >= 0 ? "+" : "-"}${usersData.growth}%`,
      trend: `${usersData.growth >= 0 ? "up" : "down"}`,
      icon: Users,
    },
    {
      name: "Total Investments",
      value: investmentsData.total,
      change: `${investmentsData.growth >= 0 ? "+" : "-"}${
        investmentsData.growth
      }%`,
      trend: `${investmentsData.growth >= 0 ? "up" : "down"}`,
      icon: DollarSign,
    },
    {
      name: "Pending Withdrawals",
      value: withdrawalsData.total,
      change: `${withdrawalsData.growth >= 0 ? "+" : "-"}${
        withdrawalsData.growth
      }%`,
      trend: `${withdrawalsData.growth >= 0 ? "up" : "down"}`,
      icon: Wallet,
    },
    {
      name: "Total Referrals",
      value: referralsData.total,
      change: `${referralsData.growth >= 0 ? "+" : "-"}${
        referralsData.growth
      }%`,
      trend: `${referralsData.growth >= 0 ? "up" : "down"}`,
      icon: Activity,
    },
  ];

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${USER_BASE_URL}`);
      const resData = res.data;

      setUsersData({
        total: resData.totalUsers,
        growth: resData.growth,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await axios.get(`${INVESTMENT_BASE_URL}`);
      const resData = res.data;

      setInvestmentsData({
        total: resData.totalInvestments,
        growth: resData.growth,
      });
    } catch (error) {
      console.error("Error fetching investments:", error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get(`${WITHDRAWAL_BASE_URL}`);
      const resData = res.data;

      setWithdrawalsData({
        total: resData.pendingWithdrawalsCount,
        growth: resData.growth,
      });
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const res = await axios.get(`${REFERRAL_BASE_URL}`);
      const resData = res.data;

      setReferralsData({
        total: resData.totalReferrals,
        growth: resData.growth,
      });
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const fetchInvestmentsByPeriod = async (period:string) => {
    try {
      const res = await axios.get(
        `${INVESTMENT_BASE_URL}/period?period=${period}`
      );
      const resData = res.data;
      setInvestmentData(
        resData.investments.map((item) => ({
          date: new Date(item._id).toLocaleDateString("en-GB"),
          amount: item.totalAmount,
          count: item.count,
        }))
      );
    } catch (error) {
      console.error("Error fetching investments by period:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInvestments();
    fetchWithdrawals();
    fetchReferrals();
    fetchInvestmentsByPeriod(selectedPeriod);
  }, [selectedPeriod]);

  return (
    <div className="flex gap-8 flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform&apos;s performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="h-6 w-6 text-muted-foreground" />
              <div
                className={`flex items-center text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                ) : (
                  <ArrowDownRight className="ml-1 h-4 w-4" />
                )}
                &nbsp; <span className="text-gray-500">this week</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold">{stat.value}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{stat.name}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-8 flex-col">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Investments Overview
          </h2>
          <p className="text-muted-foreground">
            View investments over daily, weekly, or monthly periods.
          </p>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold mb-4">Investments Trend</h3>
            <div className="space-x-2">
              {["daily", "weekly", "monthly"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Investment Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
