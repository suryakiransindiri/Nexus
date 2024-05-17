import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import "./friends.css";
import { setSnack } from "src/redux/reducers/snack.reducer";
export default function Friends() {
  const dispatch = useAppDispatch();
  const { user, socket } = useAppSelector((state) => ({
    user: state.auth.user,
    socket: state.socket.socket,
  }));
  const previewImg = "https://source.unsplash.com/TMgQMXoglsM/500x350";
  return (
    <div className="container">
      <div className="row">
        {user?.requests.map((friend) => (
          <div className="col-xl-3 col-md-6 mb-4" key={friend._id}>
            <div className="card border-0 shadow">
              <img
                src={friend.photoURL || previewImg}
                className="card-img-top"
                alt="..."
              />
              <div className="card-body text-center">
                <h5 className="card-title mb-0">{friend.displayName}</h5>
                <div className="card-text text-black-50">{friend.email}</div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    const obj = {
                      receiver: user?._id,
                      sender: friend._id,
                    };
                    socket?.emit("accept-friend-request", obj);
                    dispatch(
                      setSnack({
                        open: true,
                        message: "Friend request accepted",
                        type: "success",
                      })
                    );
                  }}
                  className="form-control"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    const obj = {
                      receiver: user?._id,
                      sender: friend._id,
                    };
                    socket?.emit("reject-friend-request", obj);
                    dispatch(
                      setSnack({
                        open: true,
                        message: "Friend request rejected",
                        type: "error",
                      })
                    );
                  }}
                  className="form-control mt-2"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {user?.friends.map((friend) => (
          <div className="col-xl-3 col-md-6 mb-4" key={friend._id}>
            <div className="card border-0 shadow">
              <img
                src={friend.photoURL || previewImg}
                className="card-img-top"
                alt="..."
              />
              <div className="card-body text-center">
                <h5 className="card-title mb-0">{friend.displayName}</h5>
                <div className="card-text text-black-50">{friend.email}</div>
              </div>
              <div className="p-3">
                <button
                  onClick={() => {
                    socket?.emit("unfriend-user", {
                      receiver: user?._id,
                      sender: friend._id,
                    });
                  }}
                  className="form-control"
                >
                  unfriend
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
