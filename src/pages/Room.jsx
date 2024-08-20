import React, { useEffect, useState } from "react";
import { client, databases } from "../appwrite/config";
import { ID, Query } from "appwrite";
import { Trash2 } from "react-feather";

const Room = () => {
  const dbId = import.meta.env.VITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_COLLECTION_ID;

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
      body: messageBody,
    };

    let response = await databases.createDocument(
      dbId,
      collectionId,
      ID.unique(),
      payload
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
                <small className="message-timestamp">
                  {new Date(m.$createdAt).toLocaleString()}
                </small>

                <Trash2
                  onClick={() => {
                    deleteMessage(m.$id);
                  }}
                  className="delete--btn"
                />
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
