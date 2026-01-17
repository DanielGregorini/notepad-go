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
import ButtonRansomSlug from "@/components/ui/buttonRansomSlug";

let ws: WebSocket | null = null;

type PasswordState = "unknown" | "has-password" | "no-password";

export default function SlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { getSlugToken, hasSlugToken, isAuthenticated } = useAuth();

  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const [passwordState, setPasswordState] =
    useState<PasswordState>("unknown");

  const [showDefinePasswordModal, setShowDefinePasswordModal] =
    useState(false);

  const [showEnterPasswordModal, setShowEnterPasswordModal] =
    useState(false);

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

  /* =====================
     CHECK PASSWORD (API)
  ===================== */

  useEffect(() => {
    let cancelled = false;

    async function checkPassword() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/slug/${slug}/has-password`,
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        if (!cancelled) {
          setPasswordState(
            data.hasPassword ? "has-password" : "no-password",
          );
        }
      } catch {
        if (!cancelled) {
          setPasswordState("unknown");
        }
      }
    }

    checkPassword();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* =====================
     WEBSOCKET
  ===================== */

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

      if (
        passwordState === "has-password" &&
        !hasSlugToken(slug)
      ) {
        setShowEnterPasswordModal(true);
      }
    };

    return () => {
      ws?.close();
      ws = null;
    };
  }, [editor, slug, passwordState, getSlugToken, hasSlugToken]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  if (!editor) return null;

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl w-full flex flex-col">
        {/* HEADER */}
        <div className="p-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Room: {slug} {connected ? "🟢 Connected" : "🔴 Disconnected"}
            </div>
            <ButtonRansomSlug />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-100"
              type="button"
            >
              {copied ? "Link copied!" : "Copy link"}
            </button>

            {isAuthenticated && passwordState === "has-password" && (
              <ButtonDeletePassword slug={slug} />
            )}

            {isAuthenticated && (
              <DefinePasswordButton
                onClick={() => setShowDefinePasswordModal(true)}
              />
            )}
          </div>
        </div>

        {/* TOOLBAR */}
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

        {/* EDITOR */}
        <div className="flex-1 p-4 overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ENTER PASSWORD */}
      {showEnterPasswordModal && (
        <EnterSlugPasswordModal
          slug={slug}
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* DEFINE PASSWORD */}
      {showDefinePasswordModal && (
        <DefinePasswordModal
          slug={slug}
          onClose={() => window.location.reload()}
        />
      )}
    </main>
  );
}
