import { Card } from "@nextui-org/react";
import { CircleAlert, CircleCheck } from "lucide-react";

export default function ErrorNotification({
  children,
  isError,
  isWarning,
  isSuccess,
}: any) {
  return (
    <Card
      shadow="none"
      className={`w-full p-2 min-h-12 flex flex-row flex-wrap text-center justify-center items-center sm:text-start sm:items-start sm:justify-start gap-2 ${
        isError
          ? "bg-danger/20 text-danger-600 dark:text-danger"
          : isWarning
          ? "bg-warning/20 text-warning-600 dark:text-warning"
          : isSuccess
          ? "bg-success/20 text-success-600 dark:text-success"
          : ""
      }`}
    >
      {isSuccess ? <CircleCheck /> : <CircleAlert />}
      <span>{children}</span>
    </Card>
  );
}
