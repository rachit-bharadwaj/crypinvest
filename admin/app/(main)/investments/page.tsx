"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVESTMENT_BASE_URL } from "@/constants/api";
import axios from "axios";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define the Investment interface
interface Investment {
  _id?: string;
  walletAddress: string;
  planName: string;
  amount: number;
  status: "Pending" | "Completed" | "Failed";
  transactionId?: string;
  user?: {
    fullName: string;
  };
  createdAt?: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isAddingInvestment, setIsAddingInvestment] = useState(false);
  const [newInvestment, setNewInvestment] = useState<Investment>({
    walletAddress: "",
    planName: "",
    amount: 0,
    status: "Pending",
    transactionId: "",
  });

  // Fetch investments from the backend
  const fetchInvestments = async () => {
    try {
      const response = await axios.get(`${INVESTMENT_BASE_URL}`);
      setInvestments(response.data.investments || []);
    } catch (error) {
      console.error("Error fetching investments:", error);
      toast.error("Failed to fetch investments. Please try again.");
    }
  };

  // Add a new investment
  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = { ...newInvestment };

      const response = await axios.post(`${INVESTMENT_BASE_URL}`, payload);
      setInvestments((prevInvestments) => [
        ...prevInvestments,
        response.data.investment,
      ]);
      toast.success("Investment added successfully!");

      // Reset form and close dialog
      setNewInvestment({
        walletAddress: "",
        planName: "",
        amount: 0,
        status: "Pending",
        transactionId: "",
      });
      setIsAddingInvestment(false);
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        toast.error(`Error: ${error.response.data.error || "Unknown error"}`);
      } else {
        console.error("Error adding investment:", error);
        toast.error("Failed to add investment. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
          <p className="text-muted-foreground">Manage user investments</p>
        </div>

        {/* Add Investment Modal */}
        <Dialog open={isAddingInvestment} onOpenChange={setIsAddingInvestment}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAddInvestment}>
              <div>
                <label className="text-sm font-medium">Wallet Address</label>
                <Input
                  placeholder="Enter wallet address"
                  value={newInvestment.walletAddress}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      walletAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Plan Name</label>
                <Input
                  placeholder="Enter plan name"
                  value={newInvestment.planName}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      planName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="Enter investment amount"
                  value={newInvestment.amount}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Transaction ID</label>
                <Input
                  placeholder="Enter transaction ID"
                  value={newInvestment.transactionId}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      transactionId: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full mt-2 p-2 border rounded-md"
                  value={newInvestment.status}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      status: e.target.value as
                        | "Pending"
                        | "Completed"
                        | "Failed",
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <Button className="w-full" type="submit">
                Create Investment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Investments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.length > 0 ? (
              investments.map((investment) => (
                <TableRow key={investment._id}>
                  <TableCell>{investment.user?.fullName || "N/A"}</TableCell>
                  <TableCell>{investment.planName || "Standard"}</TableCell>
                  <TableCell>${investment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        investment.status === "Pending"
                          ? "default"
                          : investment.status === "Completed"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {investment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(investment.createdAt || "").toLocaleDateString()}
                  </TableCell>
                 
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No investments available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
