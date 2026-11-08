import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "@/components/Layout";
import { getAuth, axiosInstance, apiEndpoint, truncateText } from "@/helpers";
import {
  ChevronLeft,
  CircleCheck,
  CircleChevronLeft,
  Eye,
  Folder,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Radio,
  RadioGroup,
  ScrollShadow,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";
import { NextSeo } from "next-seo";
import ErrorNotification from "@/components/ErrorNotification";
import Comment from "@/components/Comment";
import NotFound from "@/components/NotFound";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";

export default function Posts() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const { id, course, courseLogId, currentScrollbar } = router.query;
  const [post, setPost] = useState<any>(null);
  const [isHasPost, setIsHasPost] = useState(true);
  const [videos, setVideos] = useState<any>([]);
  const [userCompletes, setUserCompletes] = useState<any>([]);
  const [auth, setAuth] = useState<any>(null);
  const [questionHead, setQuestionHead] = useState<any>(null);
  const [questionContent, setQuestionContent] = useState<any>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<any>([]);
  const [isNotPass, setIsNotPass] = useState(false);
  const [isPass, setIsPass] = useState(false);
  const [user, setUser] = useState<any>();
  const [isSendQuestions, setIsSendQuestions] = useState(false);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [correctQuestionTotal, setCorrectQuestionTotal] = useState(0);
  const [inCorrectQuestionTotal, setInCorrectQuestionTotal] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [isQuestion, setIsQuestion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [contents, setContents] = useState<any>();

  const apiGetContents = async (page?: any) => {
    if (!id) return;

    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/relatedContent/${post?.mainCategoryId}?contentId=${id}`
      );

      setContents(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    apiGetContents();
  }, [post, id]);

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
    setIsQuestion(
      auth &&
        questionHead &&
        auth?.role !== "admin" &&
        auth?.role !== "superAdmin" &&
        user?.status == "inProgress" &&
        user?.questionStatus !== "break" &&
        user?.questionStatus !== "complete" &&
        !post?.isNotCourse &&
        course
    );
  }, [auth, questionHead, user, post]);

  const handleSubmitAnswers = async () => {
    setIsButtonLoading(true);

    try {
      if (!isSendQuestions) {
        const newData = {
          courseLogId,
          contentId: id,
          questionStatus: user.questionStatus,
          questionId: questionHead.id,
          userId: auth?.id,
          answer: selectedAnswers.sort(
            (a: any, b: any) => a.questionContentId - b.questionContentId
          ),
        };

        const { data } = await axiosInstance.post(
          `${apiEndpoint}/api/v1/question/item/verify`,
          newData
        );

        if (user?.questionStatus === "beforeLearning") {
          const newQuestionData = questionContent?.map(
            (item: any, index: any) => {
              return {
                ...item,
                isCorrect: data[index].isCorrect,
                correctAns: data[index].correctAns,
              };
            }
          );

          const filterCorrectQuestionTotal = data?.filter(
            (item: any) => item.isCorrect == true
          );

          setCorrectQuestionTotal(filterCorrectQuestionTotal.length);
          setInCorrectQuestionTotal(
            Math.abs(data.length - filterCorrectQuestionTotal.length)
          );
          setQuestionTotal(data?.length);
          setScoreTotal(
            filterCorrectQuestionTotal.length * questionHead.scorePerChoice
          );

          await apiUpdateUserContentStatus("break");
          setQuestionContent(newQuestionData);
          setIsSendQuestions(true);
        } else {
          if (data.isPass) {
            const newQuestionData = questionContent?.map(
              (item: any, index: any) => {
                return {
                  ...item,
                  isCorrect: data.resultCheckAnswers[index].isCorrect,
                  correctAns: data.resultCheckAnswers[index].correctAns,
                };
              }
            );

            const filterCorrectQuestionTotal = data?.resultCheckAnswers?.filter(
              (item: any) => item.isCorrect == true
            );

            setCorrectQuestionTotal(filterCorrectQuestionTotal.length);
            setInCorrectQuestionTotal(
              Math.abs(
                data?.resultCheckAnswers?.length -
                  filterCorrectQuestionTotal.length
              ) || 0
            );
            setQuestionTotal(data?.resultCheckAnswers?.length);
            setScoreTotal(
              filterCorrectQuestionTotal.length * questionHead.scorePerChoice
            );

            setIsSendQuestions(true);
            await apiUpdateUserContentStatus("complete", "complete");

            setQuestionContent(newQuestionData);
            setIsPass(true);

            // setTimeout(() => {
            //   router.reload();
            // }, 5000);
          } else {
            const newQuestionData = questionContent?.map(
              (item: any, index: any) => {
                return {
                  ...item,
                  isCorrect: data.resultCheckAnswers[index].isCorrect,
                  correctAns: data.resultCheckAnswers[index].correctAns,
                };
              }
            );

            const filterCorrectQuestionTotal = data?.resultCheckAnswers?.filter(
              (item: any) => item?.isCorrect == true
            );

            setCorrectQuestionTotal(filterCorrectQuestionTotal.length);
            setInCorrectQuestionTotal(
              Math.abs(
                data?.resultCheckAnswers?.length -
                  filterCorrectQuestionTotal.length
              ) || 0
            );
            setScoreTotal(
              filterCorrectQuestionTotal.length * questionHead.scorePerChoice
            );
            setQuestionTotal(data?.resultCheckAnswers?.length);
            setIsSendQuestions(true);
            setQuestionContent(newQuestionData);
            setIsNotPass(true);

            await apiUpdateUserContentStatus("complete", "unComplete");
            // setTimeout(() => {
            //   router.reload();
            // }, 3000);
          }
        }
      }
    } catch (error) {
      setIsButtonLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          if (!isSendQuestions) handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSendQuestions]);

  const apiIncreaseView = async () => {
    try {
      await axiosInstance.put(
        `${apiEndpoint}/api/v1/content/view/increase/${id}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleAnswerChange = (questionContentId: string, answer: string) => {
    setSelectedAnswers((prev: any) => {
      const existingAnswerIndex = prev.findIndex(
        (a: any) => a.questionContentId === questionContentId
      );

      if (existingAnswerIndex !== -1) {
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex].answer = answer;
        return updatedAnswers;
      }

      return [
        ...prev,
        {
          questionContentId,
          answer,
          questionStatus: user.questionStatus,
        },
      ];
    });
  };

  const apiUpdateUserContentStatus = async (
    questionStatus: any,
    contentStatus?: any
  ) => {
    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/content/log/${user.id}`,
        {
          ...user,
          questionStatus,
          status: contentStatus ? contentStatus : user.status,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetUserContentStatus = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/log/byUserId/${
          auth?.id
        }/byContentId/${id}/byCourseId/${
          course || "-"
        }/byCourseLogId/${courseLogId}`
      );

      setUser({
        ...data,
        videoStatus: JSON.parse(data?.videoStatus),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetQuestions = async (questionId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question/${questionId}`
      );

      setQuestionHead(data);
    } catch (error) {
      console.error(error);
    }
  };

  const apiGetQuestionContents = async (questionId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question/item/${questionId}`
      );

      const parsedData = data.map((item: any) => ({
        ...item,
        choices: JSON.parse(item.choices),
      }));

      setQuestionContent(parsedData);
    } catch (error) {
      console.error(error);
    }
  };

  const apiGetContent = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/${id}`
      );

      await apiGetQuestions(data.questionId);
      await apiGetQuestionContents(data.questionId);
      setPost(data);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsHasPost(false);
      console.error(error);
    }
  };

  useEffect(() => {
    const checkHasPost = () => {
      if (!post) return;

      if (!post.isCourse) {
        return setIsHasPost(true);
      }

      if (post.isCourse && courseLogId != "undefined") {
        setIsHasPost(true);
      } else {
        setIsHasPost(false);
      }
    };

    checkHasPost();
  }, [post, router, courseLogId]);

  const apiCheckVideo = async (videoPath: string) => {
    try {
      const response = await axiosInstance.head(
        `${apiEndpoint}/videos/${videoPath}`
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const apiGetContentVideos = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/video/${id}`
      );

      const availableVideos = [];
      for (const video of data) {
        const isAvailable = await apiCheckVideo(video.videoPath);
        if (isAvailable) {
          availableVideos.push(video);
        }
      }

      setVideos(availableVideos);
    } catch (error) {
      console.error(error);
    }
  };

  const apiGetContentCompletes = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/log/byContentId/${id}`
      );

      setUserCompletes(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      setAuth(getAuth());
      apiGetContent();
      apiGetContentVideos();
      apiGetContentCompletes();
    }
  }, [id, router]);

  useEffect(() => {
    apiIncreaseView();
  }, [router]);

  useEffect(() => {
    if (auth) {
      apiGetUserContentStatus();
    }
  }, [auth]);

  const QuestionRender = useCallback(() => {
    return (
      <ScrollShadow className="max-h-96 space-y-2 overflow-hidden hover:overflow-y-auto">
        {questionContent?.map((item: any, index: any) => (
          <Card
            shadow="none"
            key={index}
            className="flex flex-col space-y-2 p-5 border-b dark:border-dark"
          >
            <RadioGroup
              onChange={(e) => {
                handleAnswerChange(item.id, e.target.value);
              }}
              label={
                <>
                  {`${index + 1}. ${item.question} `}
                  {item.correctAns && (
                    <span className="text-red-500">
                      {`** คำตอบที่ถูกต้องคือ ${item.correctAns} **`}
                    </span>
                  )}
                </>
              }
            >
              {item?.choices?.map((choice: any, idx: any) => (
                <Radio key={idx} value={choice}>
                  {choice}
                </Radio>
              ))}
            </RadioGroup>
          </Card>
        ))}
      </ScrollShadow>
    );
  }, [questionContent]);

  return (
    <Layout>
      <NextSeo
        title={`${post?.title} - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {isHasPost && !isLoading && (
        <>
          <div className="relative tracking-tight w-full sm:shadow-medium border dark:border-dark  rounded-large">
            <Image
              src={`${
                post?.imagePath
                  ? `${apiEndpoint}/images/${post?.imagePath}`
                  : "/images/no-image.jpg"
              }`}
              className="min-h-[400px] lg:h-[400px] w-full rounded-large dark:border-none object-cover"
              width={500}
              height={500}
              alt={""}
            />

            <div className="absolute w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between rounded-large">
              <div className="bg-gradient-to-b rounded-t-large from-black via-black/50 p-5 to-transparent">
                <div className="flex flex-wrap justify-between gap-5">
                  <Link
                    href={
                      course
                        ? `/course/${course}?currentScrollbar=${currentScrollbar}`
                        : "/content"
                    }
                  >
                    <div className="flex space-x-2 items-center text-white">
                      <ChevronLeft />
                      <span>
                        {course ? "กลับไปที่บทเรียน" : "บทความทั้งหมด"}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-wrap gap-1">
                    <div className="flex gap-1 text-white items-center p-2 backdrop-blur-md border border-[#2626265c] bg-clean-main rounded-large">
                      <Eye size={20} />
                      <span>
                        {post?.countView?.toLocaleString() ?? "-"} ครั้ง
                      </span>
                    </div>

                    {post?.mainCategories?.title && (
                      <div className="flex gap-1 text-white items-center p-2 backdrop-blur-md bg-clean-main shadow-medium rounded-large">
                        <Folder size={20} />
                        <span>
                          {truncateText(post?.mainCategories?.title, 20) ?? "-"}
                        </span>
                      </div>
                    )}

                    {post?.subCategories?.title && (
                      <div className="flex gap-1 text-white items-center p-2 backdrop-blur-md bg-clean-main shadow-medium rounded-large">
                        <Folder size={20} />
                        <span>
                          {truncateText(post?.subCategories?.title, 20) ?? "-"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="text-lg sm:text-xl xl:text-2xl text-white w-[80%] xl:w-[50%] font-bold">
                  {post?.title}
                </h1>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-5 p-5">
                <div className="flex space-x-2 items-center">
                  <Avatar
                    src={`${
                      post?.users.imagePath
                        ? `${apiEndpoint}/images/${post?.users.imagePath}`
                        : `/images/no-image.jpg`
                    } `}
                  />
                  <p className="text-white">{post?.users?.name}</p>
                </div>
                <AvatarGroup>
                  {userCompletes?.map((item: any, index: any) => {
                    return (
                      <Avatar
                        key={index}
                        src={`${
                          item.users.imagePath
                            ? `${apiEndpoint}/images/${item.users.imagePath}`
                            : `/images/no-image.jpg`
                        } `}
                      />
                    );
                  })}
                </AvatarGroup>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 sm:gap-5  justify-center">
            {user?.status === "complete" && course && (
              <ErrorNotification isSuccess>
                <p>
                  ยินดีด้วยท่านได้เรียนเนื้อหานี้ผ่านแล้ว
                  ขณะนี้สามารถกลับไปที่บทเรียนเดิมและเรียนเนื้อหาต่อไปได้แล้ว
                </p>
              </ErrorNotification>
            )}

            {/* {auth && user?.status && user?.status !== "inProgress" && (
              <div className="flex justify-center">
                <Button
                  
                  onClick={() => {
                    router.push(
                      `/course/${course}?currentScrollbar=${currentScrollbar}`
                    );
                  }}
                  className="bg-main text-white"
                  startContent={<CircleChevronLeft />}
                >
                  กลับไปที่บทเรียน
                </Button>
              </div>
            )} */}

            {user?.status === "unComplete" && course && (
              <ErrorNotification isError>
                <p>
                  ท่านไม่ผ่านบทความนี้
                  แต่ยังสามารถเรียนซ้ำได้จาการลงทะเบียนเริ่มเรียนบทเรียนที่เกี่ยวข้องกับเนื้อหานี้ได้ใหม่อีกครั้ง
                </p>
              </ErrorNotification>
            )}

            {!questionHead &&
              user &&
              !post?.isNotCourse &&
              user?.status !== "complete" && (
                <ErrorNotification isWarning>
                  <p>
                    บทความนี้ไม่มีข้อสอบ
                    หรือเจ้าหน้าที่ยังไม่ได้เพิ่มชุดข้อสอบเข้าในบทความ
                  </p>
                </ErrorNotification>
              )}

            {isPass && (
              <ErrorNotification isSuccess>
                <p>
                  ยินดีด้วยคุณทำคะแนนได้ผ่านเกณฑ์
                  ตรวจสอบคะแนนของคุณและกดที่ปุ่มด้านล่างเพื่อดำเนินการต่อ..
                </p>
              </ErrorNotification>
            )}

            {isNotPass && (
              <ErrorNotification isError>
                <p>
                  เสียใจด้วยครับ คุณทำข้อสอบยังไม่ผ่าน{" "}
                  {questionHead.scoreAvgPass} % เกณฑ์ที่ระบบกำหนด
                  โปรดลองทำข้อสอบใหม่อีกครั้งครับ
                </p>
              </ErrorNotification>
            )}

            {videos?.length == 0 &&
              !isQuestion &&
              user &&
              course &&
              user?.questionStatus !== "complete" &&
              auth &&
              auth?.role !== "admin" &&
              auth?.role !== "superAdmin" && (
                <ErrorNotification isWarning>
                  <p>
                    บทความนี้ไม่มีเนื้อหาวิดีโอให้รับชมเพื่อผ่านบทความ
                    แต่ท่านยังสามารถข้ามบทความนี้ได้ด้วยปุ่มยืนยันการเรียนด้านล่าง
                  </p>
                </ErrorNotification>
              )}

            {isQuestion && (
              <>
                {isSendQuestions ? (
                  <ErrorNotification isWarning>
                    คะแนนของคุณ {scoreTotal} คะแนน, จำนวนข้อที่ตอบถูก{" "}
                    {correctQuestionTotal}/{questionTotal} จากทั้งหมด
                    {/* {correctQuestionTotal} ข้อ, จำนวนข้อที่ตอบผิด{" "}
                    {inCorrectQuestionTotal} ข้อ */}
                  </ErrorNotification>
                ) : (
                  <>
                    {user?.questionStatus == "beforeLearning" && (
                      <>
                        {/* <ErrorNotification isWarning>
                          <p>
                            ขณะนี้เป็นการทดสอบความรู้ก่อนเข้าเรียน
                            ท่านไม่ต้องกังวลใดๆ
                            นี่เป็นเพียงการทดสอบความรู้เบื้องต้นเท่านั้น,
                            โปรดจำคำตอบที่ถูกต้อง
                            ระบบจะให้ท่านทำข้อสอบอีกครั้งหลังจากเรียนเสร็จเพื่อผ่านบทความ
                          </p>
                        </ErrorNotification> */}

                        <Header label="ข้อสอบก่อนเรียน" />

                        {/* <ErrorNotification isWarning>
                          <span>ชื่อข้อสอบ : {questionHead?.description},</span>
                          <span>
                            คำถามทั้งหมด : {questionContent.length} ข้อ,
                          </span>
                          <span>
                            เกณฑ์คะแนนให้ผ่าน : {questionHead?.scoreAvgPass}%
                          </span>
                        </ErrorNotification> */}
                      </>
                    )}

                    {user?.questionStatus == "afterLearning" && (
                      <Header label="ข้อสอบหลังเรียน" />

                      // <ErrorNotification isWarning>
                      //   <p>
                      //     ขณะนี้เป็นการทดสอบหลังเรียน
                      //     และท่านต้องทำคะแนนให้ผ่านเกณฑ์ที่ระบบกำหนดถึงจะผ่านบทเรียนนี้ไปได้
                      //     แต่อย่ากังวลใจไปคุณสามารถทำข้อสอบนี้ซ้ำได้อีกครั้งจนกว่าคุณจะผ่าน
                      //   </p>
                      // </ErrorNotification>
                    )}
                  </>
                )}

                <Card className="p-10 space-y-2 w-full">
                  <div className="text-lg font-bold">
                    เหลือเวลา {Math.floor(countdown / 60)}:
                    {String(countdown % 60).padStart(2, "0")}
                  </div>

                  {QuestionRender()}

                  <div className="flex space-x-2 justify-end w-full">
                    {!isSendQuestions && (
                      <>
                        <Button
                          startContent={<CircleChevronLeft />}
                          onClick={() => {
                            router.push(
                              `/course/${course}?currentScrollbar=${currentScrollbar}`
                            );
                          }}
                        >
                          ย้อนกลับ
                        </Button>

                        {selectedAnswers.length === questionContent.length && (
                          <Button
                            className="bg-main text-white"
                            isLoading={isButtonLoading}
                            startContent={!isButtonLoading && <CircleCheck />}
                            onClick={() => {
                              !isSendQuestions && handleSubmitAnswers();
                            }}
                          >
                            ส่งคำตอบ
                          </Button>
                        )}
                      </>
                    )}

                    {isSendQuestions && (
                      <Button
                        startContent={<CircleCheck />}
                        className="bg-main text-white"
                        onClick={async () => {
                          router.reload();
                        }}
                      >
                        รับทราบคะแนน
                      </Button>
                    )}
                  </div>
                </Card>
              </>
            )}

            {!isQuestion && (
              <div className="flex h-full w-full xl:flex-row flex-col gap-3.5 sm:gap-5">
                <div
                  className={`${
                    course && courseLogId
                      ? "w-full"
                      : "xl:w-[70%] xl:sticky xl:top-[64px]"
                  } h-fit flex flex-col gap-3.5 sm:gap-5`}
                >
                  {post?.htmlContent && (
                    <Card className="p-5">
                      <div
                        dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                      ></div>
                    </Card>
                  )}

                  {videos && videos?.length > 0 && (
                    <VideoPlayer
                      videos={videos}
                      questionHead={questionHead}
                      isNotCourse={post?.isNotCourse}
                      user={user}
                      course={course}
                      setUser={setUser}
                    />
                  )}

                  {videos?.length === 0 &&
                    user &&
                    !post?.isNotCourse &&
                    course &&
                    user?.questionStatus !== "complete" &&
                    auth?.role !== "admin" &&
                    auth?.role !== "superAdmin" &&
                    auth && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            router.push(
                              `/course/${course}?currentScrollbar=${currentScrollbar}`
                            );
                          }}
                          startContent={<CircleChevronLeft />}
                        >
                          ย้อนกลับ
                        </Button>
                        <Button
                          onClick={async () => {
                            await apiUpdateUserContentStatus(
                              questionHead ? "afterLearning" : "complete",
                              !questionHead ? "complete" : "inProgress"
                            );
                            router.reload();
                          }}
                          className="bg-main text-white"
                          startContent={<CircleCheck />}
                        >
                          ยืนยันว่าฉันอ่านเนื้อหานี้แล้ว
                        </Button>
                      </div>
                    )}

                  {!post?.isNotCourse &&
                    user?.questionStatus == "afterLearning" && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            router.push(
                              `/course/${course}?currentScrollbar=${currentScrollbar}`
                            );
                          }}
                          startContent={<CircleChevronLeft />}
                        >
                          ย้อนกลับ
                        </Button>
                        <Button
                          onClick={async () => {
                            await apiUpdateUserContentStatus(
                              "complete",
                              "complete"
                            );
                            router.reload();
                          }}
                          className="bg-main text-white"
                          startContent={<CircleCheck />}
                        >
                          ยืนยันว่าฉันอ่านเนื้อหานี้แล้ว
                        </Button>
                      </div>
                    )}

                  {post?.isNotCourse && user?.status === "inProgress" && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          router.push(
                            `/course/${course}?currentScrollbar=${currentScrollbar}`
                          );
                        }}
                        startContent={<CircleChevronLeft />}
                      >
                        ย้อนกลับ
                      </Button>
                      <Button
                        onClick={async () => {
                          await apiUpdateUserContentStatus(
                            "complete",
                            "complete"
                          );
                          router.reload();
                        }}
                        className="bg-main text-white"
                        startContent={<CircleCheck />}
                      >
                        ยืนยันว่าฉันอ่านเนื้อหานี้แล้ว
                      </Button>
                    </div>
                  )}

                  <Comment auth={auth} contentId={id} router={router} />
                </div>

                {!course && contents?.length === 0 && (
                  <div className="xl:w-[30%] flex flex-col gap-2 h-fit xl:sticky xl:top-[64px]">
                    <Header label={"เนื้อหาที่เกี่ยวข้อง"}></Header>
                    <ErrorNotification isWarning>
                      ไม่มีเนื้อหาที่เกี่ยวข้องกับบทความนี้
                    </ErrorNotification>
                  </div>
                )}

                {!course && contents?.length !== 0 && (
                  <div className="xl:w-[30%] flex flex-col gap-2 h-fit xl:sticky xl:top-[64px]">
                    {!course && contents?.length !== 0 && (
                      <>
                        <Header label={"เนื้อหาที่เกี่ยวข้อง"}></Header>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                          {contents?.map((item: any, index: number) => {
                            return (
                              <PostCard
                                key={index}
                                item={item}
                                number={index + 1}
                                linkprefix={"post"}
                              />
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!isHasPost && !isLoading && <NotFound />}

      {isLoading && (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center">
          <Spinner />
        </div>
      )}
    </Layout>
  );
}
