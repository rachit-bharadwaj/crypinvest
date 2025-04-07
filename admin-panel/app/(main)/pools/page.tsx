"use client";

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
import { CATEGORY_BASE_URL, POOL_BASE_URL } from "@/constants/api";
import axios from "axios";
import { Edit2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define the Pool interface
interface Pool {
  _id?: string;
  name: string;
  category: string; // Reference to Category
  minimumDeposit: number;
  annualROI: string; // e.g., "11% - 50%"
  investments?: string[]; // Array of investment references
}

interface Category {
  _id: string;
  name: string;
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]); // State to hold pool data
  const [categories, setCategories] = useState<Category[]>([]); // State to hold categories
  const [isAddingPool, setIsAddingPool] = useState(false);
  const [newPool, setNewPool] = useState<Pool>({
    name: "",
    category: "",
    minimumDeposit: 0,
    annualROI: "",
    investments: [],
  });

  // Fetch pools from the backend
  const fetchPools = async () => {
    try {
      const response = await axios.get(`${POOL_BASE_URL}`);
      setPools(response.data.pools || []);
    } catch (error) {
      console.error("Error fetching pools:", error);
      toast.error("Failed to fetch pools. Please try again.");
    }
  };

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${CATEGORY_BASE_URL}`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.");
    }
  };

  // Add a new pool to the backend
  const handleAddPool = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPool.category) {
      toast.error("Please select a category.");
      return;
    }

    try {
      const response = await axios.post(`${POOL_BASE_URL}`, newPool);
      setPools((prevPools) => [...prevPools, response.data.pool]);

      // Reset form and close dialog
      setNewPool({
        name: "",
        category: "",
        minimumDeposit: 0,
        annualROI: "",
        investments: [],
      });
      setIsAddingPool(false);
      toast.success("Pool added successfully!");
    } catch (error) {
      console.error("Error adding pool:", error);
      toast.error("Failed to add pool. Please try again.");
    }
  };

  useEffect(() => {
    fetchPools();
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investment Pools</h2>
          <p className="text-muted-foreground">Manage investment pools and ROI settings</p>
        </div>
        <Dialog open={isAddingPool} onOpenChange={setIsAddingPool}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Pool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investment Pool</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAddPool}>
              <div>
                <label className="text-sm font-medium">Pool Name</label>
                <Input
                  placeholder="Enter pool name"
                  value={newPool.name}
                  onChange={(e) =>
                    setNewPool({ ...newPool, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full mt-2 p-2 border rounded-md"
                  value={newPool.category}
                  onChange={(e) =>
                    setNewPool({ ...newPool, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Minimum Deposit (USD)
                </label>
                <Input
                  type="number"
                  placeholder="Enter minimum deposit"
                  value={newPool.minimumDeposit}
                  onChange={(e) =>
                    setNewPool({
                      ...newPool,
                      minimumDeposit: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Annual ROI</label>
                <Input
                  placeholder="Enter annual ROI (e.g., 11% - 50%)"
                  value={newPool.annualROI}
                  onChange={(e) =>
                    setNewPool({ ...newPool, annualROI: e.target.value })
                  }
                />
              </div>
              <Button className="w-full" type="submit">
                Create Pool
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pool Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Min Deposit</TableHead>
              <TableHead>Annual ROI</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pools.length > 0 ? (
              pools.map((pool) => (
                <TableRow key={pool._id}>
                  <TableCell className="font-medium">{pool.name}</TableCell>
                  <TableCell>
                    {
                      categories.find(
                        (category) => category._id === pool.category
                      )?.name || "Unknown"
                    }
                  </TableCell>
                  <TableCell>${pool.minimumDeposit.toLocaleString()}</TableCell>
                  <TableCell>{pool.annualROI}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No pools available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
