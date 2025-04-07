"use client";

import { REFERRAL_BASE_URL } from "@/constants/api";
import { useWallet } from "@/contexts/Wallet";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "../ui/card";
import dynamic from "next/dynamic";

const Tree = dynamic(
  () => import("react-organizational-chart").then((mod) => mod.Tree),
  { ssr: false }
);
const TreeNode = dynamic(
  () => import("react-organizational-chart").then((mod) => mod.TreeNode),
  { ssr: false }
);

type ReferralTreeData = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  // Ancestors: ordered from oldest (root referrer) to immediate parent.
  ancestors: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  descendants: ReferralTreeNode[];
};

type ReferralTreeNode = {
  id: string;
  fullName: string;
  email: string;
  level: number;
  commission: number;
  referrals: ReferralTreeNode[];
};

export default function ReferralTree() {
  const [referralTreeData, setReferralTreeData] =
    useState<ReferralTreeData | null>(null);
  const [showTree, setShowTree] = useState(false);
  const { walletAddress } = useWallet();

  useEffect(() => {
    const fetchReferralTree = async () => {
      if (!walletAddress) {
        toast.error("Wallet address is not connected.");
        return;
      }
      try {
        const response = await fetch(
          `${REFERRAL_BASE_URL}/tree/${walletAddress}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setReferralTreeData(null);
            setShowTree(true);
            return;
          } else {
            throw new Error("Failed to fetch referral tree");
          }
        }
        const data = await response.json();
        console.log(data);
        if (!data.referralTree || Object.keys(data.referralTree).length === 0) {
          setReferralTreeData(null);
          setShowTree(true);
          return;
        }
        setReferralTreeData(data.referralTree);
        setShowTree(true);
      } catch (error) {
        console.error("Error fetching referral tree:", error);
        toast.error("An error occurred while fetching the referral tree.");
        setShowTree(false);
      }
    };

    fetchReferralTree();
  }, [walletAddress]);

  // Combine ancestors, current user, and descendants into one full tree.
  // The chain will be: oldest ancestor -> ... -> immediate parent -> current user (with its descendants).
  const buildFullTree = (data: ReferralTreeData): any => {
    const { user, ancestors, descendants } = data;
    // Create the current user node.
    const currentNode: ReferralTreeNode = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      level: 0,
      commission: 0,
      referrals: descendants,
    };

    // Reduce the ancestors array into a single chain.
    const fullTree = ancestors.reduceRight((child, ancestor) => {
      return {
        id: ancestor.id,
        fullName: ancestor.fullName,
        email: ancestor.email,
        referrals: [child],
      };
    }, currentNode);

    return fullTree;
  };

  // Render a node label and highlight if it is the current user.
  const renderNodeLabel = (node: any, currentUserId: string) => {
    const isCurrentUser = node.id === referralTreeData?.user.id;
    return (
      <div
        className={`px-4 py-2 rounded-lg border-[#2A2D44] shadow-lg border ${
          isCurrentUser ? "bg-[#00cfff] text-black" : "bg-[#1A1B2E] text-white"
        }`}
      >
        <p className="font-bold">{node.fullName}</p>
        <p className="text-xs">{node.email}</p>
      </div>
    );
  };

  // Recursively render the full tree structure.
  const renderTreeNodes = (node: any, currentUserId: string) => {
    return (
      <TreeNode key={node.id} label={renderNodeLabel(node, currentUserId)}>
        {node.referrals &&
          node.referrals.length > 0 &&
          node.referrals.map((child: any) =>
            renderTreeNodes(child, currentUserId)
          )}
      </TreeNode>
    );
  };

  let fullTree;
  if (referralTreeData) {
    fullTree = buildFullTree(referralTreeData);
  }

  return (
    <div
      className="bg-[#1A1B2E] border-[#2A2D44] mt-10 rounded-lg"
      style={{ animation: "shining-border 3s linear infinite" }}
    >
      {showTree && referralTreeData && fullTree && (
        <Card className="mb-8 bg-[#1A1B2E] border-[#2A2D44] p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Referral Tree
          </h2>
          <div className="overflow-auto p-4 bg-[#0D0E1C] rounded-lg">
            <Tree
              lineWidth={"2px"}
              lineColor={"#00E4FF"}
              lineBorderRadius={"10px"}
              label={renderNodeLabel(fullTree, referralTreeData.user.id)}
            >
              {fullTree.referrals &&
                fullTree.referrals.length > 0 &&
                fullTree.referrals.map((child: any) =>
                  renderTreeNodes(child, referralTreeData.user.id)
                )}
            </Tree>
          </div>
        </Card>
      )}
    </div>
  );
}
