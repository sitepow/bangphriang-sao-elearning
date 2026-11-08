import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import { apiEndpoint, axiosInstance } from "@/helpers";
import { FilePieChart, MonitorPlay, SquareMousePointer } from "lucide-react";
import PostCardShort from "@/components/StepCard";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { Avatar } from "@nextui-org/react";
import useSWR from "swr";
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export default function Home() {
  const { data: coursesMostView } = useSWR(
    `${apiEndpoint}/api/v1/course?isMostViewer=true&isActive=true`,
    fetcher
  );

  const { data: contentMostView } = useSWR(
    `${apiEndpoint}/api/v1/content?isMostViewer=true`,
    fetcher
  );

  const { data: settings } = useSWR("/api/get-settings", (url) =>
    fetch(url).then((res) => res.json())
  );

  return (
    <Layout>
      <NextSeo title={settings?.siteTitle} description={settings?.siteTitle} />

      <div
        className="bg-cover rounded-large text-white"
        style={{
          backgroundImage: `url(${apiEndpoint}/logo/banner.png)`,
          backgroundPosition: `${
            settings?.bgPosition == "bg-top"
              ? "top"
              : settings?.bgPosition == "bg-center"
              ? "center"
              : "bottom"
          }`,
        }}
      >
        <div className="flex flex-col justify-center items-center text-center sm:shadow-medium rounded-large">
          <div className="w-full flex justify-between items-center bg-gradient-to-t from-black via-black/50 p-5 rounded-b-large flex-wrap">
            <div className="xl:w-[70%] w-full flex-col gap-2 flex justify-center">
              {settings?.isShowSiteTitle && (
                <div className="flex justify-center items-center space-x-2 mb-5 w-full lg:w-4/5 xl:w-1/2">
                  {settings?.isLogoCircle ? (
                    <Avatar
                      alt="logo"
                      src={`${apiEndpoint}/logo/logo.png`}
                      size="lg"
                    />
                  ) : (
                    <img
                      alt="logo"
                      src={`${apiEndpoint}/logo/logo.png`}
                      className="h-14"
                    />
                  )}
                </div>
              )}

              {!settings?.isShowSiteTitle && (
                <div className="flex justify-center items-center space-x-2 mb-5 w-full lg:w-4/5 xl:w-1/2">
                  {settings?.isLogoCircle ? (
                    <Avatar
                      alt="logo"
                      src={`${apiEndpoint}/logo/logo.png`}
                      size="lg"
                    />
                  ) : (
                    <img
                      alt="logo"
                      src={`${apiEndpoint}/logo/logo.png`}
                      className="h-14"
                    />
                  )}
                </div>
              )}

              <span className="text-2xl font-bold w-full lg:w-4/5 xl:w-1/2">
                {settings?.siteTitle}
              </span>

              <span className="text-lg opacity-75 w-full lg:w-4/5 xl:w-1/2">
                {settings?.siteDescription}
              </span>
              <Link href={"/docs"} className="w-full lg:w-4/5 xl:w-1/2">
                <span className="underline cursor-pointer">
                  ดูคู่มือการใช้งาน
                </span>
              </Link>
            </div>
            <div className="w-full"></div>
          </div>
        </div>
      </div>

      <Header label={"ขั้นตอนการเรียน"} />
      <div id="working" className="flex flex-col gap-2 sm:gap-5 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full">
          <PostCardShort
            number={1}
            icon={<SquareMousePointer />}
            detail={`เลือกบทเรียนที่มีจากระบบ เพื่อสมัครเข้าเรียนในสิ่งที่ต้องการเรียนรู้`}
            title={"เลือกบทเรียนที่สนใจ"}
          />
          <PostCardShort
            number={2}
            icon={<MonitorPlay />}
            detail={`ทำข้อสอบก่อนและหลังเรียน พร้อมรับชมวิดีโอเพื่อผ่านเนื้อหา`}
            title={"รับชมวิดีโอและทำข้อสอบ"}
          />
          <PostCardShort
            number={3}
            icon={<FilePieChart />}
            detail={`เมื่อผ่านการอบรม สามารถรับใบประกาศนียบัตรได้ทันทีจากบทเรียน`}
            title={"รับใบประกาศนียบัตรออนไลน์"}
          />
        </div>
      </div>

      <div className="group flex flex-col gap-2 sm:gap-5 ">
        {coursesMostView?.data?.length > 0 && (
          <>
            <Header label={"บทเรียนยอดนิยม"} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full">
              {coursesMostView.data?.map((item: any, index: any) => {
                return (
                  <PostCard
                    settings={settings}
                    key={item.id}
                    number={index + 1}
                    item={item}
                    linkprefix="course"
                    isCourse
                  />
                );
              })}
            </div>
          </>
        )}

        {contentMostView?.data?.length > 0 && (
          <>
            <Header label={"บทความยอดนิยม"} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full">
              {contentMostView.data?.map((item: any, index: any) => {
                return (
                  <PostCard
                    key={item.id}
                    item={item}
                    linkprefix="post"
                    number={index + 1}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
