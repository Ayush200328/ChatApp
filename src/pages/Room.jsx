import React, { useEffect, useState } from "react";
import { client, databases } from "../appwrite/config";
import { ID, Query, Role, Permission } from "appwrite";
import { Trash2 } from "react-feather";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";

const Room = () => {
  const dbId = import.meta.env.VITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_COLLECTION_ID;

  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    getMessages();

    const unsubscribe = client.subscribe(
      `databases.${dbId}.collections.${collectionId}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          setMessages((_) => [response.payload, ..._]);
        }
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          setMessages((_) => _.filter((m) => m.$id !== response.payload.$id));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      user_id: user.$id,
      username: user.name,
      body: messageBody,
    };

    let permissions = [Permission.write(Role.user(user.$id))];

    let response = await databases.createDocument(
      dbId,
      collectionId,
      ID.unique(),
      payload,
      permissions
    );

    setMessageBody("");
  };

  const getMessages = async () => {
    const response = await databases.listDocuments(dbId, collectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    setMessages(response.documents);
  };

  const deleteMessage = async (message_id) => {
    let response = await databases.deleteDocument(
      dbId,
      collectionId,
      message_id
    );
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form onSubmit={handleSubmit} id="message--form">
          <div>
            <textarea
              required
              maxLength={1000}
              placeholder="Type something"
              onChange={(e) => {
                setMessageBody(e.target.value);
              }}
              value={messageBody}
            ></textarea>
            <div className="send-btn--wrapper">
              <input
                type="submit"
                value="Send"
                className="btn btn--secondary"
              />
            </div>
          </div>
        </form>

        <div>
          {messages.map((m) => (
            <div key={m.$id} className="message--wrapper">
              <div className="message--header">
                <p>
                  {m.username ? (
                    <span>{m.username}</span>
                  ) : (
                    <span>Anonymous user</span>
                  )}
                  <small className="message-timestamp">
                    {new Date(m.$createdAt).toLocaleString()}
                  </small>
                </p>

                {m.$permissions.includes(`delete(\"user:${user.$id}\")`) && (
                  <Trash2
                    onClick={() => {
                      deleteMessage(m.$id);
                    }}
                    className="delete--btn"
                  />
                )}
              </div>

              <div className="message--body">
                <span>{m.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Room;
