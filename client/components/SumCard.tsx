import { Card } from "@nextui-org/react";

type SumCardProps = {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
};

export default function SumCard({
  label,
  value,
  icon: Icon,
  suffix,
}: SumCardProps) {
  return (
    <Card
      shadow="sm"
      className={`h-fit p-5 flex flex-col space-y-2 justify-between relative border dark:border-dark  z-0`}
    >
      <span>{label}</span>
      <span className="text-xl font-bold opacity-75">
        {value !== 0
          ? `${value?.toLocaleString()}${suffix && ` ${suffix}`}`
          : "-"}
      </span>

      <div className="absolute bottom-4 right-8 flex items-center justify-center rounded-full z-50 w-12 h-12 bg-main">
        <Icon className=" text-white" />
      </div>
    </Card>
  );
}
