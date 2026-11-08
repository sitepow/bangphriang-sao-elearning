import {
  CircleCheck,
  CircleX,
  Ellipsis,
  PlusCircle,
  Trash,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  truncateText,
  axiosInstance,
  getAuth,
  apiEndpoint,
  convertTimestamp,
} from "@/helpers";
import UploadImage from "@/components/UploadImage";
import {
  regexEmail,
  errorEmail,
  errorRequire,
  regexThaiID,
  errorThaiID,
  checkEmpty,
  errorPasswordNotMatch,
} from "@/helpers/regex";
import { useRouter } from "next/router";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
  Textarea,
  useDisclosure,
  Pagination,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ModalFooter,
} from "@nextui-org/react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import React from "react";
import { useForm } from "react-hook-form";
import { NextSeo } from "next-seo";
import ErrorNotification from "@/components/ErrorNotification";

export default function CategoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const initForm = {
    name: "",
    shortDescription: "",
    personalId: "",
    email: "",
    password: "",
    confirmPassword: "",
    status: "activate",
    role: "user",
    imagePath: "",
  };

  const {
    register: registerMainForm,
    handleSubmit: handleSubmitMainForm,
    reset: resetMainForm,
    getValues: getValuesMainForm,
    formState: { errors: errorsMainForm },
  } = useForm();

  const router = useRouter();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [users, setUsers] = useState<any>();
  const [userId, setUserId] = useState<any>();
  const [auth, setAuth] = useState<any>(null);
  const [isChangePassword, setIsChangePassword] = useState(false);
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
    isOpen: isOpenMainForm,
    onOpen: onOpenMainForm,
    onClose: onCloseMainForm,
  } = useDisclosure();

  const [isApiError, setIsApiError] = useState(false);
  const [imagePathFile, setImagePathFile] = useState();

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (auth?.role == "admin") {
      router.push("/admin");
    }
  }, [router, auth]);

  const apiGetUsers = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/user?page=${page || currentPage}`
      );

      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetUser = async (UserId?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/user/${UserId}`
      );

      resetMainForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiCreateUser = async (data: any) => {
    setIsApiError(false);
    setIsLoadingApi(true);

    try {
      await axiosInstance.post(
        `${apiEndpoint}/api/v1/user`,
        { ...data, imagePathFile },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await apiGetUsers(currentPage);
      onCloseMainForm();
      setIsLoadingApi(false);
    } catch (error) {
      setIsApiError(true);
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiUpdateUser = async (data: any) => {
    setIsLoadingApi(true);

    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/user/${userId}`,
        { ...data, imagePathFile },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await apiGetUsers(currentPage);
      onCloseMainForm();
      setIsLoadingApi(false);
    } catch (error) {
      setIsLoadingApi(false);
      console.log(error);
    }
  };

  const apiDeleteUser = async (id: any) => {
    try {
      await axiosInstance.delete(`${apiEndpoint}/api/v1/user/${id}`);
      await apiGetUsers(currentPage);
    } catch (error) {
      console.log(error);
    }
  };

  const modalFormData = () => {
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
            {isCreateMode ? "เพิ่มผู้ใช้งานใหม่" : "แก้ไขผู้ใช้งาน"}
          </ModalHeader>

          <ModalBody>
            <form className="space-y-2">
              <UploadImage setImagePathFile={setImagePathFile} />

              {isApiError && (
                <ErrorNotification isError>
                  เกิดข้อผิดพลาด ไม่สามารถสมัครสมาชิกได้
                  เนื่องจากข้อผิดพลาดจากเซิร์ฟเวอร์หรืออีเมลถูกสมัครไปแล้ว
                  โปรดลองใหม่อีกครั้ง
                </ErrorNotification>
              )}

              <Select
                size="sm"
                variant="bordered"
                required
                defaultSelectedKeys={["user"]}
                {...registerMainForm("role", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.role}
                errorMessage={`${errorsMainForm.role?.message}`}
                label="สิทธิ์การเข้าถึง"
              >
                <SelectItem key="user">ผู้ใช้งานทั่วไป</SelectItem>
                <SelectItem key="admin">เจ้าหน้าที่จัดการเนื้อหา</SelectItem>
                <SelectItem key="superAdmin">เจ้าหน้าที่ขั้นสูงสุด</SelectItem>
              </Select>

              <Select
                size="sm"
                variant="bordered"
                required
                {...registerMainForm("status", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.status}
                errorMessage={`${errorsMainForm.status?.message}`}
                defaultSelectedKeys={["activate"]}
                label="สถานะผู้ใช้งาน"
              >
                <SelectItem key="activate">เปิดการใช้งาน</SelectItem>
                <SelectItem key="deactivate">ปิดการใช้งาน</SelectItem>
              </Select>

              <Textarea
                size="sm"
                variant="bordered"
                label="แนะนำตัวสั้นๆ"
                labelPlacement="inside"
                {...registerMainForm("shortDescription")}
                minRows={10}
              />

              <Input
                size="sm"
                variant="bordered"
                label="ชื่อ-นามสกุล"
                labelPlacement="inside"
                isInvalid={!!errorsMainForm.name}
                errorMessage={`${errorsMainForm.name?.message}`}
                {...registerMainForm("name", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  pattern: {
                    value: checkEmpty(),
                    message: errorRequire(),
                  },
                })}
              />

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("email", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  pattern: {
                    value: regexEmail(),
                    message: errorEmail(),
                  },
                })}
                label="อีเมล"
                isInvalid={!!errorsMainForm.email}
                errorMessage={`${errorsMainForm.email?.message}`}
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("personalId", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  pattern: {
                    value: regexThaiID(),
                    message: errorThaiID(),
                  },
                })}
                isInvalid={!!errorsMainForm.personalId}
                errorMessage={`${errorsMainForm.personalId?.message}`}
                label="เลขที่บัตรประชาชน"
                labelPlacement="inside"
              />

              {!isCreateMode && (
                <Switch
                  checked={isChangePassword}
                  onChange={() => setIsChangePassword(!isChangePassword)}
                >
                  เปลี่ยนรหัสผ่าน
                </Switch>
              )}

              {isChangePassword && (
                <>
                  <Input
                    size="sm"
                    variant="bordered"
                    {...registerMainForm("password", {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                      pattern: {
                        value: checkEmpty(),
                        message: errorRequire(),
                      },
                    })}
                    type="password"
                    label="รหัสผ่าน"
                    isInvalid={!!errorsMainForm.password}
                    errorMessage={`${errorsMainForm.password?.message}`}
                    labelPlacement="inside"
                  />

                  <Input
                    size="sm"
                    variant="bordered"
                    label="รหัสผ่านอีกครั้ง"
                    isInvalid={!!errorsMainForm.confirmPassword}
                    errorMessage={`${errorsMainForm.confirmPassword?.message}`}
                    {...registerMainForm("confirmPassword", {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                      pattern: {
                        value: checkEmpty(),
                        message: errorRequire(),
                      },
                      validate: (value) => {
                        const { password } = getValuesMainForm();
                        return value === password || errorPasswordNotMatch();
                      },
                    })}
                    labelPlacement="inside"
                    type="password"
                  />
                </>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end space-x-2">
              <Button
                isLoading={isLoadingApi}
                startContent={!isLoadingApi && <CircleCheck />}
                className="bg-main text-white"
                onClick={handleSubmitMainForm(async (data) => {
                  isCreateMode
                    ? await apiCreateUser(data)
                    : await apiUpdateUser(data);
                })}
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
    apiGetUsers(currentPage);
  }, []);

  return (
    <Layout isAdmin>
      <NextSeo
        title={`จัดการผู้ใช้งาน - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {modalFormData()}

      <Header
        label={"จัดการผู้ใช้งาน"}
        isAdmin
        adminControl={
          <>
            <Button
              variant="bordered"
              onClick={() => {
                resetMainForm(initForm);
                setIsApiError(false);
                setIsCreateMode(true);
                setIsChangePassword(true);
                onOpenMainForm();
              }}
              startContent={<PlusCircle />}
            >
              เพิ่มผู้ใช้งานใหม่
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
                          await apiDeleteUser(users?.data[id]?.id);
                        }
                        setSelectedKeys(new Set());
                      } else {
                        users?.data?.forEach(async (item: any) => {
                          await apiDeleteUser(item.id);
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
          <TableColumn>ชื่อ-นามสกุล</TableColumn>
          <TableColumn>อีเมล</TableColumn>
          <TableColumn>เลขที่บัตรประชาชน</TableColumn>
          <TableColumn>สิทธิ์การเข้าถึง</TableColumn>
          <TableColumn>สถานะผู้ใช้งาน</TableColumn>
          <TableColumn>วันที่สร้าง</TableColumn>
          <TableColumn>วันที่อัพเดต</TableColumn>
          <TableColumn>
            <span>เมนูจัดการ</span>
          </TableColumn>
        </TableHeader>
        <TableBody className={`divide-y`}>
          {users?.data?.map((item: any, index: any) => {
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
                <TableCell className="min-w-40 xl:min-w-32">
                  {truncateText(item.name, 85)}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item?.email ?? "-"}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item?.personalId ?? "-"}
                </TableCell>
                <TableCell>
                  {item.role === "user" ? (
                    <Chip size="sm" variant="flat" color="success">
                      ผู้ใช้งาน
                    </Chip>
                  ) : item.role === "admin" ? (
                    <Chip color="secondary" size="sm" variant="flat">
                      ผู้จัดการเนื้อหา
                    </Chip>
                  ) : (
                    <Chip color="danger" size="sm" variant="flat">
                      ผู้ดูแลระบบ
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  {item.status === "activate" ? (
                    <Chip color="success" size="sm" variant="flat">
                      กำลังใช้งานอยู่
                    </Chip>
                  ) : (
                    <Chip color="danger" size="sm" variant="flat">
                      ปิดการใช้งาน
                    </Chip>
                  )}
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
                          setIsCreateMode(false);
                          setUserId(item.id);
                          setIsChangePassword(false);
                          await apiGetUser(item.id);
                          onOpenMainForm();
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
                            apiDeleteUser(item.id);
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
          total={users?.allPages}
          initialPage={1}
          onChange={async (e) => {
            setCurrentPage(e);
            await apiGetUsers(e);
          }}
        />
      </div>
    </Layout>
  );
}
