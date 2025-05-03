"use client";
import { FiAlertCircle } from "react-icons/fi";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";

type Message = {
  sender: "user" | "ai" | "note";
  text: string;
};

const ChatPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setUserInput(target.value);
  };

  const handleClick = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const message = userInput.trim().toLowerCase();

    // Append user message
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setUserInput("");

    if (message === "stop" || message === "stop recording") {
      const stoppedText = "Stopped recording. I’ll let you know when the transcription is complete.";
      let stopMessageIndex = -1;
      let currentText = "";
    
      setTimeout(() => {
        setMessages((prev) => {
          stopMessageIndex = prev.length;
          return [...prev, { sender: "ai", text: "" }];
        });
    
        let i = 0;
        const interval = setInterval(() => {
          currentText += stoppedText[i];
          i++;
    
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[stopMessageIndex]) {
              updated[stopMessageIndex] = { sender: "ai", text: currentText };
            }
            return updated;
          });
    
          if (i >= stoppedText.length) clearInterval(interval);
        }, 50);
      }, 5000);
    
 
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "note",
            text: "This may take more time than usual if models are running on CPU.",
          },
        ]);
      }, 5000);
    }
    

    try {
      const req = new Request("http://127.0.0.1:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
      });
    
      const res = await fetch(req);
      const data = await res.json();
    
      if (data.response) {
        const aiText = data.response;
        let currentText = "";
        let apiMessageIndex = -1;
    
 
        setMessages((prev) => {
          apiMessageIndex = prev.length;
          return [...prev, { sender: "ai", text: "" }];
        });
    
        for (let i = 0; i < aiText.length; i++) {
          currentText += aiText[i];
          await new Promise((resolve) => setTimeout(resolve, 20));
    
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[apiMessageIndex]) {
              updated[apiMessageIndex] = { sender: "ai", text: currentText };
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("Error sending request:", err);
    }
    
  };


  return (
    <div className="flex min-h-screen">
    <div className="w-[25%] bg-zinc-900 p-6 flex flex-col justify-between">
      <div>
        <Link className="hover:text-green-500 text-white" href={'/'}>Home</Link>
        <img src="/logo1.png" alt="EchoNote Logo" className="w-32 mx-auto mb-8" />
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          Start by saying <strong>"start"</strong> to begin your conversation.<br />
          Say <strong>"stop"</strong> when meeting ends. Ask questions once transcription is completed.
        </p>
      </div>
      <p className="text-xs text-zinc-700 text-center mt-6">
        EchoNote &copy; {new Date().getFullYear()}
      </p>
    </div>


    <div className="bg-zinc-950 w-[75%] text-gray-300 min-h-screen flex flex-col">
    {messages.length === 0 && (
  <div className="p-4 rounded-xl bg-zinc-950 text-xl font-mono text-gray-300 max-w-[100%] flex flex-col justify-center items-center gap-2 shadow">
    <p className="">Welcome! I'm here to assist you</p>  
    <p>feel free to start a conversation.</p>
  </div>
)}
      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl flex gap-2 shadow max-w-[60%] ${msg.sender === "user"
                  ? "bg-zinc-700 self-end ml-auto w-96 text-gray-300 text-left"
                  : msg.sender === "ai"
                    ? "bg-zinc-800 self-start text-gray-300"
                    : "text-xs text-gray-300 w-96 text-left mt-1"
                }`}
            >

              {msg.sender === "note" && (
               <div className="p-2"><FiAlertCircle /></div>
               
              )}
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-800 px-4 py-4 border-t border-zinc-700">
        <form className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            onChange={handleChange}
            value={userInput}
            id="chat"
            className="flex-1  resize-none bg-zinc-700 text-white text-sm rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            placeholder="Send a message..."
          />
          <button
            onClick={handleClick}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <svg
              style={{ transform: "rotate(85deg)" }}
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default ChatPage;
