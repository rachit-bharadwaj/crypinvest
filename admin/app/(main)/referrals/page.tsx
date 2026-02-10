"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { REFERRAL_BASE_URL } from "@/constants/api";
import { toast } from "sonner";
import { Tree, TreeNode } from "react-organizational-chart";

// Referral Data Interface
interface ReferralData {
  id: string;
  referrer: { id: string; fullName: string; email: string };
  referee: { id: string; fullName: string; email: string };
  createdAt: string;
  status: "Pending" | "Completed";
  commission: number;
}

export default function AdminReferralPage() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [referralTree, setReferralTree] = useState<any>(null);
  const [loadingTree, setLoadingTree] = useState(false);

  // Fetch All Referrals
  const fetchAllReferrals = async () => {
    try {
      const response = await fetch(`${REFERRAL_BASE_URL}`);
      if (!response.ok) {
        throw new Error("Failed to fetch referrals");
      }
      const data = await response.json();

      console.log(data);
      setReferrals(data.referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      toast.error("Error fetching referrals.");
    }
  };

  // Fetch Referral Tree for Selected User
  const fetchReferralTree = async (userId: string) => {
    setLoadingTree(true);
    try {
      const response = await fetch(`${REFERRAL_BASE_URL}/tree/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch referral tree");
      }
      const data = await response.json();
      console.log(data);
      setReferralTree(data.referralTree);
    } catch (error) {
      console.error("Error fetching referral tree:", error);
      toast.error("Error fetching referral tree.");
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    fetchAllReferrals();
  }, []);

  // Render Referral Tree Recursively
  const renderTreeNodes = (node: any) => {
    return (
      <TreeNode
        key={node.id}
        label={
          <div className="bg-blue-500 text-white px-4 py-2 rounded shadow">
            <p className="font-bold">{node.fullName}</p>
            <p className="text-xs">{node.email}</p>
            <p className="text-sm font-semibold">
              Level: {node.level} | Commission: ${node.commission}
            </p>
          </div>
        }
      >
        {node.referrals.length > 0 &&
          node.referrals.map((child: any) => renderTreeNodes(child))}
      </TreeNode>
    );
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Referral Management</h1>

      {/* Referrals List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Referrals</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.length > 0 ? (
                referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      {referral.referrer?.fullName || "N/A"}
                    </TableCell>
                    <TableCell>{referral.referee?.fullName || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(referral.createdAt).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false, // Ensures 24-hour format
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          referral.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${referral.commission?.toLocaleString() || "0.00"}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          if (referral.referee?._id) {
                            setSelectedUser(referral.referee._id);
                            fetchReferralTree(referral.referee._id);
                          } else {
                            toast.error("Referee information is missing.");
                          }
                        }}
                        className="bg-blue-600 text-white"
                        disabled={!referral.referee?._id}
                      >
                        View Tree
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No referrals yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Referral Tree Visualization */}
      {selectedUser && referralTree && (
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Referral Tree</h2>
          {loadingTree ? (
            <p className="text-gray-500">Loading referral tree...</p>
          ) : (
            <div className="overflow-auto p-4">
              <Tree
                lineWidth={"2px"}
                lineColor={"#3498db"}
                lineBorderRadius={"10px"}
                label={
                  <div className="bg-green-600 text-white px-4 py-2 rounded shadow">
                    <p className="font-bold">{referralTree.fullName}</p>
                    <p className="text-xs">{referralTree.email}</p>
                  </div>
                }
              >
                {referralTree.referrals.length > 0 &&
                  referralTree.referrals.map((child: any) =>
                    renderTreeNodes(child)
                  )}
              </Tree>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
