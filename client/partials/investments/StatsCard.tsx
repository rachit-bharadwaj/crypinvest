import { addCommasToNumber } from "@/lib/utils";
import { StatsCardProps } from "@/types/investments";
import Image from "next/image";

export default function StatsCard({
  amount,
  increase,
  comment,
  title,
  increaseComment,
  image,
}: StatsCardProps) {
  return (
    <div className="bg-white w-full p-5 rounded-lg flex flex-col lg:flex-row gap-5 lg:items-center shadow justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-gray-600">{title}</p>
        <p className="font-bold text-xl">
          ${addCommasToNumber(amount, "roman")}
        </p>
        <p className={increase >= 0 ? "text-green-500" : "text-red-500"}>{`${
          increase >= 0 ? "+" : "-"
        }${increase}% ${increaseComment}`}</p>
        <p className="text-gray-500">{comment}</p>
      </div>

      <Image
        src={image}
        alt={title}
        width={500}
        height={500}
        className="lg:h-32 lg:w-fit w-full h-fit shrink-0 flex"
      />
    </div>
  );
}
