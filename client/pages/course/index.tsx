import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import { apiEndpoint, axiosInstance } from "@/helpers";
import { useEffect, useState } from "react";
import { Pagination, Spinner } from "@nextui-org/react";
import { NextSeo } from "next-seo";
import ErrorNotification from "@/components/ErrorNotification";

export default function Course() {
  const [courses, setCourses] = useState<any>();
  const [coursesMostView, setCoursesMostView] = useState<any>();
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

  const apiGetCourses = async (page?: any) => {
    try {
      const courses = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course?page=${page || 1}&perPage=8&isActive=true`
      );

      const coursesMostView = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course?isMostViewer=true&isActive=true`
      );

      setCourses(courses?.data);
      setCoursesMostView(coursesMostView?.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    apiGetCourses();
  }, []);

  return (
    <Layout>
      <NextSeo
        title={`บทเรียนทั้งหมด - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {isLoading && (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="group flex flex-col gap-2 sm:gap-5 ">
        {!isLoading && courses?.data?.length !== 0 && (
          <>
            <Header label={"บทเรียนยอดนิยม"} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full">
              {courses &&
                coursesMostView.data?.map((item: any, index: any) => {
                  return (
                    <PostCard
                      settings={settings}
                      key={item.id}
                      item={item}
                      number={index + 1}
                      linkprefix="course"
                      isCourse
                    />
                  );
                })}
            </div>
          </>
        )}

        {!isLoading && (
          <>
            <Header label={"บทเรียนทั้งหมด"} />

            {courses?.data?.length === 0 && (
              <ErrorNotification isWarning>
                <p>ไม่มีบทเรียนในขณะนี้</p>
              </ErrorNotification>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full">
              {courses &&
                courses.data?.map((item: any) => {
                  return (
                    <PostCard
                      settings={settings}
                      key={item.id}
                      item={item}
                      linkprefix="course"
                      isCourse
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
      </div>
    </Layout>
  );
}
