import { apiEndpoint, axiosInstance } from "@/helpers";
import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { deleteCookie } from "cookies-next";
import { LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function UserPanel({ auth, onOpenProfileForm }: any) {
  const router = useRouter();
  const [user, setUser] = useState<any>();

  const handleLogout = async () => {
    try {
      deleteCookie("auth");
      router.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetUser = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/user/${auth?.id}`
      );

      setUser(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    apiGetUser();
  }, [auth]);

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <div className="flex gap-3 items-center">
          <Avatar
            as="button"
            src={
              user?.imagePath
                ? `${apiEndpoint}/images/${user.imagePath}`
                : "/images/no-image.jpg"
            }
          />
          <span className="hidden sm:block">{user?.name}</span>
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem
          key="profile"
          className="h-14 gap-2 border-b dark:border-dark"
          onClick={onOpenProfileForm}
        >
          <p>{user?.name}</p>
          <p className="opacity-80">{user?.email}</p>
        </DropdownItem>
        <DropdownItem onClick={handleLogout}>
          <div className="flex gap-2">
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
