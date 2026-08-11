let lastFocusedEditableElement = null;

function isEditableElement(element) {
  if (!element) return false;

  return (
    element.tagName === "TEXTAREA" ||
    element.tagName === "INPUT" ||
    element.isContentEditable ||
    element.getAttribute?.("contenteditable") === "true"
  );
}

document.addEventListener(
  "focusin",
  (event) => {
    if (isEditableElement(event.target)) {
      lastFocusedEditableElement = event.target;
    }
  },
  true
);

document.addEventListener(
  "mousedown",
  (event) => {
    if (isEditableElement(event.target)) {
      lastFocusedEditableElement = event.target;
    }
  },
  true
);


function getSupportedPlatformName() {
  if (
    location.hostname ===
    "mail.google.com"
  ) {
    return "Gmail";
  }

  if (
    location.hostname ===
    "web.whatsapp.com"
  ) {
    return "WhatsApp Web";
  }

  if (
    location.hostname.endsWith(
      "linkedin.com"
    )
  ) {
    return "LinkedIn";
  }

  return "this page";
}

function getSelectedText() {
  const activeElement = document.activeElement;

  if (
    activeElement?.tagName === "TEXTAREA" ||
    activeElement?.tagName === "INPUT"
  ) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;

    if (
      typeof start === "number" &&
      typeof end === "number" &&
      end > start
    ) {
      return activeElement.value
        .slice(start, end)
        .trim();
    }
  }

  return window.getSelection()?.toString().trim() || "";
}

function setNativeInputValue(element, value) {
  const prototype =
    element.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const valueSetter =
    Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

  if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );

  element.dispatchEvent(
    new Event("change", {
      bubbles: true,
    })
  );
}

function insertIntoInput(element, reply) {
  const start =
    typeof element.selectionStart === "number"
      ? element.selectionStart
      : element.value.length;

  const end =
    typeof element.selectionEnd === "number"
      ? element.selectionEnd
      : start;

  const currentValue = element.value || "";

  const nextValue =
    currentValue.slice(0, start) +
    reply +
    currentValue.slice(end);

  setNativeInputValue(element, nextValue);

  const nextCursorPosition = start + reply.length;

  element.focus();

  element.setSelectionRange?.(
    nextCursorPosition,
    nextCursorPosition
  );
}

function insertIntoContentEditable(element, reply) {
  element.focus();

  const selection = window.getSelection();

  if (!selection) {
    throw new Error(
      "The message editor could not be accessed."
    );
  }

  if (!selection.rangeCount) {
    const range = document.createRange();

    range.selectNodeContents(element);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  const range = selection.getRangeAt(0);

  if (!element.contains(range.commonAncestorContainer)) {
    range.selectNodeContents(element);
    range.collapse(false);
  }

  range.deleteContents();

  const textNode = document.createTextNode(reply);

  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);

  element.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: reply,
    })
  );

  element.dispatchEvent(
    new Event("change", {
      bubbles: true,
    })
  );
}


function findWhatsAppComposer() {
  if (
    location.hostname !==
    "web.whatsapp.com"
  ) {
    return null;
  }

  const selectors = [
    'footer div[contenteditable="true"][role="textbox"]',
    'footer div[contenteditable="true"]',
    'div[contenteditable="true"][data-tab]',
  ];

  for (const selector of selectors) {
    const elements = [
      ...document.querySelectorAll(
        selector
      ),
    ];

    const composer = elements.find(
      (element) => {
        const rect =
          element.getBoundingClientRect();

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          !element.getAttribute(
            "aria-disabled"
          )
        );
      }
    );

    if (composer) {
      return composer;
    }
  }

  return null;
}

function findEditableElement() {
  const whatsappComposer =
    findWhatsAppComposer();

  if (whatsappComposer) {
    return whatsappComposer;
  }

  if (isEditableElement(document.activeElement)) {
    return document.activeElement;
  }

  if (
    lastFocusedEditableElement &&
    document.contains(lastFocusedEditableElement)
  ) {
    return lastFocusedEditableElement;
  }

  const selectors = [
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    "textarea",
    'input[type="text"]',
  ];

  for (const selector of selectors) {
    const elements = [
      ...document.querySelectorAll(selector),
    ];

    const visibleElement = elements.find(
      (element) => {
        const rect =
          element.getBoundingClientRect();

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          !element.disabled &&
          !element.readOnly
        );
      }
    );

    if (visibleElement) {
      return visibleElement;
    }
  }

  return null;
}

function insertReply(reply) {
  const element = findEditableElement();

  if (!element) {
    throw new Error(
      "Click inside the reply box on the webpage, then try again."
    );
  }

  if (
    element.tagName === "TEXTAREA" ||
    element.tagName === "INPUT"
  ) {
    insertIntoInput(element, reply);
  } else if (element.isContentEditable) {
    insertIntoContentEditable(element, reply);
  } else {
    throw new Error(
      "This page's reply box is not currently supported."
    );
  }

  lastFocusedEditableElement = element;
}


function getConversationContextSafely() {
  try {
    const api =
      globalThis.MessauraConversation;

    if (
      !api ||
      typeof api.getConversationContext !==
        "function"
    ) {
      return null;
    }

    const context =
      api.getConversationContext();

    return context?.fullContext?.trim()
      ? context
      : null;
  } catch (error) {
    console.warn(
      "Messaura could not read conversation context:",
      error
    );

    return null;
  }
}

function forwardGenerationRequest(
  request,
  sendResponse
) {
  chrome.runtime.sendMessage(
    {
      type: request.type,
      message: request.message,
      tone: request.tone,
      length: request.length,
      reply: request.reply,
      rewriteAction: request.rewriteAction,
      analysis: request.analysis,
      conversationContext:
        request.conversationContext ||
        getConversationContextSafely(),
    },
    (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error:
            chrome.runtime.lastError.message ||
            "The Messaura background service is not ready.",
        });

        return;
      }

      sendResponse(
        response || {
          success: false,
          error:
            "No response was received from the background service.",
        }
      );
    }
  );
}

chrome.runtime.onMessage.addListener(
  (request, _sender, sendResponse) => {
    if (
      request?.type ===
      "GET_ACTIVE_PLATFORM"
    ) {
      sendResponse({
        success: true,
        platform:
          getSupportedPlatformName(),
        hostname: location.hostname,
      });

      return false;
    }

    if (request?.type === "GET_SELECTED_TEXT") {
      sendResponse({
        success: true,
        text: getSelectedText(),
      });

      return false;
    }

    if (
      request?.type ===
      "GET_CONVERSATION_CONTEXT"
    ) {
      sendResponse({
        success: true,
        context:
          getConversationContextSafely(),
      });

      return false;
    }

    if (request?.type === "INSERT_REPLY") {
      try {
        const reply = request.reply?.trim();

        if (!reply) {
          throw new Error("No reply was provided.");
        }

        insertReply(reply);

        sendResponse({
          success: true,
        });
      } catch (error) {
        console.error(
          "Messaura insertion error:",
          error
        );

        sendResponse({
          success: false,
          error:
            error?.message ||
            "Reply could not be inserted.",
        });
      }

      return false;
    }

    if (
      request?.type === "GENERATE_REPLY" ||
      request?.type === "GENERATE_MULTIPLE_REPLIES" ||
      request?.type === "REWRITE_REPLY" ||
      request?.type === "ANALYZE_REPLY" ||
      request?.type === "IMPROVE_REPLY"
    ) {
      forwardGenerationRequest(
        request,
        sendResponse
      );

      return true;
    }

    return false;
  }
);
