"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useAuth } from "@/context/AuthContext";

import DefinePasswordButton from "@/components/DefinePasswordButton";
import DefinePasswordModal from "@/components/pasawordModal";
import EnterSlugPasswordModal from "@/components/EnterSlugPasswordModal";
import ToolbarButton from "@/components/ui/toolbarButton";
import ButtonDeletePassword from "@/components/ui/buttonDeletePassword";

let ws: WebSocket | null = null;

export default function SlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { getSlugToken, hasSlugToken, isAuthenticated } = useAuth();

  const [connected, setConnected] = useState(false);
  const [showDefinePasswordModal, setShowDefinePasswordModal] = useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      if (isRemoteUpdate.current) return;
      if (!ws) return;

      ws.send(
        JSON.stringify({
          type: "text-change",
          roomId: slug,
          content: editor.getHTML(),
        }),
      );
    },
  });

  useEffect(() => {
    fetch(`http://localhost:5001/slug/${slug}/has-password`)
      .then((res) => res.json())
      .then((data) => setHasPassword(data.hasPassword))
      .catch(() => setHasPassword(false));
  }, [slug]);

  useEffect(() => {
    if (!editor) return;

    const slugToken = getSlugToken(slug);

    ws = new WebSocket("ws://localhost:5001/socket");

    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          type: "join",
          roomId: slug,
          token: slugToken ?? undefined,
        }),
      );
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "receive-change") {
        setConnected(true);
        isRemoteUpdate.current = true;

        editor.commands.setContent(msg.content, {
          emitUpdate: false,
        });

        isRemoteUpdate.current = false;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (!hasSlugToken(slug)) {
        setShowEnterPasswordModal(true);
      }
    };

    return () => {
      ws?.close();
      ws = null;
    };
  }, [editor, slug, getSlugToken, hasSlugToken]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar o link");
    }
  }

  if (!editor) return null;

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl w-full flex flex-col">
        {/* HEADER */}
        <div className="p-3 border-b flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Sala: {slug} {connected ? "🟢" : "🔴"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-100"
              type="button"
            >
              {copied ? "Link copiado!" : "Copiar link"}
            </button>

            {isAuthenticated && hasPassword && (
              <ButtonDeletePassword slug={slug} />
            )}

            {isAuthenticated && (
              <DefinePasswordButton
                onClick={() => setShowDefinePasswordModal(true)}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <s>S</s>
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            {"</>"}
          </ToolbarButton>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {showEnterPasswordModal && (
        <EnterSlugPasswordModal
          slug={slug}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showDefinePasswordModal && (
        <DefinePasswordModal
          slug={slug}
          onClose={() => window.location.reload()}
        />
      )}
    </main>
  );
}
