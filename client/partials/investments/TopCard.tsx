import type { TopCard as TopCardProps } from "@/types/investments";

export default function TopCard({ Icon, subtitle, title }: TopCardProps) {
  return (
    <div
      className="bg-[#1A1B2E]/50 border border-[#2A2D44] backdrop-blur-xl p-4 rounded-xl flex items-center gap-4"
      style={{
        animation: "shining-border 3s linear infinite",
      }}
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00E4FF]/20 to-[#8A8FB9]/20 flex items-center justify-center">
        <Icon />
      </div>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-[#8A8FB9]">{subtitle}</p>
      </div>
    </div>
  );
}
