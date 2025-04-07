import {
  InvestmentDomains,
  InvestmentsTable,
  ReferralBanner,
} from "@/components/investments";

export default function Home() {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col gap-5 w-full">
        <ReferralBanner />

        <InvestmentDomains />

        <InvestmentsTable />
      </div>
    </div>
  );
}
