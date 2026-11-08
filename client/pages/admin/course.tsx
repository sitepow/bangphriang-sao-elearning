import {
  CircleCheck,
  CircleX,
  Ellipsis,
  PlusCircle,
  Trash,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  truncateText,
  axiosInstance,
  apiEndpoint,
  getAuth,
  convertTimestamp,
} from "@/helpers";
import Header from "@/components/Header";
import UploadImage from "@/components/UploadImage";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
  Selection,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  useDisclosure,
  Select,
  SelectItem,
  Switch,
  ScrollShadow,
  Card,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalFooter,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { errorRequire } from "@/helpers/regex";
import { NextSeo } from "next-seo";

export default function CategoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const initForm = {
    title: "",
    description: "",
    avgPass: 80,
    imagePath: "",
    price: 0.0,
  };
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [courses, setCourses] = useState<any>();
  const [courseId, setCourseId] = useState<any>();
  const [selectContentIds, setSelectContentIds] = useState<number[]>([]);
  const [contents, setContents] = useState<any>();
  const [imagePathFile, setImagePathFile] = useState();
  const [auth, setAuth] = useState<any>(null);
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

  const handleSelect = async (id: number) => {
    try {
      if (selectContentIds.includes(id)) {
        await axiosInstance.post(`${apiEndpoint}/api/v1/course/item/delete`, {
          lessionId: courseId,
          contentId: id,
        });

        setSelectContentIds((prevSelected) =>
          prevSelected.filter((item) => item !== id)
        );
      } else {
        await axiosInstance.post(`${apiEndpoint}/api/v1/course/item`, {
          lessionId: courseId,
          contentId: id,
        });

        setSelectContentIds((prevSelected) => [...prevSelected, id]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const {
    register: registerMainForm,
    handleSubmit: handleSubmitMainForm,
    reset: resetMainForm,
    formState: { errors: errorsMainForm },
  } = useForm();

  const {
    isOpen: isOpenMainForm,
    onOpen: onOpenMainForm,
    onClose: onCloseMainForm,
  } = useDisclosure();

  const {
    isOpen: isOpenCourse,
    onOpen: onOpenCourse,
    onClose: onCloseCourse,
  } = useDisclosure();

  const apiGetCourses = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course?page=${page || currentPage}`
      );

      setCourses(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetContents = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/content/dropdown`
      );

      setContents(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetCourseContents = async (id: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/item/${id}`
      );

      const filterContentIds = data.map((item: any) => item.contentId);
      setSelectContentIds(filterContentIds);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetCourse = async (CourseId?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/${CourseId}`
      );

      resetMainForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiCreateCourse = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(
        `${apiEndpoint}/api/v1/course`,
        { ...data, postByUserId: auth?.id, imagePathFile },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetMainForm(initForm);
      await apiGetCourses(currentPage);
      onCloseMainForm();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiUpdateCourse = async (data?: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/course/${courseId}`,
        { ...data, imagePathFile },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      resetMainForm(initForm);
      await apiGetCourses(currentPage);
      onCloseMainForm();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiDeleteCourse = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/course/${id}`);

      await apiGetCourses(currentPage);
    } catch (error) {
      console.log(error);
    }
  };

  const ContentModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenCourse}
        onClose={() => {
          onCloseCourse();
          setSelectContentIds([]);
        }}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>บทความในบทเรียน</ModalHeader>
          <ModalBody className="space-y-2">
            {contents?.length == 0 && (
              <div className="flex flex-col justify-center items-center">
                <span className="text-red-500">
                  *** ยังไม่มีบทความในระบบ ***
                </span>
              </div>
            )}

            {contents?.length > 0 && (
              <ScrollShadow className="space-y-2 max-h-96 overflow-hidden hover:overflow-y-auto">
                {contents?.map((item: any) => (
                  <Card
                    key={item.id}
                    shadow="none"
                    className="p-5 border-b dark:border-dark"
                  >
                    <div className="flex justify-between">
                      <div className="flex gap-2 sm:gap-5  items-center">
                        <Avatar
                          src={
                            item.imagePath
                              ? `${apiEndpoint}/images/${item.imagePath}`
                              : "/images/no-image.jpg"
                          }
                          alt="content-image"
                        />

                        <p className="w-[75%]">
                          {item.title}{" "}
                          <span className="text-red-500">
                            {!item.questionId &&
                              "** บทความนี้ไม่มีข้อสอบ ถ้าหากต้องการเพิ่มข้อสอบให้กับบทความนี้ ท่านสามารถเข้าไปเพิ่มได้ที่หน้าคลังข้อสอบ และแก้ไขบทความเลือกชุดข้อสอบ**"}
                          </span>
                        </p>
                      </div>

                      <Switch
                        disabled={!item.questionId}
                        defaultSelected={selectContentIds.includes(item.id)}
                        onChange={async () => await handleSelect(item.id)}
                      />
                    </div>
                  </Card>
                ))}
              </ScrollShadow>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseCourse();
                  setSelectContentIds([]);
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

  const MainFormModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenMainForm}
        onClose={() => {
          onCloseMainForm();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {isCreateMode ? "เพิ่มบทเรียนใหม่" : "แก้ไขบทเรียน"}
          </ModalHeader>
          <ModalBody>
            <form className="space-y-2">
              <Select
                size="sm"
                variant="bordered"
                defaultSelectedKeys={["activate"]}
                {...registerMainForm("status")}
                label="สถานะบทเรียน"
              >
                <SelectItem key="activate">เปิดการใช้งาน</SelectItem>
                <SelectItem key="deactivate">ปิดการใช้งาน</SelectItem>
              </Select>

              <UploadImage setImagePathFile={setImagePathFile} />

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("title", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.title}
                errorMessage={`${errorsMainForm.title?.message}`}
                label="ชื่อเรื่อง"
                labelPlacement="inside"
              />

              <Textarea
                size="sm"
                variant="bordered"
                {...registerMainForm("description", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.description}
                errorMessage={`${errorsMainForm.description?.message}`}
                label="เกริ่นนำ"
                labelPlacement="inside"
                minRows={5}
              />

              {settings?.isCourseMustPaid && (
                <Input
                  size="sm"
                  variant="bordered"
                  label="ราคาบทเรียน **ไม่บังคับ"
                  labelPlacement="inside"
                  {...registerMainForm("price")}
                  isInvalid={!!errorsMainForm.price}
                  errorMessage={`${errorsMainForm.price?.message}`}
                  type="number"
                />
              )}

              <Input
                size="sm"
                variant="bordered"
                label="เกณฑ์เฉลี่ยให้ผ่าน (%)"
                labelPlacement="inside"
                {...registerMainForm("avgPass", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.avgPass}
                errorMessage={`${errorsMainForm.avgPass?.message}`}
                type="number"
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleSubmitMainForm(async (data) => {
                  isCreateMode
                    ? await apiCreateCourse(data)
                    : await apiUpdateCourse(data);

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
                variant="bordered"
                onClick={() => {
                  resetMainForm(initForm);
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
    setAuth(getAuth());
    apiGetContents();
    apiGetCourses(currentPage);
  }, []);

  return (
    <Layout isAdmin>
      <NextSeo
        title={`จัดการบทเรียน - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {MainFormModal()}
      {ContentModal()}

      <Header
        label={"จัดการบทเรียน"}
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
              เพิ่มบทเรียนใหม่
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
                          await apiDeleteCourse(courses?.data[id]?.id);
                        }
                        setSelectedKeys(new Set());
                      } else {
                        courses?.data?.forEach(async (item: any) => {
                          await apiDeleteCourse(item.id);
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
          <TableColumn>รูปภาพ</TableColumn>
          <TableColumn>ชื่อบทเรียน</TableColumn>
          <TableColumn>สถานะบทเรียน</TableColumn>
          <TableColumn>โพสต์โดย</TableColumn>
          <TableColumn>วันที่สร้าง</TableColumn>
          <TableColumn>วันที่อัพเดต</TableColumn>
          <TableColumn>
            <span>เมนูจัดการ</span>
          </TableColumn>
        </TableHeader>
        <TableBody className={`divide-y`}>
          {courses?.data?.map((item: any, index: any) => {
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
                  {truncateText(item.title, 85)}
                </TableCell>
                <TableCell>
                  {item.status === "activate" ? (
                    <Chip size="sm" variant="flat" color="success">
                      กำลังใช้งานอยู่
                    </Chip>
                  ) : (
                    <Chip size="sm" variant="flat" color="danger">
                      ปิดการใช้งาน
                    </Chip>
                  )}
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
                          await apiGetCourseContents(item.id);
                          setCourseId(item.id);
                          onOpenCourse();
                        }}
                      >
                        เพิ่มบทความในบทเรียนนี้
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          setCourseId(item.id);
                          resetMainForm();
                          await apiGetCourse(item.id);
                          setIsCreateMode(false);
                          onOpenMainForm();
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
                            await apiDeleteCourse(item.id);
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
          total={courses?.allPages}
          initialPage={1}
          onChange={async (e) => {
            setCurrentPage(e);
            await apiGetCourses(e);
          }}
        />
      </div>
    </Layout>
  );
}
