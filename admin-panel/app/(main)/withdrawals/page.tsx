"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WITHDRAWAL_BASE_URL } from "@/constants/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Withdrawal {
  _id: string;
  userName: string;
  amount: number;
  status: "Pending" | "Completed" | "Failed" | "Rejected";
  transactionId: string;
  paymentMethod: string;
  createdAt: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Fetch withdrawals from the backend
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${WITHDRAWAL_BASE_URL}`);
      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals");
      }
      const { withdrawals } = await response.json();
      setWithdrawals(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("An error occurred while fetching withdrawals");
    } finally {
      setLoading(false);
    }
  };

  // Filter withdrawals by status
  const filteredWithdrawals = withdrawals.filter((withdrawal) =>
    selectedStatus === "all" ? true : withdrawal.status === selectedStatus
  );

  const handleApprove = async (withdrawalId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${WITHDRAWAL_BASE_URL}/${withdrawalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Completed",
        }), 
      });

      if (!response.ok) {
        throw new Error("Failed to update withdrawal status");
      }

      const resData = await response.json();

      toast.success("Withdrawal approved successfully.");
      await fetchWithdrawals(); // Refresh the list
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast.error("Failed to approve withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${WITHDRAWAL_BASE_URL}/${withdrawalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Rejected",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update withdrawal status");
      }

      toast.success("Withdrawal rejected successfully.");
      await fetchWithdrawals(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast.error("Failed to reject withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Withdrawals</h2>
        <p className="text-muted-foreground">
          Process and manage withdrawal requests
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Loading withdrawals...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal._id}>
                   <TableCell>{withdrawal.user?.fullName || "Unknown User"}</TableCell>
                    <TableCell>${withdrawal.amount.toLocaleString()}</TableCell>
                    <TableCell>{withdrawal.transactionId || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdrawal.status === "Completed"
                            ? "default"
                            : withdrawal.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(withdrawal._id)}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(withdrawal._id)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No withdrawals yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
