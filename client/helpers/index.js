import axios from "axios";
import { getCookie } from "cookies-next";
import jwt from "jsonwebtoken";

const convertSecondsToHMS = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
};

const getAuth = () => {
  const authCookie = getCookie("auth");

  if (authCookie) {
    try {
      let auth = JSON.parse(authCookie);
      const decodedToken = jwt.decode(auth.accessToken);

      if (decodedToken && typeof decodedToken === "object") {
        return {
          ...decodedToken,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        };
      } else {
        return undefined;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return null;
};

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(
  (config) => {
    const authCookie = getCookie("auth");

    if (authCookie) {
      const token = JSON.parse(authCookie).accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const apiEndpoint =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : process.env.API_URL;

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function toThaiDate(isoDate) {
  const date = new Date(isoDate);

  const thaiYear = date.getFullYear() + 543;

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];

  return `${day} ${month} ${thaiYear}`;
}

const convertDateToThai = (inputDate) => {
  const date = new Date(inputDate);

  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};

const truncateText = (text, maxLength) => {
  if (!text) return text;
  return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
};

const convertTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

export {
  apiEndpoint,
  axiosInstance,
  convertDateToThai,
  truncateText,
  convertTimestamp,
  getAuth,
  toThaiDate,
  convertSecondsToHMS,
};
