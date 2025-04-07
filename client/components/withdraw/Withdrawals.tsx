"use client";

import { useState, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/Wallet";
import { toast } from "sonner";
import { WITHDRAWAL_BASE_URL } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the type for withdrawal data
type Withdrawal = {
  transactionId?: string;
  createdAt: string;
  amount: number;
  status: "Pending" | "Completed" | "Failed" | "Rejected";
};

// Format currency
const formatCurrency = (amount: number) => `$ ${amount.toLocaleString()}`;

// Define the columns for the table
const columns: ColumnDef<Withdrawal>[] = [
  {
    accessorKey: "createdAt",
    header: "Withdrawal Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return <div>{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={`font-medium ${
            status === "Completed"
              ? "text-green-500"
              : status === "Failed" || status === "Rejected"
              ? "text-red-500"
              : "text-yellow-500"
          }`}
        >
          {status}
        </div>
      );
    },
  },
];

export default function WithdrawalTable() {
  const { walletAddress } = useWallet();
  const [data, setData] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        if (!walletAddress) {
          toast.error("Wallet address is required");
          return;
        }

        setLoading(true);

        const response = await fetch(
          `${WITHDRAWAL_BASE_URL}/user/${walletAddress}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch withdrawals");
        }

        const { withdrawals } = await response.json();

        const formattedWithdrawals = withdrawals.map((withdrawal: any) => ({
          transactionId: withdrawal.transactionId,
          createdAt: withdrawal.createdAt,
          amount: withdrawal.amount,
          status: withdrawal.status,
        }));

        setData(formattedWithdrawals);
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        toast.error("Failed to fetch withdrawals");
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [walletAddress]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const renderMobileCard = (withdrawal: Withdrawal) => (
    <Card
      key={withdrawal.transactionId}
      className="mb-4 bg-[#1A1B2E] border-[#2A2D44]"
    >
      <CardContent>
        <div className="text-sm text-[#8A8FB9]">
          <p>Date: {new Date(withdrawal.createdAt).toLocaleString()}</p>
          <p>Amount: {formatCurrency(withdrawal.amount)}</p>
          <p
            className={`font-medium ${
              withdrawal.status === "Completed"
                ? "text-green-500"
                : withdrawal.status === "Failed" ||
                  withdrawal.status === "Rejected"
                ? "text-red-500"
                : "text-yellow-500"
            }`}
          >
            Status: {withdrawal.status}
          </p>
        </div>

        <hr className="mt-5 border-gray-700" />
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      <Card
        className="bg-[#1A1B2E] border-[#2A2D44]"
        style={{
          animation: "shining-border 3s linear infinite",
        }}
      >
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-white">
            Withdrawals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center text-[#8A8FB9]">Loading...</div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="border-b border-[#2A2D44] hover:bg-[#2A2D44]/50"
                      >
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-[#8A8FB9]">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="border-b border-[#2A2D44] hover:bg-[#2A2D44]/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-white">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-[#8A8FB9]"
                        >
                          No withdrawals found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden">
                {data.length ? (
                  data.map(renderMobileCard)
                ) : (
                  <div className="p-4 text-center text-[#8A8FB9]">
                    No withdrawals found.
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-4">
        <div className="text-sm text-[#8A8FB9] mb-2 sm:mb-0">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-[#2A2D44] text-[#8A8FB9] hover:bg-[#2A2D44] hover:text-white"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-[#2A2D44] text-[#8A8FB9] hover:bg-[#2A2D44] hover:text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
