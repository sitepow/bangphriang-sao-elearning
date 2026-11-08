import { Button } from "@nextui-org/react";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-[70vh] flex flex-col justify-center items-center text-center">
      <h1 className="text-6xl font-bold mb-4 dark:text-white">404</h1>
      <p className="text-xl mb-8">ขออภัย หน้าที่คุณกำลังมองหาไม่มีอยู่</p>

      <Button
        className="bg-main text-white"
        startContent={<ChevronLeft />}
        onClick={() => {
          router.push("/course");
        }}
      >
        กลับหน้าหลัก
      </Button>
    </div>
  );
}
