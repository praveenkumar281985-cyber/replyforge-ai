import { useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

function MessageInput({ message, setMessage }) {
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard?.readText();

      if (text) {
        setMessage(text.slice(0, 5000));
      }
    } catch {
      setOcrError(
        "Clipboard permission is unavailable. Please paste manually."
      );
    }
  }

  function resetImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedImage(null);
    setPreviewUrl("");
    setOcrProgress(0);
    setOcrError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function extractTextFromImage(file) {
    let worker;

    try {
      setOcrLoading(true);
      setOcrProgress(0);
      setOcrError("");

      worker = await createWorker("eng", 1, {
        logger: (status) => {
          if (
            status.status === "recognizing text" &&
            typeof status.progress === "number"
          ) {
            setOcrProgress(Math.round(status.progress * 100));
          }
        },
      });

      const result = await worker.recognize(file);
      const extractedText = result?.data?.text?.trim() || "";

      if (!extractedText) {
        throw new Error(
          "No readable text was found. Try a clearer screenshot."
        );
      }

      setMessage(extractedText.slice(0, 5000));
      setOcrProgress(100);
    } catch (error) {
      console.error("OCR error:", error);

      setOcrError(
        error?.message ||
          "Screenshot text could not be extracted."
      );
    } finally {
      if (worker) {
        await worker.terminate().catch(() => {});
      }

      setOcrLoading(false);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setOcrError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setOcrError(
        "Please upload a PNG, JPG, JPEG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setOcrError("Image size must be less than 5 MB.");

      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    previewUrlRef.current = nextPreviewUrl;

    setSelectedImage(file);
    setPreviewUrl(nextPreviewUrl);

    await extractTextFromImage(file);
  }

  function handleClear() {
    setMessage("");
    resetImage();
  }

  return (
    <div className="rf-v4-composer">
      <div className="rf-v4-composer-topline">
        <div className="rf-v4-composer-label">
          <span>Incoming message</span>

          <span className="rf-v4-private-badge">
            Private
          </span>
        </div>

        <span className="rf-v4-character-count">
          {message.length.toLocaleString()}/5,000
        </span>
      </div>

      {previewUrl && (
        <div className="mx-3.5 mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 p-3">
            <img
              src={previewUrl}
              alt="Uploaded screenshot"
              className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-white/10"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-200">
                {selectedImage?.name}
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                {selectedImage
                  ? `${(
                      selectedImage.size /
                      (1024 * 1024)
                    ).toFixed(2)} MB`
                  : ""}
              </p>

              {ocrLoading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[9px] text-violet-600">
                    <span>Reading screenshot…</span>
                    <span>{ocrProgress}%</span>
                  </div>

                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all duration-300"
                      style={{
                        width: `${ocrProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {!ocrLoading &&
                ocrProgress === 100 &&
                !ocrError && (
                  <p className="mt-2 text-[9px] font-semibold text-emerald-600">
                    ✓ Text extracted successfully
                  </p>
                )}
            </div>

            <button
              type="button"
              onClick={resetImage}
              disabled={ocrLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-500 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04]"
              aria-label="Remove screenshot"
              title="Remove screenshot"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <textarea
        value={message}
        onChange={(event) =>
          setMessage(event.target.value.slice(0, 5000))
        }
        placeholder={
          ocrLoading
            ? "Extracting text from screenshot…"
            : "Paste a message or upload its screenshot…"
        }
        aria-label="Incoming message"
        disabled={ocrLoading}
      />

      {ocrError && (
        <div
          role="alert"
          className="mx-3.5 mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {ocrError}
        </div>
      )}

      <div className="rf-v4-composer-footer">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePaste}
            disabled={ocrLoading}
            className="rf-v4-text-action"
          >
            <span>⧉</span>
            Paste
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading}
            className="rf-v4-text-action"
          >
            <span>▧</span>

            {ocrLoading
              ? `Reading ${ocrProgress}%`
              : "Screenshot"}
          </button>
        </div>

        <div className="rf-v4-composer-meta">
          <span>
            {ocrLoading
              ? "OCR processing"
              : "Auto-saved locally"}
          </span>

          {(message || selectedImage) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={ocrLoading}
              className="rf-v4-text-action rf-v4-danger-action"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageInput;