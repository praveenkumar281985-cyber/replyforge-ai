(function initializeReplyForgeConversation() {
  const MAX_MESSAGES = 20;
  const MAX_CONTEXT_LENGTH = 24000;

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function uniqueMessages(messages) {
    const seen = new Set();

    return messages.filter((message) => {
      const key =
        `${message.sender}::${message.body}`;

      if (
        !message.body ||
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  function getGmailSubject() {
    const selectors = [
      "h2.hP",
      'h2[data-thread-perm-id]',
      '[role="main"] h2',
    ];

    for (const selector of selectors) {
      const text = cleanText(
        document.querySelector(
          selector
        )?.textContent
      );

      if (text) {
        return text.slice(0, 500);
      }
    }

    return "";
  }

  function getGmailSender(container) {
    const selectors = [
      ".gD[email]",
      ".gD",
      "[email]",
      "[data-hovercard-id]",
    ];

    for (const selector of selectors) {
      const element =
        container.querySelector(
          selector
        );

      const sender = cleanText(
        element?.getAttribute("name") ||
          element?.textContent ||
          element?.getAttribute("email") ||
          element?.getAttribute(
            "data-hovercard-id"
          )
      );

      if (sender) {
        return sender.slice(0, 200);
      }
    }

    return "Participant";
  }

  function getGmailBody(container) {
    const selectors = [
      ".a3s.aiL",
      ".a3s",
      '[data-message-id] .a3s',
    ];

    for (const selector of selectors) {
      const element =
        container.querySelector(
          selector
        );

      const text = cleanText(
        element?.innerText ||
          element?.textContent
      );

      if (text) {
        return text.slice(0, 5000);
      }
    }

    return "";
  }

  function extractGmailContext() {
    const containers = [
      ...document.querySelectorAll(
        "div[data-message-id], div.adn.ads"
      ),
    ];

    const messages = uniqueMessages(
      containers
        .map((container) => ({
          sender:
            getGmailSender(container),
          body:
            getGmailBody(container),
        }))
        .filter(
          (message) =>
            message.body.length >= 2
        )
    ).slice(-MAX_MESSAGES);

    return {
      platform: "gmail",
      subject: getGmailSubject(),
      messages,
    };
  }

  function getWhatsAppChatName() {
    const selectors = [
      '#main header span[title]',
      '#main header [data-testid="conversation-info-header-chat-title"]',
      "#main header span[dir='auto']",
    ];

    for (const selector of selectors) {
      const element =
        document.querySelector(selector);

      const name = cleanText(
        element?.getAttribute("title") ||
          element?.textContent
      );

      if (name) {
        return name.slice(0, 200);
      }
    }

    return "";
  }

  function getWhatsAppMessageContainers() {
    const directContainers = [
      ...document.querySelectorAll(
        "#main .message-in, #main .message-out"
      ),
    ];

    if (directContainers.length) {
      return directContainers;
    }

    const textElements = [
      ...document.querySelectorAll(
        '#main span[data-testid="selectable-text"], ' +
        '#main span.selectable-text.copyable-text'
      ),
    ];

    const containers = [];
    const seen = new Set();

    for (const textElement of textElements) {
      const container =
        textElement.closest(
          "[data-id], [data-pre-plain-text]"
        ) ||
        textElement.parentElement;

      if (
        container &&
        !seen.has(container)
      ) {
        seen.add(container);
        containers.push(container);
      }
    }

    return containers;
  }

  function isOutermostSelectableText(
    element,
    container
  ) {
    const parentSelectable =
      element.parentElement?.closest(
        'span[data-testid="selectable-text"], ' +
        'span.selectable-text.copyable-text'
      );

    return (
      !parentSelectable ||
      !container.contains(
        parentSelectable
      )
    );
  }

  function isVisibleElement(element) {
    const rect =
      element.getBoundingClientRect();

    return (
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function getCurrentWhatsAppTextElement(
    container
  ) {
    const candidates = [
      ...container.querySelectorAll(
        'span[data-testid="selectable-text"], ' +
        'span.selectable-text.copyable-text'
      ),
    ].filter(
      (element) =>
        isOutermostSelectableText(
          element,
          container
        ) &&
        isVisibleElement(element)
    );

    if (!candidates.length) {
      return null;
    }

    /*
     * In WhatsApp reply bubbles, quoted content appears before
     * the newly written message. Choosing the final top-level
     * selectable-text node removes the quoted preview and keeps
     * the actual current message.
     */
    return candidates[
      candidates.length - 1
    ];
  }

  function getWhatsAppMessageBody(
    container
  ) {
    const textElement =
      getCurrentWhatsAppTextElement(
        container
      );

    const text = cleanText(
      textElement?.innerText ||
        textElement?.textContent
    );

    return text
      .replace(
        /\bEdited\b$/i,
        ""
      )
      .trim()
      .slice(0, 5000);
  }

  function getWhatsAppMetadata(
    container
  ) {
    const metadataElement =
      container.matches?.(
        "[data-pre-plain-text]"
      )
        ? container
        : container.querySelector?.(
            "[data-pre-plain-text]"
          );

    return (
      metadataElement?.getAttribute(
        "data-pre-plain-text"
      ) || ""
    );
  }

  function getWhatsAppSender(
    container,
    chatName
  ) {
    const metadata =
      getWhatsAppMetadata(container);

    const senderMatch =
      metadata.match(
        /\]\s*([^:]+):\s*$/
      );

    if (senderMatch?.[1]) {
      return cleanText(
        senderMatch[1]
      ).slice(0, 200);
    }

    if (
      container.classList?.contains(
        "message-out"
      ) ||
      container.closest?.(
        ".message-out"
      )
    ) {
      return "You";
    }

    if (
      container.classList?.contains(
        "message-in"
      ) ||
      container.closest?.(
        ".message-in"
      )
    ) {
      return chatName || "Contact";
    }

    return "Participant";
  }

  function getWhatsAppTimestamp(
    container
  ) {
    const metadata =
      getWhatsAppMetadata(container);

    const match =
      metadata.match(
        /^\[([^\]]+)\]/
      );

    return cleanText(
      match?.[1] || ""
    ).slice(0, 80);
  }

  function isUsefulWhatsAppMessage(
    body
  ) {
    if (!body) {
      return false;
    }

    const ignored = new Set([
      "This message was deleted",
      "You deleted this message",
    ]);

    return !ignored.has(body);
  }

  function extractWhatsAppContext() {
    const chatName =
      getWhatsAppChatName();

    const containers =
      getWhatsAppMessageContainers();

    const messages = containers
      .map((container) => {
        const body =
          getWhatsAppMessageBody(
            container
          );

        return {
          sender:
            getWhatsAppSender(
              container,
              chatName
            ),
          body,
          timestamp:
            getWhatsAppTimestamp(
              container
            ),
        };
      })
      .filter(
        (message) =>
          isUsefulWhatsAppMessage(
            message.body
          )
      );

    return {
      platform: "whatsapp",
      subject: chatName,
      messages:
        uniqueMessages(messages)
          .slice(-MAX_MESSAGES),
    };
  }

  function buildResult(raw) {
    const participants = [
      ...new Set(
        raw.messages
          .map(
            (message) =>
              message.sender
          )
          .filter(Boolean)
      ),
    ].slice(0, 20);

    const fullContext =
      raw.messages
        .map(
          (message, index) =>
            `Message ${index + 1} — ${message.sender}:\n${message.body}`
        )
        .join("\n\n")
        .slice(
          0,
          MAX_CONTEXT_LENGTH
        );

    return {
      platform: raw.platform,
      subject: raw.subject || "",
      participants,
      messages: raw.messages,
      fullContext,
    };
  }

  function emptyContext(platform) {
    return {
      platform,
      subject: "",
      participants: [],
      messages: [],
      fullContext: "",
    };
  }

  function getConversationContext() {
    try {
      if (
        location.hostname ===
        "mail.google.com"
      ) {
        return buildResult(
          extractGmailContext()
        );
      }

      if (
        location.hostname ===
        "web.whatsapp.com"
      ) {
        return buildResult(
          extractWhatsAppContext()
        );
      }

      return emptyContext(
        location.hostname ||
          "unknown"
      );
    } catch (error) {
      console.warn(
        "ReplyForge conversation extraction failed:",
        error
      );

      return emptyContext(
        location.hostname ||
          "unknown"
      );
    }
  }

  globalThis.ReplyForgeConversation = {
    getConversationContext,
  };
})();
