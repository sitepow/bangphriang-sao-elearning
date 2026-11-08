import { apiEndpoint, axiosInstance, convertSecondsToHMS } from "@/helpers";
import { Card } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import ErrorNotification from "./ErrorNotification";

export default function VideoPlayer({
  isNotCourse,
  course,
  videos,
  questionHead,
  setUser,
  user,
}: any) {
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const videoRefs = useRef<any>([]);
  const router = useRouter();

  useEffect(() => {
    if (currentVideo !== null) {
      videoRefs.current.forEach((video: any, index: any) => {
        if (video && index !== currentVideo.index) {
          video.pause();
        }
      });
    }
  }, [currentVideo]);

  const apiUpdateVideoStatus = async (newuser?: any) => {
    try {
      await axiosInstance.patch(
        `${apiEndpoint}/api/v1/content/log/${user.id}`,
        newuser ? newuser : user
      );
    } catch (error) {
      console.error("Error updating video status:", error);
    }
  };

  const handlePlay = async (index: number) => {
    const videoId = videos[index].id;
    const currentTime = videoRefs.current[index]?.currentTime || 0;
    const duration = videoRefs.current[index]?.duration || 0;

    setCurrentVideo({ index, videoId });

    setUser((prev: any) => {
      const videoStatus = [...prev.videoStatus];
      const videoIndex = videoStatus.findIndex(
        (item: any) => item.videoId === videoId
      );
      if (videoIndex === -1) {
        videoStatus.push({ videoId, allTimeSpent: currentTime, duration });
      } else {
        videoStatus[videoIndex] = {
          ...videoStatus[videoIndex],
          allTimeSpent: currentTime,
          duration,
        };
      }
      return { ...prev, videoStatus };
    });

    const allTimeSpent = user?.videoStatus?.find(
      (v: any) => v.videoId === videoId
    )?.allTimeSpent;

    if (allTimeSpent !== undefined && !isNaN(allTimeSpent)) {
      videoRefs.current[index].currentTime = allTimeSpent;
    }

    if (videoRefs.current[index]?.paused) {
      videoRefs.current[index]?.play();
    }
  };

  const handlePause = async (index: number) => {
    const videoId = videos[index].id;
    const currentTime = videoRefs.current[index]?.currentTime || 0;
    const duration = videoRefs.current[index]?.duration || 0;

    await apiUpdateVideoStatus();

    setUser((prev: any) => {
      const videoStatus = [...prev.videoStatus];
      const videoIndex = videoStatus.findIndex(
        (item: any) => item.videoId === videoId
      );
      if (videoIndex !== -1) {
        videoStatus[videoIndex] = {
          ...videoStatus[videoIndex],
          allTimeSpent: Math.min(duration, currentTime),
        };
      }
      return { ...prev, videoStatus };
    });
  };

  const handleTimeUpdate = async (index: number) => {
    const videoId = videos[index].id;
    const currentTime = videoRefs.current[index]?.currentTime || 0;

    setUser((prev: any) => {
      const videoStatus = [...prev.videoStatus];
      const videoIndex = videoStatus.findIndex(
        (item: any) => item.videoId === videoId
      );
      if (videoIndex !== -1) {
        videoStatus[videoIndex] = {
          ...videoStatus[videoIndex],
          allTimeSpent: currentTime,
        };
      }
      return { ...prev, videoStatus };
    });

    await apiUpdateVideoStatus();
  };

  const checkVideoComplete = async () => {
    try {
      const videoIds = videos.map((video: any) => video.id);

      const videoFiltered = user?.videoStatus.filter((videoStatus: any) =>
        videoIds.includes(videoStatus.videoId)
      );

      if (user?.videoStatus?.length == 0) return;

      if (user?.questionStatus !== "complete") {
        const isAllVideoComplete =
          videoFiltered?.filter(
            (item: any) =>
              Math.floor(item.allTimeSpent) === Math.floor(item.duration)
          ).length === videos.length;

        if (!isAllVideoComplete) return;

        if (isAllVideoComplete) {
          if (questionHead) {
            await apiUpdateVideoStatus({
              ...user,
              isContentRead: true,
              questionStatus: "afterLearning",
            });
          } else {
            await apiUpdateVideoStatus({
              ...user,
              isContentRead: true,
              questionStatus: "complete",
              status: "complete",
            });
          }

          router.reload();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkVideoComplete();
  }, [user, router]);

  const handleVideoEnd = async () => {
    await apiUpdateVideoStatus();
    await checkVideoComplete();
  };

  return (
    <div className="w-full justify-center items-center flex flex-col space-y-2">
      {user &&
        user?.status !== "complete" &&
        user?.status !== "unComplete" &&
        !isNotCourse &&
        course &&
        videos?.length > 0 && (
          <>
            <ErrorNotification isWarning>
              คุณจะผ่านบทความนี้ได้ก็ต่อเมื่อ
              คุณรับชมวิดีโอข้างล่างนี้จนหมดทุกรายการ
              ระบบจะบันทึกเวลาที่ท่านดูล่าสุด
              เมื่อรับชมเสร็จระบบจะโหลดเว็บไซต์ใหม่
            </ErrorNotification>
          </>
        )}

      {videos.map((item: any, index: any) => {
        const videoStatus = user?.videoStatus.find(
          (vItem: any) => vItem.videoId == item.id
        );

        const isVideoComplete =
          Math.floor(videoStatus?.allTimeSpent) ==
          Math.floor(videoStatus?.duration);

        return (
          <Card shadow="sm" className="w-full" key={item.id}>
            <div className="w-full flex flex-col space-y-2 justify-center items-center text-center">
              <video
                className="max-h-[500px] w-full object-cover rounded-large shadow-medium"
                src={`${apiEndpoint}/videos/${item.videoPath}`}
                ref={(el: any) => {
                  if (!user || isNotCourse || !course) return;

                  videoRefs.current[index] = el;
                }}
                onClick={() => {
                  if (!user || isNotCourse || !course) return;

                  videoRefs.current[index]?.paused
                    ? videoRefs.current[index]?.play()
                    : videoRefs.current[index]?.pause();
                }}
                controls={
                  !user || isNotCourse ? true : isVideoComplete || !course
                }
                onPlay={() => {
                  if (!user || isNotCourse || !course) return;

                  if (!isVideoComplete) {
                    handlePlay(index);
                  }
                }}
                onPause={() => {
                  if (!user || isNotCourse || !course) return;

                  if (!isVideoComplete) {
                    handlePause(index);
                  }
                }}
                onTimeUpdate={() => {
                  if (!user || isNotCourse || !course) return;

                  if (!isVideoComplete) {
                    handleTimeUpdate(index);
                  }
                }}
                onEnded={() => {
                  if (!user || isNotCourse || !course) return;

                  handleVideoEnd();
                }}
              />

              <div className="flex flex-col gap-2 w-full p-2">
                <div className="flex flex-wrap text-start justify-between">
                  <span>{item.description}</span>

                  <div className="flex flex-wrap gap-2">
                    <span className="w-fit">
                      ระยะเวลาที่ดูล่าสุด :{" "}
                      {convertSecondsToHMS(
                        user?.videoStatus?.find(
                          (v: any) => v.videoId === item.id
                        )?.allTimeSpent ?? "0"
                      )}
                    </span>
                    ,
                    <span className="w-fit">
                      ระยะเวลาทั้งหมด :{" "}
                      {convertSecondsToHMS(
                        user?.videoStatus?.find(
                          (v: any) => v.videoId === item.id
                        )?.duration ?? "0"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
