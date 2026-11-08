import { apiEndpoint, axiosInstance, convertDateToThai } from "@/helpers";
import { errorRequire } from "@/helpers/regex";
import { openLoginForm, openVerifyForm } from "@/store/modalSlice";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  ScrollShadow,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { CircleX, LogIn, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import Header from "./Header";

export default function Comment({ auth, contentId, router }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const dispatch = useDispatch();

  const {
    register: registerMainForm,
    handleSubmit: handleSubmitMainForm,
    reset: resetMainForm,
  } = useForm();

  const { register: registerReplyForm, handleSubmit: handleSubmitReplyForm } =
    useForm();

  const apiGetComments = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/comment/${contentId}`
      );

      setComments(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentSubmit = async (data: any) => {
    const comment = {
      contentId,
      postMessage: data.message,
      postByUserId: auth?.id,
    };

    try {
      await axiosInstance.post(`${apiEndpoint}/api/v1/comment`, comment);
      resetMainForm();
      apiGetComments();
    } catch (error) {
      console.log(error);
    }
  };

  const handleReplySubmit = async (data: any, commentId: number) => {
    const reply = {
      replyMessage: data.replyMessage,
      replyByAdminId: auth?.id,
    };

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/comment/${commentId}`,
        reply
      );
      resetMainForm();
      apiGetComments();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    apiGetComments();
  }, [router]);

  return (
    <>
      <Header
        label={`ความคิดเห็น ${
          comments?.length !== 0 ? `( ${comments?.length} รายการ )` : ""
        }`}
      ></Header>

      <div className="flex flex-col gap-2">
        <Card shadow="sm" className="w-full p-3 h-fit">
          {/* <CardHeader>
          <span className="font-bold">ความคิดเห็น</span>
        </CardHeader> */}
          <CardBody>
            <form
              className="space-y-2"
              onSubmit={handleSubmitMainForm(handleCommentSubmit)}
            >
              <Textarea
                size="sm"
                variant="bordered"
                {...registerMainForm("message", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                placeholder="พิมพ์สิ่งที่กำลังสงสัย..."
              />

              <div className="w-full flex justify-end">
                {!auth && (
                  <Button
                    startContent={<LogIn />}
                    onClick={() => {
                      dispatch(openLoginForm());
                    }}
                    className="bg-main text-white"
                  >
                    ต้องเข้าสู่ระบบก่อน
                  </Button>
                )}

                {auth && auth?.status == "pending" && (
                  <Button
                    startContent={<LogIn />}
                    onClick={() => {
                      dispatch(openVerifyForm());
                    }}
                    className="bg-main text-white"
                  >
                    ต้องยืนยันอีเมลก่อน
                  </Button>
                )}

                {auth &&
                  auth?.role !== "admin" &&
                  auth?.status == "activate" &&
                  auth?.role !== "superAdmin" && (
                    <Button
                      type="submit"
                      startContent={<Send />}
                      className="bg-main text-white"
                    >
                      แสดงความคิดเห็น
                    </Button>
                  )}
              </div>
            </form>
          </CardBody>
        </Card>

        {comments?.map((item: any, index: any) => {
          const {
            id,
            postMessage,
            postedBy: { name },
            replyMessage,
            replyByAdminId,
          } = item;
          return (
            <Card
              shadow="none"
              key={index}
              className=" border-b  dark:bg-black dark:border-dark"
            >
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 sm:gap-5 ">
                      <Avatar
                        src={
                          item?.postedBy?.imagePath
                            ? `${apiEndpoint}/images/${item?.postedBy?.imagePath}`
                            : "/images/no-image.jpg"
                        }
                      />
                      <div className="flex flex-col">
                        <p className="font-bold">{name}</p>
                        <span className="text-sm">
                          {convertDateToThai(item?.createdAt)}
                        </span>
                      </div>
                    </div>

                    {item?.postByUserId == auth?.id && (
                      <Tooltip content="ลบความคิดเห็น">
                        <CircleX
                          className="cursor-pointer text-[#dcdcdc]"
                          onClick={async () => {
                            try {
                              await axiosInstance.delete(
                                `${apiEndpoint}/api/v1/comment/${item.id}`
                              );

                              await apiGetComments();
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-wrap">{postMessage}</p>
                  {replyMessage && (
                    <div className="mt-3 space-y-3 p-5 pl-4 border-l-4 border-l-main dark:border-dark">
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar
                            src={
                              item?.postedBy?.imagePath
                                ? `${apiEndpoint}/images/${item?.postedBy?.imagePath}`
                                : "/images/no-image.jpg"
                            }
                          />
                          <div className="flex flex-col">
                            <p className="font-bold">{item?.repliedBy?.name}</p>
                            <span className="text-sm">
                              {convertDateToThai(item?.updatedAt)}
                            </span>
                          </div>
                        </div>

                        {item?.replyByAdminId == auth?.id &&
                          auth?.role !== "user" && (
                            <Tooltip content="ลบความคิดเห็น">
                              <CircleX
                                className="cursor-pointer text-[#dcdcdc]"
                                onClick={async () => {
                                  try {
                                    await axiosInstance.patch(
                                      `${apiEndpoint}/api/v1/comment/clear/${item.id}`
                                    );

                                    await apiGetComments();
                                  } catch (error) {
                                    console.log(error);
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                      </div>

                      <p>{replyMessage}</p>
                    </div>
                  )}
                  {auth && !replyByAdminId && auth?.role !== "user" && (
                    <form
                      className="space-y-2 mt-3"
                      onSubmit={handleSubmitReplyForm((data) =>
                        handleReplySubmit(data, id)
                      )}
                    >
                      <Textarea
                        size="sm"
                        variant="bordered"
                        {...registerReplyForm(`replyMessage`, {
                          required: {
                            value: true,
                            message: errorRequire(),
                          },
                        })}
                        placeholder="ตอบกลับ..."
                      />
                      <Button
                        startContent={<Send />}
                        className="bg-main text-white"
                        type="submit"
                      >
                        ตอบกลับ
                      </Button>
                    </form>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
