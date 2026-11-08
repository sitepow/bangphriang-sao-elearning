import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import { apiEndpoint, axiosInstance, getAuth } from "@/helpers";
import { useEffect, useState } from "react";
import { Pagination, Spinner } from "@nextui-org/react";
import { NextSeo } from "next-seo";
import ErrorNotification from "@/components/ErrorNotification";
import { useRouter } from "next/router";

export default function Library() {
  const [courses, setCourses] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const router = useRouter();

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

  const apiGetCourses = async (page?: number) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/order/byUserId/${auth?.id}?page=${page || 1}`
      );

      const newDataFormat = data?.data?.map((item: any) => {
        const { id, imagePath, title, price, countView, users } =
          item.lessions || {};
        return {
          id,
          imagePath,
          title,
          price,
          countView,
          users: {
            imagePath: users?.imagePath,
            name: users?.name,
          },
        };
      });

      setCourses(newDataFormat);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (auth) {
      apiGetCourses();
    }
  }, [router, auth]);

  return (
    <Layout>
      <NextSeo
        title={`คลังเนื้อหาของฉัน - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {isLoading && (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && (
        <>
          <Header label={"คลังเนื้อหาของฉัน"} />

          {courses?.length === 0 && (
            <ErrorNotification isWarning>
              <p>ไม่มีเนื้อหาในขณะนี้</p>
            </ErrorNotification>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full ">
            {courses &&
              courses?.map((item: any) => {
                return (
                  <PostCard
                    settings={settings}
                    key={item.id}
                    item={item}
                    isCourse
                    linkprefix="course"
                  />
                );
              })}
          </div>

          <div className="flex justify-end">
            <Pagination
              showControls
              total={courses?.allPages}
              initialPage={1}
              onChange={async (e) => {
                await apiGetCourses(e);
              }}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
