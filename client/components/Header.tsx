import { ReactNode } from "react";

export default function Header({
  label,
  isAdmin,
  adminControl,
}: {
  label: string;
  isAdmin?: Boolean;
  adminControl?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-5  items-center justify-between text-xl font-bold">
      <p>{label}</p>

      {isAdmin && (
        <div className="flex gap-2 flex-wrap items-center w-fit">
          {adminControl}
        </div>
      )}
    </div>
  );
}
