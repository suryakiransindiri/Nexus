import { useAppSelector } from "src/redux/hooks";
import Page from "../../components/Page";
import "./home.css";
import moment from "moment";
import { Icon } from "@iconify/react";
import CommentComponent from "components/CommentComponent";
import CreatePostComponent from "components/CreatePostComponent";
import { orderBy } from "lodash";

export default function Home() {
  const { posts, socket, user } = useAppSelector((state) => ({
    posts: state.posts.posts,
    socket: state.socket.socket,
    user: state.auth.user,
  }));
  return (
    <Page title="Home">
      <div className="container">
        <CreatePostComponent />
        {orderBy(posts,'timestamp','desc').map((post) => (
          <div className="well mb-5 p-3 border rounded" key={post._id}>
            <div className="media">
              <a className="pull-left" href="#">
                <img
                  className="media-object"
                  style={{ width: 50, height: 50, borderRadius: 50 }}
                  src={post.owner.photoURL}
                />
              </a>
              <div className="media-body">
                <h4 className="media-heading">{post.owner.displayName}</h4>
                <p className="text-right">
                  {moment(post.timestamp).format("DD MMM")}
                </p>
                <p>{post.text}</p>
                {post.type.includes("image") && (
                  <img
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    src={post.content}
                    alt={post.text}
                  />
                )}
                {post.type.includes("video") && (
                  <video
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    controls
                    src={post.content}
                  />
                )}
                {post.type.includes("text") && (
                  <div className="p-3 border">
                    <h3>{post.content}</h3>
                  </div>
                )}
                <ul className="list-inline list-unstyled mt-3">
                  <li>
                    <button
                      style={{ border: "none", padding: 8 }}
                      onClick={() => {
                        if (post.likes?.includes(`${user?._id}`)) {
                          socket?.emit("unlike-post", {
                            post_id: post._id,
                            user_id: user?._id,
                          });
                        } else {
                          socket?.emit("like-post", {
                            post_id: post._id,
                            user_id: user?._id,
                          });
                        }
                      }}
                    >
                      {post.likes.includes(`${user?._id}`) ? (
                        <Icon
                          icon="mdi:like"
                          style={{ fontSize: 20, color: " #17A9FD" }}
                        />
                      ) : (
                        <Icon icon="ei:like" style={{ fontSize: 26 }} />
                      )}
                      {post.likes.length} Likes
                    </button>
                    <button
                      // onClick={() => setShowCommentDialog(true)}
                      style={{ border: "none", marginLeft: 8, padding: 8 }}
                    >
                      <Icon
                        icon="teenyicons:chat-outline"
                        style={{ fontSize: 16, marginRight: 8 }}
                      />
                      {post.comments.length} Comments
                    </button>
                  </li>
                </ul>

                <CommentComponent {...post} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
