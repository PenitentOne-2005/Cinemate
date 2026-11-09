import { Suspense } from "react";
import ProfileData from "./ProfileData";

const ProfilePage = async () => {
  return (
    <Suspense
      fallback={
        <div style={{ color: "white", padding: "20px" }}>
          Загрузка профиля...
        </div>
      }
    >
      <ProfileData />
    </Suspense>
  );
};

export default ProfilePage;
