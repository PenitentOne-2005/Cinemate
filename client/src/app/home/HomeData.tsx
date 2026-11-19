import type {
  Friend,
  FriendRequest,
} from "../services/friendship/friendship.types";
import type {
  Room,
  RoomWithOwner,
} from "../services/rooms/rooms.service.types";
import { serverApiRequest } from "../services/server";
import HomePage from "./HomePage";

const HomeData = async () => {
  const [
    friendsData,
    requestsData,
    myRoomsData,
    invitedRoomsData,
    publicRoomsData,
  ] = await Promise.all([
    serverApiRequest<Friend[]>("/friendships"),
    serverApiRequest<FriendRequest[]>("/friendships/requests/received"),
    serverApiRequest<Room[]>("/rooms/my"),
    serverApiRequest<RoomWithOwner[]>("/rooms/invited"),
    serverApiRequest<RoomWithOwner[]>("/rooms/public"),
  ]);

  return (
    <HomePage
      initialFriends={friendsData}
      initialRequests={requestsData}
      initialMyRooms={myRoomsData}
      initialInvitedRooms={invitedRoomsData}
      initialPublicRooms={publicRoomsData}
    />
  );
};

export default HomeData;
