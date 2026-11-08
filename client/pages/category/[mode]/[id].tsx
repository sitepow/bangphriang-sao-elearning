import Header from "@/components/Header";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiEndpoint, axiosInstance } from "@/helpers";
import PostCard from "@/components/PostCard";
import { Pagination, Spinner } from "@nextui-org/react";
import { NextSeo } from "next-seo";
import ErrorNotification from "@/components/ErrorNotification";

export default function Categories() {
  const router = useRouter();
  const [category, setCategory] = useState<any>();
  const [contents, setContents] = useState<any>();
  const { mode, id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/get-settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const apiGetCategory = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/${
          mode == "main" ? "main" : "sub"
        }/${id}`
      );

      setCategory(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetContents = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/${
          mode === "main" ? "main" : "sub"
        }/${id}?page=${page || 1}`
      );

      setContents(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    apiGetCategory();
    apiGetContents();
  }, [id, mode]);

  return (
    <Layout>
      <NextSeo
        title={`${
          category?.title
            ? `แสดงบทความในหมวดหมู่ "${category?.title}"`
            : "บทความที่ยังไม่มีการจัดหมวดหมู่"
        } - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {isLoading && (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && (
        <>
          <Header
            label={
              category?.title
                ? `แสดงบทความในหมวดหมู่ "${category?.title}"`
                : "บทความที่ยังไม่มีการจัดหมวดหมู่"
            }
          />

          {contents?.data?.length === 0 && (
            <ErrorNotification isWarning>
              <p>ไม่มีเนื้อหาในขณะนี้</p>
            </ErrorNotification>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full  group">
            {contents?.data?.map((item: any, index: number) => {
              return <PostCard key={index} item={item} linkprefix={"post"} />;
            })}
          </div>

          <div className="flex justify-end">
            <Pagination
              showControls
              total={contents?.allPages}
              initialPage={1}
              onChange={async (e) => {
                await apiGetContents(e);
              }}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
