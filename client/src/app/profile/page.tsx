import { Suspense } from "react";
import ProfileData from "./ProfileData";
import { Loader } from "../components";

const ProfilePage = async () => {
  return (
    <Suspense fallback={<Loader />}>
      <ProfileData />
    </Suspense>
  );
};

export default ProfilePage;
