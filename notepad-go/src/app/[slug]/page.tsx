"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import ToolbarButton from "@/components/ui/toolbarButton";

let ws: WebSocket | null = null;

export default function SlugPage() {
  const params = useParams();
  const fullSlug = params.slug as string | undefined;

  const [connected, setConnected] = useState(false);
  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    immediatelyRender: false,

    onUpdate({ editor }) {
      // 🔒 bloqueia loop de atualização
      if (isRemoteUpdate.current) return;
      if (!connected || !fullSlug || !ws) return;

      ws.send(
        JSON.stringify({
          type: "text-change",
          roomId: fullSlug,
          content: editor.getHTML(),
        })
      );
    },
  });

  useEffect(() => {
    if (!fullSlug || !editor) return;

    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let localWs: WebSocket | null = null;

    function connect() {
      if (localWs) {
        localWs.close();
        localWs = null;
      }

      localWs = new WebSocket("ws://localhost:5001/socket");
      ws = localWs;

      localWs.onopen = () => {
        setConnected(true);
        localWs?.send(
          JSON.stringify({
            type: "join",
            roomId: fullSlug,
          })
        );
      };

      localWs.onmessage = (event) => {
        const msg = JSON.parse(event.data) as {
          type: string;
          content?: string;
        };

        if (msg.type === "receive-change" && msg.content) {
          isRemoteUpdate.current = true;
          editor.commands.setContent(msg.content, false);
          isRemoteUpdate.current = false;
        }
      };

      localWs.onclose = () => {
        setConnected(false);
        retryTimeout = setTimeout(connect, 1000);
      };

      localWs.onerror = () => {
        localWs?.close();
      };
    }

    connect();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (localWs) {
        localWs.onclose = null;
        localWs.close();
      }
      ws = null;
    };
  }, [fullSlug, editor]);

  if (!fullSlug) return <p>Carregando sala...</p>;

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl w-full flex flex-col">
        <div className="text-xs text-gray-500 p-3 border-b">
          Sala: {fullSlug} {connected ? "🟢" : "🔴"}
        </div>

        <div className="border-b p-3 flex flex-wrap gap-2 bg-gray-50">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
          >
            B
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
          >
            I
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
          >
            U
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
          >
            S
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            P
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          >
            ⬅
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          >
            ⬍
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          >
            ➡
          </ToolbarButton>
        </div>

        <div className="flex-1 p-5 prose max-w-none overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </main>
  );
}
