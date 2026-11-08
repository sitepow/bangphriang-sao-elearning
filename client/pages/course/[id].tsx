import Layout from "@/components/Layout";
import { axiosInstance, getAuth, apiEndpoint, truncateText } from "@/helpers";
import {
  ChevronLeft,
  CircleCheck,
  CirclePlus,
  Infinity,
  CircleX,
  Eye,
  LogIn,
  RefreshCcw,
  ShoppingCartIcon,
  FileQuestion,
  LockKeyhole,
  Clock,
  Folder,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getCookie } from "cookies-next";
import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Certification from "@/components/Certification";
import ErrorNotification from "@/components/ErrorNotification";
import NotFound from "@/components/NotFound";
import { openLoginForm, openVerifyForm } from "@/store/modalSlice";
import { useDispatch } from "react-redux";
import PostCard from "@/components/PostCard";

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<any>();
  const [isHasCourse, setIsHasCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userCompletes, setUserCompletes] = useState<any>([]);
  const [auth, setAuth] = useState<any>(null);
  const [courseContent, setCourseContents] = useState<any>();
  const [userContentComplete, setUserContentCompletes] = useState<any>();
  const [contentCompletes, setContentCompletes] = useState<any>([]);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const dispatch = useDispatch();
  const [order, setOrder] = useState<any>();

  const apiGetOrder = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/order/byUserId/${auth?.id}/byCourseId/${id}`
      );

      setOrder(data);
    } catch (error) {
      console.log(error);
    }
  };

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

  useEffect(() => {
    if (auth) {
      apiGetOrder();
    }
  }, [auth, router]);

  const userCourse = userCompletes?.find(
    (item: any) => item.userId == auth?.id
  );

  const userCourses = contentCompletes?.filter(
    (item: any) => item.userId == auth?.id && item.courseLogId == userCourse?.id
  );

  useEffect(() => {
    if (userCourse) {
      apiGetContentStatus(userCourse?.id);
    }
  }, [userCourse]);

  const userCourseCompleted = userCourses?.filter(
    (item: any) => item.status === "complete"
  );

  const apiCheckContentComplete = async () => {
    if (!userCourse && userCourse?.id) return;

    try {
      const data = await axiosInstance.post(
        `${apiEndpoint}/api/v1/course/log/checkContentComplete`,
        {
          userId: auth?.id,
          courseId: id,
          courseLogId: userCourse?.id,
        }
      );

      const status = data?.data?.status;

      if (status == "notpass") {
        await axiosInstance.patch(
          `${apiEndpoint}/api/v1/course/log/byCourseId/${id}/byUserId/${auth?.id}`,
          {
            status: "unComplete",
          }
        );

        router.reload();
      }

      if (status == "pass") {
        router.reload();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth) {
      apiCheckContentComplete();
    }
  }, [auth, router, id, userCourse]);

  const apiGetCourses = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/${id}`
      );

      setCourse(data);
      if (data) {
        setIsHasCourse(true);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsHasCourse(false);
      console.log(error);
    }
  };

  const apiGetContentStatus = async (courseLogId?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/log/byCourseId/${courseLogId}`
      );

      setUserContentCompletes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetuserCompleteCourses = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/item/byCourseId/${id}`
      );

      setUserCompletes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetCourseContents = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/item/${id}`
      );

      setCourseContents(data);
    } catch (error) {
      console.error("Error fetching course contents:", error);
    }
  };

  const apiCreateCourseStatus = async () => {
    try {
      const data = await axiosInstance.post(
        `${apiEndpoint}/api/v1/course/log`,
        {
          userId: auth.id,
          lessionId: id,
        }
      );

      return data?.data?.id;
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetContentCompletes = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/log/${id}`
      );

      setContentCompletes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiIncreaseView = async () => {
    try {
      await axiosInstance.put(
        `${apiEndpoint}/api/v1/course/view/increase/${id}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    apiIncreaseView();
  }, [router]);

  useEffect(() => {
    if (id) {
      const authData = getAuth();
      setAuth(authData);
      apiGetCourseContents();
      apiGetCourses();
      apiGetContentCompletes();
      apiGetuserCompleteCourses();
    }
  }, [id, router]);

  useEffect(() => {
    if (auth) {
      apiGetCourseContents();
    }
  }, [auth]);

  const [previewData, setPreviewData] = useState<any>();

  const {
    isOpen: isOpenPreviewModal,
    onOpen: onOpenPreviewModal,
    onClose: onClosePreviewModal,
  } = useDisclosure();

  const PreviewModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={isOpenPreviewModal}
        onClose={() => {
          setPreviewData(null);
          onClosePreviewModal();
        }}
      >
        <ModalContent>
          <ModalHeader>ดูตัวอย่างเนื้อหา</ModalHeader>
          <ModalBody>
            <div className="text-center flex-col flex gap-2.5">
              {previewData?.contents?.videoPath && (
                <video
                  autoPlay
                  controls
                  className="object-cover h-96 border dark:border-dark  rounded-large w-full"
                  src={`${apiEndpoint}/videos/${previewData?.contents?.videoPath}`}
                />
              )}

              <div className="relative">
                <Image
                  width={500}
                  height={500}
                  className="object-cover h-96 border dark:border-dark  rounded-large w-full"
                  src={
                    previewData?.contents?.imagePath
                      ? `${apiEndpoint}/images/${previewData.contents.imagePath}`
                      : "/images/no-image.jpg"
                  }
                  alt=""
                />

                <div className="absolute top-0 right-0 m-1 flex flex-wrap gap-2">
                  {previewData?.contents?.questionId && (
                    <div className="flex gap-2 text-white p-2 bg-clean-main rounded-large items-center">
                      <FileQuestion />
                      <span>มีชุดคำถาม</span>
                    </div>
                  )}

                  <div className="flex gap-1 text-white items-center shadow-medium p-2 bg-clean-main rounded-large">
                    <Eye size={20} />
                    <span>
                      {previewData?.contents?.countView.toLocaleString() ?? "-"}{" "}
                      ครั้ง
                    </span>
                  </div>

                  {previewData?.contents?.mainCategories?.title && (
                    <div className="flex gap-1 text-white items-center p-2 bg-clean-main shadow-medium rounded-large">
                      <Folder size={20} />
                      <span>
                        {truncateText(
                          previewData?.contents?.mainCategories?.title,
                          20
                        ) ?? "-"}
                      </span>
                    </div>
                  )}

                  {previewData?.contents?.subCategories?.title && (
                    <div className="flex gap-1 text-white items-center p-2 bg-clean-main shadow-medium rounded-large">
                      <Folder size={20} />
                      <span>
                        {truncateText(
                          previewData?.contents?.subCategories?.title,
                          20
                        ) ?? "-"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-lg">{previewData?.contents?.title}</span>
                <span className="opacity-80">
                  {previewData?.contents?.description}
                </span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              startContent={<CircleX />}
              variant="bordered"
              onClick={() => {
                onClosePreviewModal();
              }}
            >
              ปิดหน้าต่าง
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Layout>
      <NextSeo
        title={`${course?.title} - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {PreviewModal()}

      {isHasCourse && !isLoading && (
        <>
          {userCourse?.status === "complete" && (
            <ErrorNotification isSuccess>
              <p>
                ยินดีด้วยท่านได้สำเร็จการศึกษาบทเรียนนี้แล้ว
                ขณะนี้ท่านสามารถดาว์นโหลดใบประกาศนียบัตรได้ที่ปุ่มด่านล่าง
              </p>
            </ErrorNotification>
          )}

          {courseContent?.length === 0 && (
            <ErrorNotification isWarning>
              <p>ไม่มีเนื้อหาในบทเรียนนี้ ยังไม่สามารถลงทะเบียนเรียนได้</p>
            </ErrorNotification>
          )}

          {userCourse?.status === "unComplete" && (
            <ErrorNotification isError>
              <p>
                ท่านไม่ผ่านบทเรียนนี้ เนื่องด้วยเงื่อนไขต้องผ่านเนื้อหา{" "}
                {course?.avgPass}% ขึ้นไปจากทั้งหมด
                แต่ท่านสามารถลงทะเบียนเรียนใหม่อีกครั้งได้ที่ปุ่มด่านล่าง
              </p>
            </ErrorNotification>
          )}

          <div className="relative tracking-tight sm:shadow-medium border dark:border-dark  rounded-large">
            <Image
              src={`${
                course.imagePath
                  ? `${apiEndpoint}/images/${course?.imagePath}`
                  : "/images/no-image.jpg"
              }`}
              className="min-h-[400px] lg:h-[400px] w-full rounded-large dark:border-none object-cover"
              width={500}
              height={500}
              alt={""}
            />

            <div className="absolute w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between rounded-large">
              <div className="bg-gradient-to-b rounded-t-large from-black via-black/50 p-5 to-transparent">
                <div className="flex flex-wrap justify-between gap-5 mb-5">
                  <Link href={"/course"}>
                    <div className="flex space-x-2 items-center text-white">
                      <ChevronLeft />
                      <span>บทเรียนทั้งหมด</span>
                    </div>
                  </Link>
                </div>

                <h1 className="text-lg sm:text-xl xl:text-2xl text-white w-[80%] xl:w-[50%] font-bold">
                  {course?.title}
                </h1>
              </div>

              <div className="flex flex-col gap-2 sm:gap-5 p-5">
                <div className="flex flex-wrap gap-2 sm:gap-5 justify-between">
                  <div className="flex space-x-2 items-center">
                    <Avatar
                      src={`${
                        course?.users.imagePath
                          ? `${apiEndpoint}/images/${course?.users.imagePath}`
                          : `/images/no-image.jpg`
                      } `}
                    />

                    <p className="text-white">{course?.users?.name}</p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {course?.price !== 0 && (
                      <div
                        className={`flex text-white p-2 bg-clean-main shadow-medium rounded-large ${
                          !settings?.isCourseMustPaid && "line-through"
                        }`}
                      >
                        ฿ <span>{course?.price?.toLocaleString()} บาท</span>
                      </div>
                    )}

                    {userCourse && (
                      <div className="flex gap-2 p-2 bg-clean-main backdrop-blur-md rounded-large shadow-medium text-white">
                        <CircleCheck />
                        <span className="">ลงทะเบียนเรียนแล้ว</span>
                      </div>
                    )}

                    <div className="flex gap-1 text-white items-center p-2 bg-clean-main rounded-large">
                      <Eye size={20} />
                      <span>
                        {course?.countView?.toLocaleString() ?? "-"} ครั้ง
                      </span>
                    </div>

                    <div className="flex gap-2 text-white p-2 bg-clean-main shadow-medium rounded-large items-center w-fit">
                      <Infinity />
                      <span>สามารถเรียนได้ตลอดชีพ</span>
                    </div>

                    {order?.status == "complete" && (
                      <div className="flex gap-2 p-2 bg-main shadow-medium rounded-large text-white">
                        <CircleCheck />
                        <span className="">เป็นเจ้าของแล้ว</span>
                      </div>
                    )}

                    {(course?.price == 0 || !settings?.isCourseMustPaid) && (
                      <span className="p-2 bg-main rounded-large shadow-medium text-white">
                        เรียนฟรี
                      </span>
                    )}
                  </div>
                </div>

                {userCourses?.length > 0 && (
                  <Progress
                    value={userCourseCompleted.length}
                    color="default"
                    maxValue={userCourses.length}
                    showValueLabel={true}
                    className="w-full text-white"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-2 sm:gap-5 h-full">
            <div className="flex flex-col h-full space-y-2 w-full xl:w-[70%] order-2 xl:order-none">
              <span className="text-xl font-bold">
                ทั้งหมด{" "}
                {courseContent?.length !== 0 &&
                  `(${courseContent?.length} เนื้อหา)`}
              </span>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 ">
                {courseContent?.map((item: any, index: any) => {
                  const contentStatus = userContentComplete?.find(
                    (statusItem: any) =>
                      statusItem.userId === auth?.id &&
                      item.contentId == statusItem.contentId
                  );

                  return (
                    <div key={index}>
                      <div
                        onClick={() => {
                          if (!contentStatus) {
                            setPreviewData(item);
                            onOpenPreviewModal();
                          }
                        }}
                      >
                        <PostCard
                          key={item.id}
                          number={index + 1}
                          item={item?.contents}
                          linkprefix="post"
                          disableFromCourse={!contentStatus ? true : false}
                          fromCourse={`/post/${item.contentId}?course=${id}&courseLogId=${userCourse?.id}`}
                        />
                      </div>
                      {contentStatus?.status == "inProgress" && (
                        <Chip
                          variant="flat"
                          color="warning"
                          startContent={<Clock />}
                        >
                          กำลังรอดำเนินการ
                        </Chip>
                      )}

                      {contentStatus?.status == "complete" && (
                        <Chip
                          variant="flat"
                          color="success"
                          startContent={<CircleCheck />}
                        >
                          เรียนผ่านแล้ว
                        </Chip>
                      )}

                      {contentStatus?.status == "unComplete" && (
                        <Chip
                          variant="flat"
                          color="danger"
                          startContent={<CircleX />}
                        >
                          โปรดรอลงทะเบียนเรียนใหม่อีกครั้ง
                        </Chip>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-5 h-fit xl:w-[30%] xl:sticky xl:top-[64px]">
              <div className="flex flex-col space-y-2 border-b dark:border-dark  pb-2 rounded-b-large">
                <span className="text-xl font-bold">คำอธิบายบทเรียน</span>
                <span className="opacity-80">{course?.description || "-"}</span>
              </div>

              <div className="flex flex-col space-y-2 border-b dark:border-dark  pb-2 rounded-b-large">
                <span className="text-xl font-bold">เกี่ยวกับผู้สร้าง</span>
                <Avatar
                  src={`${apiEndpoint}/images/${course?.users?.imagePath}`}
                />

                <div className="flex flex-col gap-1">
                  <span>
                    {course?.users?.name} ({course?.users?.email})
                  </span>
                  <span className="opacity-80">
                    {course?.users?.shortDescription}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <span className="text-xl font-bold">สมาชิกในบทเรียน</span>

                {userCompletes?.length === 0 ? (
                  "-"
                ) : (
                  <AvatarGroup>
                    {userCompletes?.map((item: any, index: any) => {
                      return (
                        <Avatar
                          key={index}
                          src={`${
                            item?.users.imagePath
                              ? `${apiEndpoint}/images/${item?.users.imagePath}`
                              : `/images/no-image.jpg`
                          } `}
                        />
                      );
                    })}
                  </AvatarGroup>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2 justify-center">
            {auth && userCourse?.status === "complete" && (
              <Certification
                courseTitle={course?.title}
                user={userCourse?.users?.name}
                date={userCourse?.createdAt}
              />
            )}

            {userCourse?.status == "unComplete" && (
              <Button
                startContent={!isButtonLoading && <RefreshCcw />}
                isLoading={isButtonLoading}
                onClick={async () => {
                  if (getCookie("auth")) {
                    setIsButtonLoading(true);

                    if (
                      auth?.role !== "admin" &&
                      auth?.role !== "superAdmin" &&
                      courseContent?.length !== 0
                    ) {
                      const courseLogId = await apiCreateCourseStatus();

                      const contentIds = courseContent?.map(
                        (item: any) => item.contentId
                      );

                      const formatData = {
                        userId: auth.id,
                        isRetry: true,
                        courseLogId,
                        contentIds: contentIds,
                        lessionId: id,
                      };

                      try {
                        await axiosInstance.post(
                          `${apiEndpoint}/api/v1/content/log/autoSubscribe`,
                          formatData
                        );
                        router.reload();
                        setIsButtonLoading(false);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }
                }}
                className="bg-main text-white"
              >
                ลงทะเบียนเรียนบทเรียนใหม่อีกครั้ง
              </Button>
            )}

            {!auth && (
              <Button
                onClick={async () => {
                  dispatch(openLoginForm());
                }}
                startContent={<LogIn />}
                className="bg-main text-white"
              >
                ต้องเข้าสู่ระบบก่อน
              </Button>
            )}

            {auth &&
              !userCourse &&
              settings?.isCourseMustPaid &&
              courseContent?.length !== 0 &&
              order?.status !== "complete" &&
              course?.price !== 0 &&
              auth?.role == "user" && (
                <Button
                  onClick={async () => {
                    try {
                      const contentIds = courseContent?.map(
                        (item: any) => item.contentId
                      );

                      const { data } = await axiosInstance.post(
                        `${apiEndpoint}/api/v1/user/checkout/course`,
                        {
                          courseId: id,
                          course,
                          auth,
                          contentIds,
                        }
                      );

                      router.push(data.url);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  startContent={<ShoppingCartIcon />}
                  className="bg-main text-white"
                >
                  ซื้อบทเรียนนี้ในราคา {course?.price?.toLocaleString()} บาท
                </Button>
              )}

            {auth && auth?.role !== "user" && (
              <Button startContent={<CircleX />} className="bg-main text-white">
                คุณไม่มีสิทธิ์ลงทะเบียนเรียน
              </Button>
            )}

            {auth && auth?.status == "pending" && (
              <Button
                onClick={() => {
                  dispatch(openVerifyForm());
                }}
                startContent={<LockKeyhole />}
                className="bg-main text-white"
              >
                ต้องยืนยันอีเมลของคุณก่อน
              </Button>
            )}

            {auth &&
              auth?.status == "activate" &&
              (order?.status == "complete" ||
                course?.price == 0 ||
                !settings?.isCourseMustPaid) &&
              auth?.role == "user" &&
              courseContent?.length !== 0 &&
              !userCourse && (
                <Button
                  onClick={async () => {
                    const courseLogId = await apiCreateCourseStatus();

                    const contentIds = courseContent?.map(
                      (item: any) => item.contentId
                    );

                    const formatData = {
                      userId: auth.id,
                      courseLogId,
                      contentIds: contentIds,
                      lessionId: id,
                    };

                    try {
                      await axiosInstance.post(
                        `${apiEndpoint}/api/v1/content/log/autoSubscribe`,
                        formatData
                      );

                      router.reload();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  startContent={<CirclePlus />}
                  className="bg-main text-white"
                >
                  ลงทะเบียนเรียนบทเรียนนี้
                </Button>
              )}

            {auth && courseContent?.length == 0 && (
              <Button startContent={<CircleX />} className="bg-main text-white">
                บทเรียนยังไม่พร้อมให้ลงทะเบียน
              </Button>
            )}
          </div>
        </>
      )}

      {!isHasCourse && !isLoading && <NotFound />}

      {isLoading && (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Spinner />
        </div>
      )}
    </Layout>
  );
}
