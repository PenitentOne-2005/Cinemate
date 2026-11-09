import type {
  Friend,
  FriendRequest,
} from "../services/friendship/friendship.types";
import { serverApiRequest } from "../services/server";
import HomePage from "./HomePage";

const HomeData = async () => {
  const [friendsData, requestsData] = await Promise.all([
    serverApiRequest<Friend[]>("/friendships"),
    serverApiRequest<FriendRequest[]>("/friendships/requests/received"),
  ]);

  return (
    <HomePage initialFriends={friendsData} initialRequests={requestsData} />
  );
};

export default HomeData;
