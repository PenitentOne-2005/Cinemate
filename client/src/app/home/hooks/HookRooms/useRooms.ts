import { useCallback, useState } from "react";
import { roomService } from "@/app/services";
import type { UseRoomsProps } from "./interface";
import type {
  CreateRoomData,
  Room,
  RoomWithOwner,
} from "@/app/services/rooms/rooms.service.types";

const useRooms = ({
  initialMyRooms,
  initialInvitedRooms,
  initialPublicRooms,
}: UseRoomsProps) => {
  const [myRooms, setMyRooms] = useState<Room[]>(() => initialMyRooms);

  const [invitedRooms, setInvitedRooms] = useState<RoomWithOwner[]>(
    () => initialInvitedRooms,
  );
  const [publicRooms, setPublicRooms] = useState<RoomWithOwner[]>(
    () => initialPublicRooms,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [busyRoomId, setBusyRoomId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRooms = useCallback(async () => {
    try {
      const [myRoomsData, invitedRoomsData, publicRoomsData] =
        await Promise.all([
          roomService.getMyRooms(),
          roomService.getInvitedRooms(),
          roomService.getPublicRooms(),
        ]);

      setMyRooms(myRoomsData);
      setInvitedRooms(invitedRoomsData);
      setPublicRooms(publicRoomsData);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms.");

      return false;
    }
  }, []);

  const handleCreateRoom = async (data: CreateRoomData) => {
    setIsCreating(true);
    setMessage("");
    setError("");

    try {
      const createdRoom = await roomService.createRoom(data);

      setMyRooms((prev) => [createdRoom, ...prev]);
      setMessage("Room successfully created.");

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room.");

      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const confirmed = window.confirm("Do you really want to delete this room?");

    if (!confirmed) return;

    setBusyRoomId(roomId);
    setMessage("");
    setError("");

    try {
      const result = await roomService.deleteRoom(roomId);

      setMyRooms((prev) => prev.filter((room) => room.id !== roomId));
      setInvitedRooms((prev) => prev.filter((room) => room.id !== roomId));
      setPublicRooms((prev) => prev.filter((room) => room.id !== roomId));

      setMessage(result.message || "The room has been removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete the room.",
      );
    } finally {
      setBusyRoomId(null);
    }
  };

  const refreshRooms = async () => {
    setIsLoading(true);
    setError("");

    try {
      await loadRooms();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    myRooms,
    invitedRooms,
    publicRooms,
    isLoading,
    isCreating,
    busyRoomId,
    message,
    error,
    handleCreateRoom,
    handleDeleteRoom,
    refreshRooms,
  };
};

export default useRooms;
