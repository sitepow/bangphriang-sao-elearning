import { apiEndpoint, truncateText } from "@/helpers";
import Image from "next/image";
import Link from "next/link";
import { Avatar, Card } from "@nextui-org/react";
import { Eye, Folder } from "lucide-react";

type PostCardProps = {
  item: any;
  linkprefix: string;
  isCourse?: boolean;
  settings?: any;
  number?: any;
  customGrid?: string;
  disableFromCourse?: any;
  fromCourse?: any;
};

export default function PostCard({
  item,
  isCourse,
  linkprefix,
  fromCourse,
  disableFromCourse,
  settings,
  customGrid,
  number,
}: PostCardProps) {
  const isCourseDeactivate = isCourse && item?.status === "deactivate";

  return (
    <div className="w-full shadow-medium rounded-large border dark:border-dark  flex flex-col items-center justify-center duration-300">
      <Card className="w-full hover:scale-[1.01] duration-300">
        <Link
          href={`${
            disableFromCourse
              ? "#"
              : fromCourse && !disableFromCourse
              ? fromCourse
              : isCourse && !isCourseDeactivate
              ? `/${linkprefix}/${item?.id}`
              : !isCourse
              ? `/${linkprefix}/${item?.id}`
              : ""
          }`}
          className={`${customGrid} relative tracking-tight`}
        >
          <div className="relative">
            <Image
              className="w-full min-h-[350px] object-cover rounded-large"
              src={
                item.imagePath
                  ? `${apiEndpoint}/images/${item.imagePath}`
                  : "/images/no-image.jpg"
              }
              alt={""}
              width={500}
              height={500}
            />

            <div className="absolute w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between">
              {number && (
                <div className="flex gap-2 items-center flex-wrap bg-gradient-to-b from-black to-transparent p-2.5 relative">
                  <div className="w-10 h-10 bg-clean-main text-white font-bold rounded-full flex justify-center items-center">
                    {number}.
                  </div>

                  <h1 className="text-lg text-white font-bold w-[80%]">
                    {truncateText(item?.title, 85)}
                  </h1>
                </div>
              )}

              {!number && (
                <h1 className="text-lg text-white font-bold bg-gradient-to-b from-black to-transparent p-2.5">
                  {truncateText(item?.title, 85)}
                </h1>
              )}

              <div className="flex flex-wrap gap-2 sm:gap-5  justify-between p-2.5 bg-gradient-to-t from-black to-transparent">
                <div className="flex space-x-2 items-center">
                  <Avatar
                    src={`${
                      item?.users.imagePath
                        ? `${apiEndpoint}/images/${item?.users.imagePath}`
                        : `/images/no-image.jpg`
                    } `}
                  />

                  <p className="text-white">{item?.users?.name}</p>
                </div>

                <div className="flex items-center flex-wrap gap-1">
                  {isCourse && item?.price !== 0 && (
                    <span
                      className={`text-white p-2 backdrop-blur-md bg-white/10 rounded-large shadow-medium ${
                        !settings?.isCourseMustPaid && "line-through"
                      }`}
                    >
                      ฿{item?.price?.toLocaleString()} บาท
                    </span>
                  )}

                  {isCourse && item?.price == 0 && (
                    <span className="p-2 bg-clean-main rounded-large text-white">
                      เรียนฟรี
                    </span>
                  )}

                  <div className="flex gap-1 text-white items-center p-2 bg-clean-main rounded-large">
                    <Eye size={20} />
                    <span>{item?.countView.toLocaleString() ?? "-"} ครั้ง</span>
                  </div>

                  {item?.mainCategories?.title && (
                    <div className="flex gap-1 text-white items-center p-2 bg-clean-main rounded-large">
                      <Folder size={20} />
                      <span>
                        {truncateText(item?.mainCategories?.title, 20) ?? "-"}
                      </span>
                    </div>
                  )}

                  {item?.subCategories?.title && (
                    <div className="flex gap-1 text-white items-center p-2 bg-clean-main rounded-large">
                      <Folder size={20} />
                      <span>
                        {truncateText(item?.subCategories?.title, 20) ?? "-"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </div>
  );
}
