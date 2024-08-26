import { Call, StreamVideo } from "@stream-io/video-react-sdk"
import { useUser } from "../../user-contex"
import { Navigate, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";

interface NewRoom {
    name: string,
    description: string
}

interface Room {
    id:string,
    title:string,
    description:string,
    participantsLength: number,
    createdBy: string
}

export const MainPage = () => {

    const {client, user, setCall, isLoadingClient} = useUser();

    const [newRoom, setNewRoom] = useState<NewRoom>({name: "", description: ""});

    const [avalibaleRooms, setAvalibaleRooms] = useState<Room[]>([]);

    

    const hashRoomName = (roomName: string): string => {
        const hash = CryptoJS.SHA256(roomName).toString(CryptoJS.enc.Base64);
        return hash.replace(/[^a-zA-Z0-9_-]/g, "");
      };

    const navigate = useNavigate();

    useEffect(() => {
        if (client) fetchListOfCalls();
      }, [client]);

    const createRoom = async () => {
        const {name, description} = newRoom;
        if(!client || !user || !name || !description) return;

        const call = client.call("audio_room", hashRoomName(name));
        await call.join({
            create: true,
            data: {
                members: [{user_id: user.username}],
                custom: {
                    title: name,
                    description,
                }
            }
        });

        setCall(call);
        navigate("/room");
    }   

    const joinRoom = async (roomId: string) => {
        const call = client?.call("audio_room", roomId);
        try{
            await call?.join();
            setCall(call);
            navigate("/room");
        } catch (err) {
            alert("Error while joining, please wait for room to be live.")
        }

    };

    type CustomCallData = {
        description?: string;
    
        title?: string;
    };

    const fetchListOfCalls = async () => {
        const callsQueryResponse = await client?.queryCalls({
          filter_conditions: { ongoing: true },
          limit: 25,
          watch: true,
        });
        if (!callsQueryResponse) {
          console.log("Error fetching calls");
        } else {
          const getCallInfo = async (call: Call): Promise<Room> => {
            const callInfo = await call.get();
            const customData = callInfo.call.custom;
            const { title, description } = (customData || {}) as CustomCallData;
            const participantsLength = callInfo.members.length ?? 0;
            const createdBy = callInfo.call.created_by.name ?? "";
            const id = callInfo.call.id ?? "";
            return {
              id,
              title: title ?? "",
              description: description ?? "",
              participantsLength,
              createdBy,
            } as Room;
          };
          const roomPromises = await callsQueryResponse.calls.map((call) =>
            getCallInfo(call)
          );
          const rooms = await Promise.all(roomPromises);
          setAvalibaleRooms(rooms);
        }
      };

    if (isLoadingClient) return <h1>...</h1>;

    if((!isLoadingClient && !user) || (!isLoadingClient && !client)) 
        return <Navigate to="/sign-in"/>;

    return(
        <StreamVideo client={client!}>
            <div className="home">
                <h1>Welcome {user?.name}</h1>
                <div className="form">
                    <h2>Create Your Room</h2>
                    <input type="text" placeholder="Room Name..." onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) => setNewRoom((perv) => ({...perv, name: event.target.value}))}/>
                    <input type="text" placeholder="Room Description..." onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) => setNewRoom((perv) => ({...perv, description: event.target.value}))}/>
                    <button onClick={createRoom} style={{ backgroundColor: "rgb(125, 7, 236)" }}>Create Room</button>
                </div>
                {avalibaleRooms.length !== 0 ? <>
                    <h2>Avalibale Rooms</h2>
                    <div className="grid">
                        {avalibaleRooms.map((room) => (
                            <div
                            className="card"
                            key={room.id}
                            onClick={() => joinRoom(room.id)}
                            >
                            <h4>{room.title}</h4>
                            <p>{room.description}</p>
                            <p> {room.participantsLength} Participants</p>
                            <p> Created By: {room.createdBy}</p>
                            <div className="shine"></div>
                            </div>
                        ))}
                        </div>
                </> : <h2>No Avalibale Rooms at the Time</h2>}
            </div>
        </StreamVideo>
    )
}