"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USER_BASE_URL } from "@/constants/api";
import axios from "axios";
import { Copy, FileIcon, PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Document {
  doc: string;
  verifiedStatus: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  walletAddress: string;
  capital: number;
  status: string;
  documents: {
    residenceProof: Document;
    bankStatement: Document;
    proofOfIncome: Document;
    passport: Document;
    livePhoto: Document;
  };
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verificationLoading, setVerificationLoading] = useState<
    Record<string, "verifying" | "rejecting" | undefined>
  >({});

  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${USER_BASE_URL}`);
        const data = await response.json();

        // Map the data to match the User interface and sort by createdAt
        const mappedUsers = data.users.map((user: any) => ({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          walletAddress: user.walletAddress,
          capital: user.capital || 0,
          status: user.status || "Active",
          documents: user.documents || {},
          createdAt: user.createdAt,
        }));

        setUsers(
          mappedUsers.sort(
            (a: User, b: User) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleVerifyDocument = async (
    documentType: string,
    action: "verifying" | "rejecting"
  ) => {
    if (!selectedUser) return;

    setVerificationLoading((prev) => ({ ...prev, [documentType]: action }));

    try {
      const verifiedStatus = action === "verifying" ? "Verified" : "Rejected";
      const response = await axios.patch(
        `${USER_BASE_URL}/${selectedUser.id}/documents/verify`,
        { documentType, verifiedStatus }
      );

      if (response.data.success) {
        const updatedDocuments = {
          ...selectedUser.documents,
          [documentType]: {
            ...selectedUser.documents[documentType],
            verifiedStatus: verifiedStatus,
          },
        };

        setSelectedUser((prev) =>
          prev ? { ...prev, documents: updatedDocuments } : null
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? { ...user, documents: updatedDocuments }
              : user
          )
        );

        toast.success(`Document ${verifiedStatus.toLowerCase()} successfully!`);
      } else {
        toast.error("Failed to update document status.");
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      toast.error("Failed to update document status.");
    } finally {
      setVerificationLoading((prev) => ({
        ...prev,
        [documentType]: undefined,
      }));
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyWalletAddress = (walletAddress: string) => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied to clipboard!");
  };

  const handleOpenDocuments = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseDocuments = () => {
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage your platform users</p>
        </div>
        <Button onClick={() => setIsAddingUser(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
          <span className="ml-2">Loading users...</span>
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Capital</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="flex gap-5 ">
                    <span className="w-20" title={user.walletAddress}>
                      {`${user.walletAddress.slice(
                        0,
                        5
                      )}...${user.walletAddress.slice(-5)}`}
                    </span>
                    <Copy
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={() =>
                        handleCopyWalletAddress(user.walletAddress)
                      }
                    />
                  </TableCell>
                  <TableCell>${user.capital.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Active"
                          ? "default"
                          : user.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenDocuments(user)}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Document Side Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={handleCloseDocuments}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Documents for {selectedUser?.fullName}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {selectedUser?.documents &&
              Object.entries(selectedUser.documents).map(
                ([documentType, document]) => (
                  <div
                    key={documentType}
                    className="space-y-4 p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold capitalize">
                        {documentType.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </p>
                      <Badge
                        variant={
                          document.verifiedStatus === "Verified"
                            ? "default"
                            : document.verifiedStatus === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {document.verifiedStatus}
                      </Badge>
                    </div>

                    {document.doc ? (
                      <>
                        {document.doc.startsWith("data:image") ? (
                          <img
                            src={document.doc}
                            alt={`${documentType} document`}
                            className="w-full h-auto rounded-lg border"
                          />
                        ) : (
                          <a
                            href={document.doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline flex items-center"
                          >
                            <FileIcon className="mr-2 h-4 w-4" />
                            View Document
                          </a>
                        )}

                        <div className="mt-2 flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleVerifyDocument(documentType, "verifying")
                            }
                            disabled={!!verificationLoading[documentType]}
                          >
                            {verificationLoading[documentType] ===
                            "verifying" ? (
                              <>
                                <LoadingSpinner />
                                Verifying...
                              </>
                            ) : (
                              "Verify"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleVerifyDocument(documentType, "rejecting")
                            }
                            disabled={!!verificationLoading[documentType]}
                          >
                            {verificationLoading[documentType] ===
                            "rejecting" ? (
                              <>
                                <LoadingSpinner />
                                Rejecting...
                              </>
                            ) : (
                              "Reject"
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-red-500">Document not uploaded</p>
                    )}
                  </div>
                )
              )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
