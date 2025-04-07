"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUTH_BASE_URL, REFERRAL_BASE_URL } from "@/constants/api";
import countries from "@/constants/countries.json";
import { useWallet } from "@/contexts/Wallet";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";

const KYCVerificationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralVerified, setReferralVerified] = useState(false);
  const [referralResponse, setReferralResponse] = useState<{
    type: string;
    message: string;
    referrerId?: string;
  }>({
    type: "",
    message: "",
    referrerId: "",
  });
  const [selectedCountry, setSelectedCountry] = useState("United Arab Emirates");

  const router = useRouter();
  const { walletAddress } = useWallet();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    gender: "",
    agreeToTerms: false,
  });

  const verifyReferralCode = async (referralCode: string) => {
    try {
      const response = await axios.post(`${REFERRAL_BASE_URL}/check`, {
        referralCode,
      });

      // Log response for debugging
      console.log("API Response:", response);

      const resData = response.data;

      if (resData.success) {
        setReferralVerified(true);
        setReferralResponse({
          type: "success",
          message: "Referral code verified successfully!",
          referrerId: resData.referrer._id,
        });

        console.log(referralResponse);
      } else {
        setReferralVerified(false);
        setReferralResponse({
          type: "error",
          message: resData.message || "Invalid referral code.",
        });
      }
    } catch (error) {
      // Log error for debugging
      console.error("Error verifying referral code:", error);

      if (axios.isAxiosError(error)) {
        setReferralResponse({
          type: "error",
          message: error.response?.data?.message || "Invalid referral code.",
        });
      } else {
        setReferralResponse({
          type: "error",
          message:
            "An unexpected error occurred while validating the referral code.",
        });
      }
      setReferralVerified(false);
    }
  };

  const handleReferralChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target as HTMLInputElement;

    setReferralCode(value);

    if (value.length === 6) {
      verifyReferralCode(value);
    }
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else if (type === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files?.[0] || null }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData)

    // Check if all required fields are filled
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      !formData.gender ||
      !formData.agreeToTerms ||
      !referralCode
    ) {
      toast.error(
        "Please fill in all required fields and upload the document."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the user's account
      const registrationPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry,
        gender: formData.gender,
        agreeToTerms: formData.agreeToTerms,
        walletAddress,
      };

      console.log("Registration Payload:", registrationPayload);

      const registrationResponse = await fetch(`${AUTH_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationPayload),
      });

      const registrationResult = await registrationResponse.json();

      console.log("Registration Response:", registrationResult);

      if (!registrationResponse.ok) {
        console.error("Registration Error:", registrationResult);
        return toast.error(
          registrationResult.error || "Failed to create the account."
        );
      }

      // Step 2: Create the referral using the registered user's ID
      const referralPayload = {
        referralCode,
        walletAddress: walletAddress,
        referrer: referralResponse.referrerId,
      };

      console.log("Referral Payload:", referralPayload);

      const referralRes = await axios.post(
        `${REFERRAL_BASE_URL}/wallet`,
        referralPayload
      );

      if (referralRes.data.error) {
        console.error("Referral API Error:", referralRes.data.error);
        return toast.error(referralRes.data.error);
      }

      console.log("Referral Response:", referralRes.data);

      // Success message
      toast.success("KYC details and referral created successfully!");
      router.push("/");

      // Reset the form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        gender: "",
        agreeToTerms: false,
      });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);

      if (error.response) {
        // Axios error
        console.error("Error Response Data:", error.response.data);
        toast.error(error.response.data.message || "An error occurred.");
      } else if (error.request) {
        // Network error
        console.error("Error Request Data:", error.request);
        toast.error("Network error while submitting the details.");
      } else {
        // Unknown error
        console.error("Unknown Error:", error.message);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      country: "",
      gender: "",
      agreeToTerms: false,
    });
  };

  return (
    <div className="flex justify-center items-center py-20">
      <div className="bg-[#1A1B2E] w-full max-w-lg rounded-lg p-6">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-xl font-semibold">KYC Verification</h1>
          <p className="text-sm text-gray-500 mt-2">
            Please provide your accurate information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="referralCode" className="text-sm font-medium">
              Referral Code
            </label>
            <input
              type="text"
              id="referralCode"
              name="referralCode"
              value={referralCode || ""}
              onChange={handleReferralChange}
              className="w-full mt-1 p-2 border rounded-md bg-[#1a1b2e]"
              placeholder="Enter Referral Code"
              required
            />

            <p
              className={
                referralResponse.type === "success"
                  ? `text-green-500`
                  : `text-red-500`
              }
            >
              {referralResponse.message}
            </p>
          </div>

          {!referralVerified ? (
            <p className="text-yellow-500">
              Currently we are only onboarding our clients through referral
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md bg-[#1a1b2e]"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md bg-[#1a1b2e]"
                  placeholder="Email Address"
                  required
                />
              </div>

              <div>
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md bg-[#1a1b2e]"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="country" className="text-sm font-medium">
                  Country of Residence
                </label>
                <Select
                  value={selectedCountry}
                  onValueChange= {
                    (value) => {
                      setSelectedCountry(value);
                      setFormData((prevData) => ({
                        ...prevData,
                        country: value,
                      }));
                    }
                  }
                >
                  <SelectTrigger
                    id="country"
                    className="w-full mt-1 p-2 border rounded-md bg-[#1a1b2e]"
                  >
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="ae"
                  value={formData.phone}
                  onChange={(phone) => {
                    setFormData((prevData) => ({
                      ...prevData,
                      phone,
                    }));
                  }}
                  inputClassName="w-full mt-1 p-2 border rounded-md bg-[#1a1b2e]"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4"
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-500 text-gray-500 rounded-md hover:bg-[#1a1b2e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default KYCVerificationPage;
