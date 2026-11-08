import { Card } from "@nextui-org/react";

export default function StepCard({ icon, title, detail, number }: any) {
  return (
    <Card
      shadow="none"
      className={`px-5 py-2 justify-center shadow-lg items-center rounded-3xl border dark:border-dark gap-5 text-center bg-white/10 backdrop-blur-md`}
    >
      <div
        className={`w-14 h-14 bg-main rounded-full flex flex-col justify-center items-center font-bold text-white relative`}
      >
        <div className="w-8 h-8 text-black border dark:border-dark dark:text-white dark:bg-[#1a1a1a] absolute rounded-full -top-0 flex justify-center items-center bg-white -left-4">
          {number}.
        </div>

        {icon}
      </div>
      <div
        className={`flex flex-col justify-center items-center w-4/5 md:w-1/2 lg:w-4/5`}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="opacity-75">{detail}</p>
      </div>
    </Card>
  );
}
