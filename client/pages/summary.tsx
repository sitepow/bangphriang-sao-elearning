import Header from "@/components/Header";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import SumCard from "@/components/SumCard";
import {
  apiEndpoint,
  axiosInstance,
  convertTimestamp,
  getAuth,
} from "@/helpers";
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { GraduationCap, Ellipsis, CircleCheck, CircleX } from "lucide-react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Summary() {
  const [courseInprogress, setCourseInprogress] = useState<any>([]);
  const [courseUncomplete, setCourseUncomplete] = useState<any>([]);
  const [courseCompletes, setCourseCompletes] = useState<any>([]);
  const [settings, setSettings] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [previewQuestionHistory, setPreviewQuestionHistory] = useState<any>();
  const router = useRouter();
  const [contentSummary, setContentSummary] = useState<any>();

  const apiGetContentSummary = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/user/getContentSummary/${auth?.id}?page=${
          page || 1
        }`
      );

      setContentSummary(data);
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
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (auth) {
      apiGetContentSummary();
    }
  }, [auth, router]);

  const apiGetCourseUnComplete = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/log/byStatus/${
          auth?.id
        }?status=unComplete&page=${page || 1}`
      );

      setCourseUncomplete(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetCourseInprogress = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/log/byStatus/${
          auth?.id
        }?status=inProgress&page=${page || 1}`
      );

      setCourseInprogress(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetCourseComplete = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/log/byStatus/${
          auth?.id
        }?status=complete&page=${page || 1}`
      );

      setCourseCompletes(data);
    } catch (error) {
      console.log(error);
    }
  };

  const filterData = (data: any) => {
    const inProgressIds = Array.isArray(courseInprogress?.data)
      ? courseInprogress.data.map((item: any) => item.lessionId)
      : [];
    const completeIds = Array.isArray(courseCompletes?.data)
      ? courseCompletes.data.map((item: any) => item.lessionId)
      : [];

    const uniqueLessions = new Set();
    return data?.filter((course: any) => {
      if (
        !uniqueLessions.has(course.lessionId) &&
        !inProgressIds.includes(course.lessionId) &&
        !completeIds.includes(course.lessionId)
      ) {
        uniqueLessions.add(course.lessionId);
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    if (!getCookie("auth")) {
      router.push("/");
    }

    if (auth) {
      if (auth?.role !== "user") {
        router.push("/");
      }
    }
  }, [auth]);

  useEffect(() => {
    if (auth) {
      apiGetCourseInprogress();
      apiGetCourseComplete();
      apiGetCourseUnComplete();
    }
  }, [auth]);

  const {
    isOpen: isOpenQuestionHistoryModal,
    onOpen: onOpenQuestionHistoryModal,
    onClose: onCloseQuestionHistoryModal,
  } = useDisclosure();

  const QuestionHistoryModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenQuestionHistoryModal}
        onClose={() => {
          onCloseQuestionHistoryModal();
        }}
      >
        <ModalContent>
          <ModalHeader>ประวัติการตอบคำถาม</ModalHeader>
          <ModalBody>
            {previewQuestionHistory?.length !== 0 && (
              <ScrollShadow className="max-h-[400px] space-y-2 overflow-hidden hover:overflow-y-auto">
                {previewQuestionHistory?.map((item: any, index: any) => {
                  return (
                    <Card
                      key={index}
                      shadow="none"
                      className={`border dark:border-dark  p-5 border-l-4 ${
                        item?.isCorrect
                          ? "border-l-green-600 dark:border-l-green-600"
                          : "border-l-red-600 dark:border-l-red-600"
                      } `}
                    >
                      <span>
                        {item?.questionItems?.question} (
                        {item?.questionStatus == "beforeLearning"
                          ? "ก่อนเรียน"
                          : "หลังเรียน"}
                        {item?.isCorrect &&
                          ` + ${item?.questions.scorePerChoice} คะแนน`}
                        )
                      </span>

                      {item?.isCorrect && (
                        <Chip
                          startContent={<CircleCheck />}
                          color="success"
                          variant="flat"
                        >
                          {item?.selectChoice}
                        </Chip>
                      )}

                      {!item?.isCorrect && (
                        <div className="flex gap-2 flex-col flex-wrap">
                          <Chip
                            startContent={<CircleX />}
                            color="danger"
                            variant="flat"
                          >
                            {item?.selectChoice}
                          </Chip>

                          <Chip
                            startContent={<CircleCheck />}
                            color="success"
                            variant="flat"
                          >
                            {item?.questionItems?.correctAns}
                          </Chip>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </ScrollShadow>
            )}

            {previewQuestionHistory?.length == 0 && (
              <span className="text-center text-red-600">
                ** ยังไม่มีประวัติการตอบคำถาม **
              </span>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Layout>
      <NextSeo
        title={`สรุปภาพรวมของการเรียน - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {QuestionHistoryModal()}

      <Header label={"สรุปภาพรวมของการเรียน"} />
      {auth && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5 ">
          {/* <SumCard
            label={"คะแนนก่อนเรียนทั้งหมด"}
            value={scores?.beforeLearningScore}
            icon={RotateCcw}
            suffix={"คะแนน"}
          />
          <SumCard
            label={"คะแนนหลังเรียนทั้งหมด"}
            value={scores?.afterLearningScore}
            icon={RotateCw}
            suffix={"คะแนน"}
          /> */}
          <SumCard
            label={"บทเรียนที่ฉันกำลังเรียน"}
            value={courseInprogress?.data?.length}
            icon={GraduationCap}
            suffix={"รายการ"}
          />
          <SumCard
            label={"บทเรียนที่ฉันเรียนผ่านแล้ว"}
            value={courseCompletes?.data?.length}
            icon={GraduationCap}
            suffix={"รายการ"}
          />
        </div>
      )}

      <Table aria-label="table-summary-score">
        <TableHeader>
          <TableColumn>รูปภาพเนื้อหา</TableColumn>
          <TableColumn>ชื่อเนื้อหา</TableColumn>
          <TableColumn>จากบทเรียน</TableColumn>
          <TableColumn>วันที่เข้าเรียน</TableColumn>
          <TableColumn>คะแนน ก่อนเรียน/หลังเรียน</TableColumn>
          <TableColumn>สถานะเนื้อหา</TableColumn>
          <TableColumn>สถานะบทเรียน</TableColumn>
          <TableColumn>การจัดการ</TableColumn>
        </TableHeader>
        <TableBody>
          {contentSummary?.data?.map((item: any) => {
            return (
              <TableRow key="1">
                <TableCell>
                  <AvatarGroup>
                    <Avatar
                      src={
                        item.contents?.imagePath
                          ? `${apiEndpoint}/images/${item.contents?.imagePath}`
                          : "/images/no-image.jpg"
                      }
                      alt="content-image"
                    />

                    <Avatar
                      src={
                        item.lessions?.imagePath
                          ? `${apiEndpoint}/images/${item.lessions?.imagePath}`
                          : "/images/no-image.jpg"
                      }
                      alt="content-image"
                    />
                  </AvatarGroup>
                </TableCell>
                <TableCell className="min-w-52 xl:min-w-40">
                  {item?.contents?.title}
                </TableCell>
                <TableCell className="min-w-52 xl:min-w-40">
                  {item?.lessions?.title}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {convertTimestamp(item?.createdAt)}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32 text-center">
                  {item?.beforeLearningScore}/{item?.afterLearningScore}
                </TableCell>
                <TableCell>
                  {item?.status == "inProgress" ? (
                    <Chip color="warning" variant="flat">
                      กำลังรอดำเนินการ
                    </Chip>
                  ) : item?.status == "complete" ? (
                    <Chip color="success" variant="flat">
                      เรียนผ่านแล้ว
                    </Chip>
                  ) : (
                    <Chip color="danger" variant="flat">
                      เรียนไม่ผ่าน
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  {item?.courseLogs?.status == "inProgress" ? (
                    <Chip color="warning" variant="flat">
                      กำลังรอดำเนินการ
                    </Chip>
                  ) : item?.courseLogs?.status == "complete" ? (
                    <Chip color="success" variant="flat">
                      เรียนผ่านแล้ว
                    </Chip>
                  ) : (
                    <Chip color="danger" variant="flat">
                      เรียนไม่ผ่าน
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <Ellipsis />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        onClick={() => {
                          onOpenQuestionHistoryModal();
                          setPreviewQuestionHistory(item?.questions);
                        }}
                      >
                        ดูประวัติการตอบคำถาม
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        <Pagination
          showControls
          total={contentSummary?.allPages}
          initialPage={1}
          onChange={async (e) => {
            await apiGetContentSummary(e);
          }}
        />
      </div>

      <div className="group flex flex-col gap-2 sm:gap-5 ">
        {courseInprogress?.data?.length > 0 && (
          <>
            <Header label={"บทเรียนของฉันที่กำลังเรียน"} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full ">
              {courseInprogress?.data?.map((item: any, index: number) => {
                return (
                  <PostCard
                    settings={settings}
                    key={index}
                    item={item.lessions}
                    linkprefix="course"
                    isCourse
                  />
                );
              })}
            </div>

            <div className="flex justify-center">
              <Pagination
                classNames={{ item: "text-white" }}
                showControls
                total={courseInprogress?.allPages}
                initialPage={1}
                onChange={async (e) => {
                  await apiGetCourseInprogress(e);
                }}
              />
            </div>
          </>
        )}

        {filterData(courseUncomplete?.data)?.length > 0 && (
          <>
            <Header label={"บทเรียนที่ฉันเรียนไม่ผ่าน"} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full ">
              {filterData(courseUncomplete?.data)?.map(
                (item: any, index: number) => {
                  return (
                    <PostCard
                      settings={settings}
                      key={index}
                      item={item.lessions}
                      linkprefix="course"
                      isCourse
                    />
                  );
                }
              )}
            </div>

            <div className="flex justify-center">
              <Pagination
                classNames={{ item: "text-white" }}
                showControls
                total={courseUncomplete?.allPages}
                initialPage={1}
                onChange={async (e) => {
                  await apiGetCourseUnComplete(e);
                }}
              />
            </div>
          </>
        )}

        {courseCompletes?.data?.length > 0 && (
          <>
            <Header label={"บทเรียนของฉันที่เรียนผ่านแล้ว"} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-5 w-full ">
              {courseCompletes?.data?.map((item: any, index: number) => {
                return (
                  <PostCard
                    settings={settings}
                    key={index}
                    item={item.lessions}
                    linkprefix="course"
                    isCourse
                  />
                );
              })}
            </div>

            <div className="flex justify-center">
              <Pagination
                classNames={{ item: "text-white" }}
                showControls
                total={courseCompletes?.allPages}
                initialPage={1}
                onChange={async (e) => {
                  await apiGetCourseComplete(e);
                }}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
