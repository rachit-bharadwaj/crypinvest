import { topCardItems } from "@/constants/investments";
import { TopCard } from "@/partials/investments";

export default function TopBar() {
  return (
    <section className="hidden lg:grid grid-cols-4 gap-6">
      {topCardItems.map(({ title, subtitle, Icon }) => (
        <TopCard key={title} title={title} subtitle={subtitle} Icon={Icon} />
      ))}
    </section>
  );
}
