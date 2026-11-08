import {
  CircleCheck,
  CirclePlus,
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
  convertTimestamp,
} from "@/helpers";
import Header from "@/components/Header";
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { errorRequire } from "@/helpers/regex";
import { NextSeo } from "next-seo";

export default function CategoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const initForm = {
    title: "",
  };

  const {
    register: registerMainForm,
    handleSubmit: handleSubmitMainForm,
    reset: resetMainForm,
    formState: { errors: errorsMainForm },
  } = useForm();
  const [mainCategories, setMainCategories] = useState<any>();
  const [subCategories, setSubCategories] = useState<any>();
  const [mainCategoryId, setMainCategoryId] = useState<any>();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const {
    isOpen: isOpenMainCategory,
    onOpen: onOpenMainCategory,
    onClose: onCloseMainCategory,
  } = useDisclosure();
  const {
    isOpen: isOpenSubCategory,
    onOpen: onOpenSubCategory,
    onClose: onCloseSubCategory,
  } = useDisclosure();
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

  const apiGetMainCategories = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/main/?page=${page || currentPage}`
      );

      setMainCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetMainCategory = async (mainCategoryId?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/main/${mainCategoryId}`
      );

      resetMainForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubCategories = async (id?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/sub/main/${id ? id : mainCategoryId}`
      );

      setSubCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiCreateMainCategory = async (data: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(`${apiEndpoint}/api/v1/category/main`, data);

      await apiGetMainCategories(currentPage);
      onCloseMainCategory();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiCreateSubCategory = async (data: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(`${apiEndpoint}/api/v1/category/sub`, {
        ...data,
        mainCategoryId: mainCategoryId,
      });

      await getSubCategories();
      setIsLoadingApi(false);
      resetMainForm({ title: "" });
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiDeleteMainCategory = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/category/main/${id}`);

      await apiGetMainCategories(currentPage);
    } catch (error) {
      console.log(error);
    }
  };

  const apiUpdateMainCategory = async (data: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/category/main/${mainCategoryId}`,
        data
      );

      await apiGetMainCategories(currentPage);
      onCloseMainCategory();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiDeleteSubCategory = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/category/sub/${id}`);

      await getSubCategories();
    } catch (error) {
      console.log(error);
    }
  };

  const MainCategoryModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenMainCategory}
        onClose={() => {
          onCloseMainCategory();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>
            {isCreateMode ? "เพิ่มหมวดหมู่ใหม่" : "แก้ไขหมวดหมู่"}
          </ModalHeader>

          <ModalBody>
            <form className="space-y-2">
              <Input
                size="sm"
                variant="bordered"
                label="ชื่อเรื่อง"
                labelPlacement="inside"
                isInvalid={!!errorsMainForm.title}
                errorMessage={`${errorsMainForm.title?.message}`}
                {...registerMainForm("title", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <div className="flex justify-end space-x-2">
              <Button
                isLoading={isLoadingApi}
                startContent={!isLoadingApi && <CircleCheck />}
                onClick={handleSubmitMainForm(async (data) => {
                  isCreateMode
                    ? await apiCreateMainCategory(data)
                    : await apiUpdateMainCategory(data);
                })}
                className="bg-main text-white"
              >
                บันทึกข้อมูล
              </Button>
              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseMainCategory();
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

  const SubCategoryModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenSubCategory}
        onClose={() => {
          onCloseSubCategory();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>เพิ่มหมวดหมู่ย่อย</ModalHeader>

          <ModalBody>
            <form
              onSubmit={handleSubmitMainForm(async (data) => {
                await apiCreateSubCategory(data);
              })}
              className="space-y-2"
            >
              <Input
                size="sm"
                variant="bordered"
                label="ชื่อหมวดหมู่ย่อย"
                labelPlacement="inside"
                isInvalid={!!errorsMainForm.title}
                errorMessage={`${errorsMainForm.title?.message}`}
                {...registerMainForm("title", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
              />
              <div className="flex justify-end">
                <Button
                  isLoading={isLoadingApi}
                  startContent={!isLoadingApi && <CirclePlus />}
                  type="submit"
                  className="bg-main text-white"
                >
                  เพิ่มหมวดหมู่ย่อย
                </Button>
              </div>

              <ScrollShadow className="max-h-[400px] space-y-2 overflow-hidden hover:overflow-y-auto">
                {subCategories &&
                  subCategories.length > 0 &&
                  subCategories.map((item: any, index: any) => (
                    <Card
                      key={index}
                      shadow="none"
                      className="p-5 border dark:border-dark"
                    >
                      <div className="flex justify-between">
                        <p>{item.title}</p>
                        <Trash
                          onClick={async () => {
                            await apiDeleteSubCategory(item.id).then(() =>
                              getSubCategories()
                            );
                          }}
                          className="hover:scale-110 cursor-pointer text-default-400 active:opacity-50"
                        />
                      </div>
                    </Card>
                  ))}
              </ScrollShadow>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  useEffect(() => {
    apiGetMainCategories(currentPage);
  }, []);

  useEffect(() => {
    if (mainCategoryId) {
      getSubCategories(mainCategoryId);
    }
  }, [mainCategoryId]);

  return (
    <Layout isAdmin>
      <NextSeo
        title={`จัดการหมวดหมู่ - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {MainCategoryModal()}
      {SubCategoryModal()}

      <Header
        label={"จัดการหมวดหมู่"}
        isAdmin
        adminControl={
          <>
            <Button
              variant="bordered"
              onClick={() => {
                setIsCreateMode(true);
                onOpenMainCategory();
                resetMainForm(initForm);
              }}
              startContent={<PlusCircle />}
            >
              เพิ่มหมวดหมู่ใหม่
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
                          await apiDeleteMainCategory(
                            mainCategories?.data[id]?.id
                          );
                        }
                        setSelectedKeys(new Set());
                      } else {
                        mainCategories?.data?.forEach(async (item: any) => {
                          await apiDeleteMainCategory(item.id);
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
          <TableColumn>ชื่อหมวดหมู่</TableColumn>
          <TableColumn>วันที่สร้าง</TableColumn>
          <TableColumn>วันที่อัพเดต</TableColumn>
          <TableColumn>
            <span>เมนูจัดการ</span>
          </TableColumn>
        </TableHeader>
        <TableBody className={`divide-y`}>
          {mainCategories?.data?.map((item: any, index: number) => {
            return (
              <TableRow key={item.id}>
                <TableCell className="min-w-52 xl:min-w-40">
                  {truncateText(item.title, 85)}
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
                          resetMainForm(initForm);
                          setMainCategoryId(item.id);
                          getSubCategories(item.id);
                          onOpenSubCategory();
                        }}
                      >
                        เพิ่มหมวดหมู่ย่อย
                      </DropdownItem>
                      <DropdownItem
                        onClick={async () => {
                          await apiGetMainCategory(item.id);
                          setIsCreateMode(false);
                          onOpenMainCategory();
                          setMainCategoryId(item.id);
                        }}
                      >
                        แก้ไขข้อมูล
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => {
                          if (
                            window.confirm(
                              "คุณแน่ใจหรือไม่ว่ากำลังจะลบข้อมูลนี้"
                            )
                          ) {
                            apiDeleteMainCategory(item.id);
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
          total={mainCategories?.allPages}
          initialPage={1}
          onChange={async (e) => {
            setCurrentPage(e);
            await apiGetMainCategories(e);
          }}
        />
      </div>
    </Layout>
  );
}
