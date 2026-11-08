import {
  CircleCheck,
  CirclePlus,
  CircleX,
  Edit,
  Ellipsis,
  PlusCircle,
  Trash,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  axiosInstance,
  getAuth,
  apiEndpoint,
  truncateText,
  convertTimestamp,
} from "@/helpers";
import Header from "@/components/Header";
import {
  Button,
  Input,
  Modal,
  Selection,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tooltip,
  useDisclosure,
  Table,
  Pagination,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableColumn,
  Card,
  ScrollShadow,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalFooter,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { errorRequire } from "@/helpers/regex";
import { NextSeo } from "next-seo";

export default function QuestionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const initForm = {
    description: "",
    scoreAvgPass: 60,
    scorePerChoice: 80,
  };

  const initFormContent = {
    question: "",
    correctAns: "",
  };

  const [questions, setQuestions] = useState<any>();
  const [questionContents, setQuestionContents] = useState<any>();
  const [questionId, setQuestionId] = useState<any>();
  const [questionContentId, setQuestionContentId] = useState<any>();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isContentCreateMode, setIsContentCreateMode] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const [choice, setChoice] = useState("");
  const [choices, setChoices] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [isLoadingApi, setIsLoadingApi] = useState(false);
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

  const {
    register: registerQuestionForm,
    handleSubmit: handleSubmitQuestionForm,
    reset: resetQuestionForm,
    formState: { errors: errorsQuestionForm },
  } = useForm();

  const {
    register: registerQuestionContentForm,
    handleSubmit: handleSubmitQuestionContentForm,
    reset: resetQuestionContentForm,
    formState: { errors: errorsQuestionContentForm },
  } = useForm();

  const {
    isOpen: isOpenQuestionSetting,
    onOpen: onOpenQuestionSetting,
    onClose: onCloseQuestionSetting,
  } = useDisclosure();

  const {
    isOpen: isOpenQuestionContent,
    onOpen: onOpenQuestionContent,
    onClose: onCloseQuestionContent,
  } = useDisclosure();

  const {
    isOpen: isOpenQuestion,
    onOpen: onOpenQuestion,
    onClose: onCloseQuestion,
  } = useDisclosure();

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const apiGetQuestion = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question/${id}`
      );

      resetQuestionForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetQuestionContentById = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question/item/one/${id}`
      );

      const newData = { ...data, choices: JSON.parse(data.choices) };
      setChoices(newData.choices);
      resetQuestionContentForm(newData);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetQuestions = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question?page=${page || currentPage}`
      );

      setQuestions(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetQuestionContents = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question/item/${id}`
      );

      setQuestionContents(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiCreateQuestion = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(`${apiEndpoint}/api/v1/question`, {
        ...data,
        postByUserId: auth?.id,
      });

      await apiGetQuestions(currentPage);
      onCloseQuestion();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiCreateQuestionContent = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(`${apiEndpoint}/api/v1/question/item`, {
        ...data,
        questionId,
        choices,
      });

      onCloseQuestionContent();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiUpdateQuestionContent = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/question/item/${questionContentId}`,
        { ...data, choices }
      );

      await apiGetQuestionContents(questionId);
      onCloseQuestionContent();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiDeleteQuestion = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/question/${id}`);

      await apiGetQuestions(currentPage);
    } catch (error) {
      console.log(error);
    }
  };

  const apiDeleteQuestionContent = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/question/item/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const apiUpdateQuestion = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/question/${questionId}`,
        data
      );

      await apiGetQuestions(currentPage);
      onCloseQuestion();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const QuestionModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenQuestion}
        onClose={() => {
          onCloseQuestion();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {isCreateMode ? "เพิ่มข้อสอบใหม่" : "แก้ไขข้อสอบ"}
          </ModalHeader>
          <ModalBody>
            <form className="space-y-2">
              <Input
                size="sm"
                variant="bordered"
                label="ชื่อชุดข้อสอบ"
                {...registerQuestionForm("description", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsQuestionForm.description}
                errorMessage={`${errorsQuestionForm.description?.message}`}
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                label="เกณฑ์เฉลี่ยให้ผ่าน (%)"
                labelPlacement="inside"
                {...registerQuestionForm("scoreAvgPass", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsQuestionForm.scoreAvgPass}
                errorMessage={`${errorsQuestionForm.scoreAvgPass?.message}`}
                type="number"
              />

              <Input
                size="sm"
                variant="bordered"
                type="number"
                label="คะแนนตอบถูก (ต่อข้อ)"
                labelPlacement="inside"
                {...registerQuestionForm("scorePerChoice", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsQuestionForm.scorePerChoice}
                errorMessage={`${errorsQuestionForm.scorePerChoice?.message}`}
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <div className="flex justify-end space-x-2">
              <Button
                isLoading={isLoadingApi}
                startContent={!isLoadingApi && <CircleCheck />}
                onClick={handleSubmitQuestionForm(async (data) => {
                  isCreateMode
                    ? await apiCreateQuestion(data)
                    : await apiUpdateQuestion(data);
                })}
                className="bg-main text-white"
              >
                บันทึกข้อมูล
              </Button>
              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseQuestion();
                  setIsLoadingApi(false);
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const QuestionContentModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenQuestionContent}
        onClose={() => {
          onCloseQuestionContent();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {isContentCreateMode ? "เพิ่มคำถามใหม่" : "แก้ไขคำถาม"}
          </ModalHeader>
          <ModalBody>
            <form className="space-y-2">
              <Input
                size="sm"
                variant="bordered"
                {...registerQuestionContentForm("question", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsQuestionContentForm.question}
                errorMessage={`${errorsQuestionContentForm.question?.message}`}
                label="คำถาม"
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                {...registerQuestionContentForm("correctAns", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsQuestionContentForm.correctAns}
                errorMessage={`${errorsQuestionContentForm.correctAns?.message}`}
                label="คำตอบที่ถูกต้อง **สำคัญโปรดกรอกให้ตรงกับตัวเลือกที่มีข้างล่าง**"
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                label="เพิ่มตัวเลือกคำตอบ"
                labelPlacement="inside"
                value={choice}
                onChange={(e: any) => {
                  setChoice(e.target.value);
                }}
              />

              <Button
                startContent={<CirclePlus />}
                onClick={() => {
                  if (choice) {
                    setChoices((prev: any) => [...prev, choice]);
                  }
                  setChoice("");
                }}
                className="my-5 bg-main text-white"
              >
                เพิ่มตัวเลือกของคำตอบ
              </Button>

              <ScrollShadow className="space-y-2 max-h-[250px] overflow-hidden hover:overflow-y-auto">
                {choices?.map((item: any, index: number) => {
                  return (
                    <Card
                      key={index}
                      className="p-5 border-b dark:border-dark"
                      shadow="none"
                    >
                      {item}

                      <Trash
                        onClick={() => {
                          setChoices((prev: any) =>
                            prev.filter((itemPrev: any) => itemPrev !== item)
                          );
                        }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 hover:scale-110 cursor-pointer text-default-400 active:opacity-50"
                      />
                    </Card>
                  );
                })}
              </ScrollShadow>
            </form>
          </ModalBody>

          <ModalFooter>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleSubmitQuestionContentForm(async (data) => {
                  isContentCreateMode
                    ? await apiCreateQuestionContent(data)
                    : await apiUpdateQuestionContent(data);
                })}
                className="bg-main text-white"
                isLoading={isLoadingApi}
                startContent={!isLoadingApi && <CircleCheck />}
              >
                บันทึกข้อมูล
              </Button>
              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseQuestionContent();
                  setIsLoadingApi(false);
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const QuestionSettingModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenQuestionSetting}
        onClose={() => {
          onCloseQuestionSetting();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>จัดการคลังคำถาม</ModalHeader>
          <ModalBody className="space-y-2">
            <ScrollShadow className="space-y-2 max-h-[300px] overflow-hidden hover:overflow-y-auto">
              {questionContents?.map((item: any, index: any) => {
                return (
                  <Card
                    key={index}
                    className="p-5 relative border-b "
                    shadow="none"
                  >
                    {item.question}
                    <div className="flex space-x-2 absolute right-5 top-1/2 -translate-y-1/2 ">
                      <Tooltip content="แก้ไขคำถาม">
                        <Button
                          isIconOnly
                          onClick={async () => {
                            setIsContentCreateMode(false);
                            await apiGetQuestionContentById(item.id);
                            setQuestionContentId(item.id);
                            onOpenQuestionContent();
                          }}
                          size="sm"
                          variant="light"
                        >
                          <Edit className="hover:scale-110 cursor-pointer text-default-400 active:opacity-50" />
                        </Button>
                      </Tooltip>

                      <Tooltip content="ลบคำถาม">
                        <Button
                          isIconOnly
                          onClick={async () => {
                            if (
                              window.confirm(
                                "คุณแน่ใจหรือไม่ ที่จะลบข้อมูลนี้!"
                              )
                            ) {
                              await apiDeleteQuestionContent(item.id);
                              await apiGetQuestionContents(questionId);
                            }
                          }}
                          size="sm"
                          variant="light"
                        >
                          <Trash className="hover:scale-110 cursor-pointer text-default-400 active:opacity-50" />
                        </Button>
                      </Tooltip>
                    </div>
                  </Card>
                );
              })}
            </ScrollShadow>

            <div className="flex justify-end">
              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseQuestionSetting();
                  setIsLoadingApi(false);
                }}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  useEffect(() => {
    apiGetQuestions(currentPage);
  }, []);

  return (
    <Layout isAdmin>
      <NextSeo
        title={`จัดการข้อสอบ - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {QuestionModal()}
      {QuestionContentModal()}
      {QuestionSettingModal()}

      <Header
        label={"จัดการข้อสอบ"}
        isAdmin
        adminControl={
          <>
            <Button
              variant="bordered"
              onClick={() => {
                resetQuestionForm(initForm);
                setIsCreateMode(true);
                onOpenQuestion();
              }}
              startContent={<PlusCircle />}
            >
              เพิ่มข้อสอบใหม่
            </Button>

            {(selectedKeys === "all" ||
              (selectedKeys instanceof Set && selectedKeys.size > 0)) && (
              <>
                <Button
                  variant="bordered"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "คุณแน่ใจหรือไม่ ที่จะลบข้อมูลเหล่านี้ออกทั้งหมดจากที่เลือก"
                      )
                    ) {
                      if (selectedKeys instanceof Set) {
                        for (const id of selectedKeys) {
                          await apiDeleteQuestion(id);
                        }
                        setSelectedKeys(new Set());
                      } else {
                        questions?.data?.forEach(async (item: any) => {
                          await apiDeleteQuestion(item.id);
                        });
                        setSelectedKeys(new Set());
                      }
                    }
                  }}
                  startContent={<Trash />}
                >
                  ลบข้อมูลที่เลือก
                </Button>
                <Button
                  onClick={() => setSelectedKeys(new Set())}
                  variant="bordered"
                  startContent={<Undo2 />}
                >
                  ยกเลิกการเลือก
                </Button>
              </>
            )}
          </>
        }
      />

      <Table
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectionMode="multiple"
      >
        <TableHeader>
          <TableColumn>ชื่อข้อสอบ</TableColumn>
          <TableColumn>เกณฑ์เฉลี่ยให้ผ่าน</TableColumn>
          <TableColumn>คะแนนตอบถูก (ต่อข้อ)</TableColumn>
          <TableColumn>โพสต์โดย</TableColumn>
          <TableColumn>วันที่สร้าง</TableColumn>
          <TableColumn>วันที่อัพเดต</TableColumn>
          <TableColumn>
            <span>เมนูจัดการ</span>
          </TableColumn>
        </TableHeader>
        <TableBody className={`divide-y`}>
          {questions?.data?.map((item: any, index: any) => {
            return (
              <TableRow key={item.id}>
                <TableCell className="min-w-52 xl:min-w-40">
                  {truncateText(item.description, 85)}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">{`${item.scoreAvgPass} %`}</TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.scorePerChoice}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.users.name}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {convertTimestamp(item.createdAt)}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {convertTimestamp(item.updatedAt)}
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
                        onClick={async () => {
                          setChoices([]);
                          resetQuestionContentForm(initFormContent);
                          setIsContentCreateMode(true);
                          setQuestionId(item.id);
                          onOpenQuestionContent();
                        }}
                      >
                        เพิ่มคำถามใหม่
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          onOpenQuestionSetting();
                          await apiGetQuestionContents(item.id);
                          setQuestionId(item.id);
                        }}
                      >
                        จัดการคำถาม
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          resetQuestionForm();
                          await apiGetQuestion(item.id);
                          setQuestionId(item.id);
                          setIsCreateMode(false);
                          onOpenQuestion();
                        }}
                      >
                        แก้ไขข้อมูล
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          if (
                            window.confirm(
                              "คุณแน่ใจหรือไม่ว่ากำลังจะลบข้อมูลนี้"
                            )
                          ) {
                            await apiDeleteQuestion(item.id);
                          }
                        }}
                      >
                        ลบข้อมูล
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-end">
        <Pagination
          showControls
          total={questions?.allPages}
          initialPage={1}
          onChange={async (e) => {
            setCurrentPage(e);
            await apiGetQuestions(e);
          }}
        />
      </div>
    </Layout>
  );
}
