"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVESTMENT_BASE_URL, POOL_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Investment = {
  user: string;
  pool: string;
  amount: number;
  status: "Completed" | "Investing";
  createdAt: string;
};

export const columns: ColumnDef<Investment>[] = [
  {
    accessorKey: "pool",
    header: "Pool",
    cell: ({ row }) => <div className="text-white">{row.getValue("pool")}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return <div className="text-white">${amount.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "Completed" ? "default" : "outline"}
          className={
            status === "Completed"
              ? "bg-green-500 text-white"
              : "bg-[#2A2D44] text-[#00E4FF]"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return <div className="text-white">{date.toLocaleDateString()}</div>;
    },
  },
];

export default function InvestmentTable() {
  const { walletAddress } = useWallet();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [data, setData] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        if (!walletAddress.trim()) {
          toast.error("Please enter a wallet address.");
          return;
        }

        setLoading(true);

        const response = await fetch(
          `${INVESTMENT_BASE_URL}/user/${walletAddress}/total`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch investments");
        }

        const { investments } = await response.json();

        const formattedData = await Promise.all(
          investments.map(async (inv: any) => {
            let poolName = "N/A";
            try {
              if (inv.pool) {
                const poolResponse = await fetch(
                  `${POOL_BASE_URL}/${inv.pool}`
                );

                const poolData = await poolResponse.json();
                poolName = poolData?.pool.name || "N/A";
              }
            } catch (err) {
              console.error("Error fetching pool name:", err);
            }

            return {
              pool: poolName,
              amount: inv.amount,
              status: inv.status,
              createdAt: inv.createdAt,
            };
          })
        );

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching investments:", error);
        toast.error("An error occurred while fetching investments.");
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchInvestments();
    }
  }, [walletAddress]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div
        className="rounded-2xl border border-[#2A2D44] bg-[#1A1B2E]"
        style={{
          animation: "shining-border 3s linear infinite",
        }}
      >
        <p className="mt-5 mx-5 text-xl font-bold text-white">My Investments</p>

        <div className="flex items-center gap-4 py-4 px-4">
          {loading && <p className="text-[#8A8FB9]">Loading investments...</p>}
        </div>
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
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-[#2A2D44] hover:bg-[#2A2D44]/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}
