import type { AuthUser } from "../shared/types";
import { serverApiRequest } from "../services/server";
import ProfileClient from "./ProfileClient";

const ProfileData = async () => {
  const user = await serverApiRequest<AuthUser>("/auth/me");

  return <ProfileClient user={user} />;
};

export default ProfileData;
