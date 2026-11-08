import {
  CircleCheck,
  CirclePlus,
  CircleX,
  Edit,
  Ellipsis,
  Folder,
  Images,
  PlusCircle,
  Trash,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import {
  truncateText,
  axiosInstance,
  apiEndpoint,
  getAuth,
  convertTimestamp,
} from "@/helpers";
import Header from "@/components/Header";
import Image from "next/image";
import dynamic from "next/dynamic";
import UploadImage from "@/components/UploadImage";
import UploadVideo from "@/components/UploadVideo";
import { Reorder } from "framer-motion";
import {
  Button,
  Modal,
  ModalBody,
  Selection,
  ModalContent,
  ModalHeader,
  Select,
  Textarea,
  useDisclosure,
  Input,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Switch,
  Snippet,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalFooter,
} from "@nextui-org/react";
import { Controller, useForm } from "react-hook-form";
import { errorRequire } from "@/helpers/regex";
import { useTheme as useNextTheme } from "next-themes";
import { NextSeo } from "next-seo";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function CategoryPage() {
  const { theme } = useNextTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const initForm = {
    id: "",
    postByUserId: "",
    title: "",
    htmlContent: "",
    mainCategoryId: "",
    subCategoryId: "",
    questionId: "",
    imagePath: "",
    isNotCourse: false,
    isCourse: false,
  };

  const initFormVideo = {
    contentId: "",
    description: "",
  };

  const {
    register: registerMainForm,
    handleSubmit: handleSubmitMainForm,
    reset: resetMainForm,
    control: controlMainForm,
    formState: { errors: errorMainForms },
  } = useForm();

  const {
    register: registerVideoForm,
    handleSubmit: handleSubmitVideoForm,
    reset: resetVideoForm,
    formState: { errors: errorVideoForms },
  } = useForm();

  const editor = useRef(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [contents, setContents] = useState<any>();
  const [questions, setQuestions] = useState<any>();
  const [contentId, setContentId] = useState<any>();
  const [mainCategory, setMainCategory] = useState([]);
  const [videoId, setVideoId] = useState<any>();
  const [subCategory, setSubCategory] = useState([]);
  const [videos, setVideos] = useState<any>();
  const [auth, setAuth] = useState<any>(null);
  const [videoPathFile, setVideoPathFile] = useState<any>();
  const [videoPreviewPathFile, setVideoPreviewPathFile] = useState<any>();
  const [imagePathFile, setImagePathFile] = useState<any>();
  const [imageMediaPathFile, setImageMediaPathFile] = useState<any>();
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [clearPreview, setClearPreview] = useState(false);
  const [mediaImages, setMediaImages] = useState<any>();
  const [isEditerOpen, setIsEditorOpen] = useState(false);
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

  const config = useMemo(
    () => ({
      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "table",
        "link",
        "|",
        "left",
        "center",
        "right",
        "justify",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
      ],
      placeholder: "",
      theme: theme,
      toolbarSticky: true,
      toolbarStickyOffset: 0,
    }),
    [theme]
  );

  const {
    isOpen: isOpenUpdateVideo,
    onOpen: onOpenUpdateVideo,
    onClose: onCloseUpdateVideo,
  } = useDisclosure();

  const {
    isOpen: isOpenVideoSetting,
    onOpen: onOpenVideoSetting,
    onClose: onCloseVideoSetting,
  } = useDisclosure();

  const {
    isOpen: isOpenUploadVideo,
    onOpen: onOpenUploadVideo,
    onClose: onCloseUploadVideo,
  } = useDisclosure();

  const {
    isOpen: isOpenMediaForm,
    onOpen: onOpenMediaForm,
    onClose: onCloseMediaForm,
  } = useDisclosure();

  const {
    isOpen: isOpenMainForm,
    onOpen: onOpenMainForm,
    onClose: onCloseMainForm,
  } = useDisclosure();

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const apiGetMediaImages = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/user/upload/image?page=${page || 1}`
      );

      setMediaImages(data);
      onOpenMediaForm();
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetVideos = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/video/${id}`
      );

      setVideos(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetMainCategories = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/main/noPagi`
      );

      setMainCategory(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetSubCategories = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/sub/main/${id}`
      );

      setSubCategory(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetContents = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content?page=${page || currentPage}`
      );

      setContents(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiUpdateVideo = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/content/video/order/${videoId}`,
        data
      );

      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiGetVideoSorts = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/video/order/${id}`
      );

      resetVideoForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetQuestions = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/question`
      );

      setQuestions(data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetContent = async (ContentId?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/${ContentId}`
      );

      resetMainForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiCreateContent = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(
        `${apiEndpoint}/api/v1/content`,
        {
          ...data,
          postByUserId: auth?.id,
          imagePathFile,
          videoPathFile: videoPreviewPathFile,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await apiGetContents(currentPage);
      setImagePathFile(null);
      setVideoPreviewPathFile(null);
      onCloseMainForm();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiCreateVideo = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(
        `${apiEndpoint}/api/v1/content/video`,
        { ...data, videoPathFile, contentId },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetVideoForm(initFormVideo);
      setImagePathFile(null);
      onCloseUploadVideo();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiUpdateContent = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/content/${contentId}`,
        { ...data, imagePathFile, videoPathFile: videoPreviewPathFile },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await apiGetContents(currentPage);
      onCloseMainForm();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiDeleteContent = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/content/${id}`);

      await apiGetContents(currentPage);
    } catch (error) {
      console.log(error);
    }
  };

  const UpdateVideoModal = () => {
    return (
      <Modal
        size="2xl"
        scrollBehavior="inside"
        isOpen={isOpenUpdateVideo}
        onClose={() => {
          onCloseUpdateVideo();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>แก้ไขรายละเอียดวิดีโอ</ModalHeader>

          <ModalBody>
            <form
              onSubmit={handleSubmitVideoForm(async (data) => {
                await apiUpdateVideo(data);
                onCloseUpdateVideo();
              })}
              className="space-y-2"
            >
              <Textarea
                size="sm"
                variant="bordered"
                rows={10}
                label="รายละเอียดวิดีโอ"
                labelPlacement="inside"
                {...registerVideoForm("description", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorVideoForms.description}
                errorMessage={`${errorVideoForms.description?.message}`}
              />
              <div className="flex justify-end">
                <Button
                  isLoading={isLoadingApi}
                  startContent={!isLoadingApi && <CircleCheck />}
                  className="bg-main text-white"
                  type="submit"
                >
                  บันทึกข้อมูล
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const VideoSettingModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenVideoSetting}
        onClose={() => {
          onCloseVideoSetting();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>เรียงลำดับการแสดงวิดีโอ</ModalHeader>
          <ModalBody>
            {videos && videos?.length > 0 && (
              <Reorder.Group axis="y" values={videos} onReorder={setVideos}>
                {videos.map((item: any, index: any) => (
                  <Reorder.Item key={item.id} value={item}>
                    <div className="w-full relative cursor-move mb-5">
                      <video
                        className="h-96 w-full object-cover border dark:border-dark  rounded-large"
                        controls
                        src={`${apiEndpoint}/videos/${item.videoPath}`}
                      />

                      <div className="absolute top-5 left-5 p-2 text-white font-bold bg-main flex justify-center items-center rounded-full">
                        วิดีโอหมายเลข {item.id}
                      </div>

                      <div className="absolute w-fit top-5 right-5 p-2 space-x-5 text-white font-bold bg-main flex justify-center items-center rounded-full">
                        <Edit
                          className="cursor-pointer hover:scale-105 duration-300"
                          onClick={async () => {
                            await apiGetVideoSorts(item.id);
                            setVideoId(item.id);
                            onOpenUpdateVideo();
                          }}
                        />
                        <Trash
                          className="cursor-pointer hover:scale-105 duration-300"
                          onClick={async () => {
                            if (
                              window.confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้!")
                            ) {
                              try {
                                await axiosInstance.delete(
                                  `${apiEndpoint}/api/v1/content/video/order/${item.id}`
                                );
                                await apiGetVideos(item.contentId);
                              } catch (error) {
                                console.log(error);
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {videos?.length === 0 && (
              <div className="flex flex-col justify-center items-center">
                <span className="text-red-500">
                  *** ยังไม่มีวิดีโอในคลังนี้ ***
                </span>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <div className="flex space-x-2 justify-end">
              <Button
                isLoading={isLoadingApi}
                startContent={!isLoadingApi && <CircleCheck />}
                className="bg-main text-white"
                onClick={async () => {
                  for (let index = 0; index < videos.length; index++) {
                    const item = videos[index];
                    try {
                      await axiosInstance.patch(
                        `${apiEndpoint}/api/v1/content/video/order/${item.id}`,
                        {
                          index: index + 1,
                        }
                      );
                    } catch (error) {
                      console.log(error);
                    }
                  }

                  onCloseVideoSetting();
                }}
              >
                บันทึกข้อมูล
              </Button>

              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseVideoSetting();
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

  const UploadVideoModal = () => {
    return (
      <Modal
        size="2xl"
        scrollBehavior="inside"
        isOpen={isOpenUploadVideo}
        onClose={() => {
          onCloseUploadVideo();
          resetVideoForm();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>เพิ่มวิดีโอใหม่</ModalHeader>
          <ModalBody>
            <form className="space-y-2">
              <UploadVideo setVideoPathFile={setVideoPathFile} />

              <Textarea
                size="sm"
                variant="bordered"
                rows={10}
                label="รายละเอียดวิดีโอ"
                labelPlacement="inside"
                {...registerVideoForm("description", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorVideoForms.description}
                errorMessage={`${errorVideoForms.description?.message}`}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex space-x-2 justify-end">
              <Button
                isLoading={isLoadingApi}
                startContent={!isLoadingApi && <CircleCheck />}
                onClick={handleSubmitVideoForm(async (data) => {
                  if (videoPathFile) {
                    await apiCreateVideo(data);
                  }
                })}
                className="bg-main text-white"
              >
                บันทึกข้อมูล
              </Button>
              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseUploadVideo();
                  resetVideoForm();
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

  const MediaModal = () => {
    return (
      <Modal
        size="4xl"
        scrollBehavior="inside"
        isOpen={isOpenMediaForm}
        onClose={() => {
          onCloseMediaForm();
        }}
      >
        <ModalContent>
          <ModalHeader>คลังรูปภาพ</ModalHeader>

          <ModalBody className="p-5">
            <div className="gap-2 sm:gap-5  flex flex-col">
              <UploadImage
                setImagePathFile={setImageMediaPathFile}
                clearPreview={clearPreview}
              />
              <Button
                onClick={async () => {
                  try {
                    await axiosInstance.post(
                      `${apiEndpoint}/api/v1/user/upload/image`,
                      {
                        imageMediaPathFile,
                      },
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    setImageMediaPathFile(null);
                    setClearPreview(true);
                    setTimeout(() => setClearPreview(false), 100);
                    await apiGetMediaImages();
                  } catch (error) {
                    console.log(error);
                  }
                }}
                startContent={<CirclePlus />}
                className="bg-main text-white w-fit"
              >
                อัพโหลดรูปภาพ
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-5 ">
              {mediaImages?.images?.map((item: any, index: any) => {
                return (
                  <div
                    className="flex flex-col gap-2 sm:gap-5  relative"
                    key={index}
                  >
                    <div className="absolute right-0 top-0 m-2 bg-main p-2 rounded-full">
                      <CircleX
                        className="cursor-pointer hover:scale-105 text-white"
                        onClick={async () => {
                          try {
                            await axiosInstance.delete(
                              `${apiEndpoint}/api/v1/user/upload/image/${item}`
                            );

                            await apiGetMediaImages();
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      />
                    </div>
                    <Image
                      key={index}
                      src={`${apiEndpoint}/media/${item}`}
                      width={150}
                      height={150}
                      alt=""
                      className="w-full h-52 object-cover rounded-large"
                    />
                    <Snippet
                      color="primary"
                      symbol={""}
                      onCopy={onCloseMediaForm}
                    >
                      <span className="text-wrap">{`${apiEndpoint}/media/${item}`}</span>
                    </Snippet>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Pagination
                showControls
                total={mediaImages?.allPages}
                initialPage={1}
                onChange={async (e) => {
                  await apiGetMediaImages(e);
                }}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const JoditEditorModal = () => {
    return (
      <div className="flex flex-col space-y-2">
        <Controller
          control={controlMainForm}
          name="htmlContent"
          defaultValue={""}
          render={({ field: { onChange, value } }) => (
            <JoditEditor
              ref={editor}
              config={config}
              value={value}
              onBlur={(newContent) => onChange(newContent)}
            />
          )}
        />

        <div className="w-full flex gap-2 flex-wrap">
          <Button
            onClick={handleSubmitMainForm(async (data) => {
              await apiUpdateContent(data);
              setIsEditorOpen(false);
              resetMainForm(initForm);
            })}
            className="bg-main text-white"
            isLoading={isLoadingApi}
            startContent={!isLoadingApi && <CircleCheck />}
          >
            บันทึกข้อมูล
          </Button>

          <Button
            startContent={<CircleX />}
            onClick={() => {
              setIsEditorOpen(false);
              resetMainForm(initForm);
            }}
          >
            ปิด Editor
          </Button>
        </div>
      </div>
    );
  };

  const MainFormModal = () => {
    return (
      <Modal
        size="2xl"
        scrollBehavior="inside"
        isOpen={isOpenMainForm}
        onClose={() => {
          onCloseMainForm();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {isCreateMode ? "เพิ่มบทความใหม่" : "แก้ไขบทความ"}
          </ModalHeader>

          <ModalBody>
            <form className="space-y-2">
              <UploadImage
                setImagePathFile={setImagePathFile}
                label={"รูปภาพหน้าปก"}
              />

              <UploadVideo
                setVideoPathFile={setVideoPreviewPathFile}
                label={"วิดีโอเกริ่นนำ"}
              />

              <Switch {...registerMainForm("isCourse")}>
                ปิดการแสดงในสาธารณะ{" "}
                <span className="text-red-500">**ใช้ในบทเรียนเท่านั้น**</span>
              </Switch>

              <Switch {...registerMainForm("isNotCourse")}>
                ปิดระบบข้อสอบการเก็บคะแนน{" "}
                <span className="text-red-500">
                  **ผู้ใช้จะอ่านและดูวิดีโอได้อย่างเดียว**
                </span>
              </Switch>

              <Input
                size="sm"
                variant="bordered"
                label="ชื่อเรื่อง"
                labelPlacement="inside"
                isInvalid={!!errorMainForms.title}
                errorMessage={`${errorMainForms.title?.message}`}
                {...registerMainForm("title", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
              />

              <Textarea
                size="sm"
                variant="bordered"
                label="เกริ่นนำ"
                minRows={10}
                labelPlacement="inside"
                isInvalid={!!errorMainForms.description}
                errorMessage={`${errorMainForms.description?.message}`}
                {...registerMainForm("description")}
              />

              <Select
                size="sm"
                variant="bordered"
                {...registerMainForm("questionId")}
                label={<p>ชุดข้อสอบ</p>}
              >
                {questions?.map((item: any) => {
                  return (
                    <SelectItem key={item?.id}>{item.description}</SelectItem>
                  );
                })}
              </Select>

              <div className="flex space-x-2 justify-between">
                <div className="w-1/2">
                  <Select
                    size="sm"
                    variant="bordered"
                    onSelectionChange={async (e) => {
                      const id = Array.from(e)[0];
                      await apiGetSubCategories(id);
                    }}
                    {...registerMainForm("mainCategoryId")}
                    label="หมวดหมู่หลัก"
                  >
                    {mainCategory?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>{item.title}</SelectItem>
                      );
                    })}
                  </Select>
                </div>

                <div className="w-1/2">
                  <Select
                    size="sm"
                    variant="bordered"
                    {...registerMainForm("subCategoryId")}
                    label="หมวดหมู่รอง"
                  >
                    {subCategory?.map((item: any) => {
                      return (
                        <SelectItem key={item?.id}>{item.title}</SelectItem>
                      );
                    })}
                  </Select>
                </div>
              </div>
            </form>
          </ModalBody>

          <ModalFooter>
            <div className="flex space-x-2 justify-end">
              <Button
                onClick={handleSubmitMainForm(async (data) => {
                  isCreateMode
                    ? await apiCreateContent(data)
                    : await apiUpdateContent(data);
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
                  onCloseMainForm();
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

  useEffect(() => {
    apiGetContents(currentPage);
    apiGetMainCategories();
    apiGetQuestions();
  }, []);

  return (
    <Layout isAdmin>
      <NextSeo
        title={`จัดการบทความ - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {MainFormModal()}
      {UploadVideoModal()}
      {UpdateVideoModal()}
      {VideoSettingModal()}
      {MediaModal()}

      <Header
        label={"จัดการบทความ"}
        isAdmin
        adminControl={
          <>
            <Button
              variant="bordered"
              onClick={() => {
                resetMainForm(initForm);
                setIsCreateMode(true);
                onOpenMainForm();
              }}
              startContent={<PlusCircle />}
            >
              เพิ่มบทความใหม่
            </Button>

            <Button
              variant="bordered"
              startContent={<Images />}
              onClick={() => {
                apiGetMediaImages();
              }}
            >
              เปิดคลังรูปภาพ
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
                          await apiDeleteContent(contents?.data[id]?.id);
                        }
                        setSelectedKeys(new Set());
                      } else {
                        contents?.data?.forEach(async (item: any) => {
                          await apiDeleteContent(item.id);
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

      {isEditerOpen && JoditEditorModal()}

      <Table
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectionMode="multiple"
      >
        <TableHeader>
          <TableColumn>รูปภาพ</TableColumn>
          <TableColumn>ชื่อบทความ</TableColumn>
          <TableColumn>ชุดข้อสอบ</TableColumn>
          <TableColumn>หมวดหมู่หลัก</TableColumn>
          <TableColumn>หมวดหมู่รอง</TableColumn>
          <TableColumn>โพสต์โดย</TableColumn>
          <TableColumn>วันที่สร้าง</TableColumn>
          <TableColumn>วันที่อัพเดต</TableColumn>
          <TableColumn>
            <span>เมนูจัดการ</span>
          </TableColumn>
        </TableHeader>
        <TableBody className={`divide-y`}>
          {contents?.data?.map((item: any, index: number) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <Avatar
                    src={
                      item.imagePath
                        ? `${apiEndpoint}/images/${item.imagePath}`
                        : "/images/no-image.jpg"
                    }
                    alt="content-image"
                  />
                </TableCell>
                <TableCell className="min-w-52 xl:min-w-40">
                  {truncateText(item.title, 50)}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.questions?.description ?? "-"}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.mainCategories?.title ?? "-"}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.subCategories?.title ?? "-"}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.users?.name ?? "-"}
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
                          resetVideoForm(initFormVideo);
                          setContentId(item.id);
                          onOpenUploadVideo();
                        }}
                      >
                        เพิ่มวิดีโอในบทความ
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          await apiGetVideos(item.id);
                          onOpenVideoSetting();
                        }}
                      >
                        ตั้งค่าการแสดงวิดีโอ
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          await apiGetContent(item.id);
                          setIsCreateMode(false);
                          onOpenMainForm();
                          setContentId(item.id);
                        }}
                      >
                        แก้ไขข้อมูล
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          resetMainForm(initForm);
                          await apiGetContent(item.id);
                          setIsCreateMode(false);
                          setContentId(item.id);
                          setIsEditorOpen(true);
                        }}
                      >
                        แก้ไขเนื้อหา (เปิด Editor)
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          if (
                            window.confirm(
                              "คุณแน่ใจหรือไม่ว่ากำลังจะลบข้อมูลนี้"
                            )
                          ) {
                            await apiDeleteContent(item.id);
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
          total={contents?.allPages}
          initialPage={1}
          onChange={async (e) => {
            setCurrentPage(e);
            await apiGetContents(e);
          }}
        />
      </div>
    </Layout>
  );
}
