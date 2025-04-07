"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { USER_BASE_URL } from "@/constants/api";
import countries from "@/constants/countries.json";
import { useWallet } from "@/contexts/Wallet";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

// imagekit.io for assets storage
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { FileIcon } from "lucide-react";

interface DocumentEntry {
  doc: string | null;
  verifiedStatus: string;
}

type Documents = {
  residenceProof: DocumentEntry;
  bankStatement: DocumentEntry;
  proofOfIncome: DocumentEntry;
  livePhoto: DocumentEntry;
  passport: DocumentEntry;
};

type NFT = {
  image: string;
  name: string;
  description: string;
};

export default function SettingsPage() {
  const { walletAddress } = useWallet();
  const [userId, setUserId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    fullName: "",
    email: "",
    gender: "",
    phone: "",
    address: "",
    profilePicture: "",
    avatar: "",
  });

  const [documents, setDocuments] = useState<Documents>({
    residenceProof: { doc: null, verifiedStatus: "Not Uploaded" },
    bankStatement: { doc: null, verifiedStatus: "Not Uploaded" },
    proofOfIncome: { doc: null, verifiedStatus: "Not Uploaded" },
    livePhoto: { doc: null, verifiedStatus: "Not Uploaded" },
    passport: { doc: null, verifiedStatus: "Not Uploaded" },
  });

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [showNFTPicker, setShowNFTPicker] = useState(false);

  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
  const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

  const authenticator = async () => {
    try {
      const response = await fetch("/api/auth");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error: any) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  const handleProfileUploadSuccess = async (res: any) => {
    const url = res.url;
    try {
      // Update local state
      setProfileInfo((prev) => ({
        ...prev,
        profilePicture: url,
      }));

      // Send URL to backend
      await axios.patch(`${USER_BASE_URL}/${userId}`, {
        profilePicture: url,
      });

      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture.");
    }
  };

  const onError = (err: any) => {
    console.log("Error", err);
  };

  // Function to fetch NFTs
  const fetchNFTs = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected.");
      return;
    }

    try {
      const response = await axios.get(
        `${USER_BASE_URL}/nfts/${walletAddress}`
      );

      // Filter valid NFTs with images
      const validNFTs = response.data.nfts.filter(
        (nft: any) => nft.image && nft.image.startsWith("http")
      );

      console.log("Valid NFTs:", validNFTs);

      setNFTs(validNFTs);
      setShowNFTPicker(true);
    } catch (error: any) {
      console.error("NFT Fetch Error:", error);
      toast.error(
        `Failed to fetch NFTs: ${error.response?.data?.error || error.message}`
      );
    }
  };

  // Function to set NFT as profile picture
  const handleNFTSelection = async (selectedNFT: any) => {
    try {
      const response = await axios.patch(`${USER_BASE_URL}/${userId}`, {
        profilePicture: selectedNFT.image, // Assuming `image` is the NFT image URL
      });
      if (response.data.success) {
        toast.success("Profile picture updated successfully!");
        setProfileInfo((prev) => ({
          ...prev,
          profilePicture: selectedNFT.image,
        }));
      } else {
        toast.error("Failed to update profile picture.");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture.");
    }
  };

  const handleDocumentUploadSuccess = async (
    res: any,
    documentType: string
  ) => {
    const url = res.url;
    try {
      // Update local state
      setDocuments((prev) => ({
        ...prev,
        [documentType]: { doc: url, verifiedStatus: "Pending" },
      }));

      // Send URL to backend
      await axios.post(`${USER_BASE_URL}/${userId}/documents`, {
        documentType,
        documentPath: url,
      });

      setIsUploading(false);

      toast.success(
        `${documentType.replace(/([A-Z])/g, " $1")} uploaded successfully!`
      );
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(
        `Failed to upload ${documentType.replace(/([A-Z])/g, " $1")}.`
      );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${USER_BASE_URL}/wallet/${walletAddress}`
        );
        const user = response.data;
        console.log(user);

        setUserId(user._id);
        setProfileInfo({
          fullName: user.fullName,
          email: user.email,
          gender: user.gender,
          phone: user.phone,
          address: user.address || "",
          profilePicture: user.profilePicture || "",
          avatar: user.avatar || "",
        });
        setSelectedCountry(user.country);

        setDocuments({
          residenceProof: user.documents.residenceProof || {
            doc: null,
            verifiedStatus: "Not Uploaded",
          },
          bankStatement: user.documents.bankStatement || {
            doc: null,
            verifiedStatus: "Not Uploaded",
          },
          proofOfIncome: user.documents.proofOfIncome || {
            doc: null,
            verifiedStatus: "Not Uploaded",
          },
          livePhoto: user.documents.livePhoto || {
            doc: null,
            verifiedStatus: "Not Uploaded",
          },
          passport: user.documents.passport || {
            doc: null,
            verifiedStatus: "Not Uploaded",
          },
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [walletAddress]);

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...profileInfo,
        country: selectedCountry,
      };

      console.log("Payload:", payload);

      const response = await axios.patch(`${USER_BASE_URL}/${userId}`, payload);

      if (response.data.success) {
        toast.success("Profile information saved successfully!");
      } else {
        toast.error("Failed to save profile information.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile information.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelection = (avatarUrl: any) => {
    setProfileInfo((prev) => ({ ...prev, avatar: avatarUrl }));
    console.log("Selected Avatar:", avatarUrl);
  };

  const avatarImages = [
    "/images/avatars/girl1.webp",
    "/images/avatars/boy1.webp",
  ];

  return (
    <div className="mx-auto px-4 py-8">
      <ImageKitProvider
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
      >
        <Tabs
          defaultValue="profile"
          className="w-full rounded-lg"
          style={{
            animation: "shining-border 3s linear infinite",
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Dialog open={showNFTPicker} onOpenChange={setShowNFTPicker}>
              <DialogContent className="overflow-y-auto bg-[#1a1b2e] border-none">
                <DialogHeader>
                  <DialogTitle className="text-white">Select NFT</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {nfts.length > 0 ? (
                    nfts.map((nft, index) => (
                      <div
                        key={index}
                        className="border p-2 rounded cursor-pointer hover:shadow-md"
                        onClick={() => {
                          handleNFTSelection(nft);
                          setShowNFTPicker(false);
                        }}
                      >
                        <img
                          src={nft.image}
                          alt={nft.name || "NFT"}
                          width={100}
                          height={100}
                          className="rounded"
                        />
                        <p className="text-sm text-center mt-2">{nft.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-3 text-center text-gray-500 mt-6">
                      No NFTs found for this wallet address.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Card className="p-6 bg-[#1a1b2e] text-gray-300 border-none">
              <h2 className="text-xl font-semibold mb-4">
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center justify-between gap-5 flex-col lg:flex-row lg:gap-20">
                    {profileInfo.profilePicture && (
                      <img
                        src={profileInfo.profilePicture}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full h-24 w-24"
                      />
                    )}
                    <div className="flex gap-3 flex-wrap justify-center lg:gap-10 items-center lg:justify-between w-full lg:flex-nowrap">
                      <div className="w-full">
                        <IKUpload
                          id="fileUpload"
                          fileName={`profile_${userId}_${Date.now()}`}
                          accept="image/*"
                          className="hidden"
                          onUploadStart={() => setIsUploadingProfilePic(true)}
                          onError={(err) => {
                            console.error("Upload error:", err);
                            toast.error("Failed to upload profile picture.");
                            setIsUploadingProfilePic(false);
                          }}
                          onSuccess={(res) => {
                            handleProfileUploadSuccess(res);
                            setIsUploadingProfilePic(false);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            document.getElementById("fileUpload")?.click()
                          }
                          className="bg-[#00E4FF] text-[#0A0B1D] w-full hover:bg-[#00E4FF]/90 border-none"
                          disabled={isUploadingProfilePic}
                        >
                          {isUploadingProfilePic
                            ? "Uploading..."
                            : "Upload New Photo"}
                        </Button>
                      </div>

                      <p>OR</p>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNFTPicker(true);
                          fetchNFTs();
                        }}
                        className="bg-[#0d0e1c] text-[#00E4FF] hover:text-gray-400 w-full hover:bg-[#0d0e1c]/90 border-none"
                      >
                        Set New NFT
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Avatar</Label>
                  <div className="flex space-x-2 mt-2">
                    {avatarImages.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => handleAvatarSelection(avatar)}
                        className={`p-1 rounded-full ${
                          profileInfo.avatar === avatar
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                      >
                        <Image
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className="h-20 w-fit rounded-full"
                          width={500}
                          height={500}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Profile Fields */}
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300"
                    id="fullName"
                    value={profileInfo.fullName}
                    onChange={(e) =>
                      setProfileInfo({
                        ...profileInfo,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300"
                    id="email"
                    value={profileInfo.email}
                    onChange={(e) =>
                      setProfileInfo({ ...profileInfo, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label
                    className="text-white placeholder:text-gray-300"
                    htmlFor="gender"
                  >
                    Gender
                  </Label>
                  <Select
                    value={profileInfo.gender}
                    onValueChange={(value) =>
                      setProfileInfo({ ...profileInfo, gender: value })
                    }
                  >
                    <SelectTrigger
                      id="gender"
                      className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Country of Residence</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger
                      id="country"
                      className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300">
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-white placeholder:text-gray-300 font-medium"
                  >
                    Phone Number
                  </label>
                  <PhoneInput
                    defaultCountry="in"
                    value={profileInfo.phone}
                    onChange={(phone) => {
                      setProfileInfo({ ...profileInfo, phone });
                    }}
                    className="bg-[#0D0E1C] border-[#2A2D44] text-white placeholder:text-gray-300"
                    inputStyle={{
                      backgroundColor: "transparent",
                      color: "white",
                      border: 0,
                    }}
                    inputClassName="w-full mt-1 p-2 bg-transparent border rounded-md text-white placeholder:text-gray-300"
                    required
                  />
                </div>

                <Button
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/90"
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="p-6 bg-[#1a1b2e] text-gray-300 border-none">
              <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
              <div className="space-y-4">
                {Object.entries(documents)
                  .filter(([docType]) => docType === "passport")
                  .map(([docType, value]) => {
                    const docValue = value as DocumentEntry;

                    return (
                      <div key={docType} className="space-y-2">
                        <Label htmlFor={docType}>
                          {docType.replace(/([A-Z])/g, " $1").toUpperCase()}
                        </Label>
                        <div className="flex items-center space-x-4">
                          {docValue.doc ? (
                            <div className="flex items-center space-x-4">
                              {/* Generic File Preview */}
                              <div className="flex items-center gap-2">
                                {/* Image Preview */}
                                {typeof docValue.doc === "string" &&
                                docValue.doc.match(
                                  /\.(jpeg|jpg|gif|png|webp)$/
                                ) ? (
                                  <div
                                    onClick={() =>
                                      window.open(
                                        docValue.doc as string,
                                        "_blank"
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Image
                                      src={docValue.doc as string}
                                      alt={`${docType} document`}
                                      width={100}
                                      height={100}
                                      className="rounded-lg object-cover"
                                    />
                                  </div>
                                ) : (
                                  // Generic File Preview
                                  <a
                                    href={docValue.doc as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-500 hover:underline"
                                  >
                                    <FileIcon className="w-8 h-8" />
                                    <span className="text-sm">
                                      View {docType.replace(/([A-Z])/g, " $1")}
                                    </span>
                                  </a>
                                )}
                              </div>

                              {/* Verification Status */}
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-semibold ${
                                    value.verifiedStatus === "Verified"
                                      ? "text-green-500"
                                      : value.verifiedStatus === "Pending"
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {value.verifiedStatus}
                                </span>
                                {value.verifiedStatus === "Pending" && (
                                  <p className="text-xs text-yellow-500">
                                    Verification in progress
                                  </p>
                                )}
                                {value.verifiedStatus === "Rejected" && (
                                  <p className="text-xs text-red-500">
                                    Rejected: Please upload a new file
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Not Uploaded
                            </span>
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex items-center gap-2">
                          <IKUpload
                            id={`upload-${docType}`}
                            fileName={`${docType}_${userId}_${Date.now()}`}
                            onUploadStart={() => setIsUploading(true)}
                            onError={(err) => {
                              onError(err);
                              setIsUploading(false);
                              toast.error("Upload failed. Please try again.");
                            }}
                            onSuccess={(res) =>
                              handleDocumentUploadSuccess(res, docType)
                            }
                            className="hidden"
                          />
                          <Button
                            onClick={() =>
                              document
                                .getElementById(`upload-${docType}`)
                                ?.click()
                            }
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            className="bg-[#00E4FF] text-[#0A0B1D] hover:bg-[#00E4FF]/90 border-none"
                          >
                            {isUploading ? (
                              <div className="flex items-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2"
                                  viewBox="0 0 24 24"
                                >
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
                                Uploading...
                              </div>
                            ) : value.doc ? (
                              "Re-upload"
                            ) : (
                              "Upload"
                            )}
                          </Button>

                          {value.doc && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(value.doc as string, "_blank")
                              }
                            >
                              View Document
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </ImageKitProvider>
    </div>
  );
}
