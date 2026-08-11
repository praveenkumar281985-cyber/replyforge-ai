(() => {
  const VERSION_ATTRIBUTE = "data-replyforge-extension-version";
  const READY_EVENT = "replyforge:extension-ready";
  const PING_EVENT = "replyforge:extension-ping";

  function announceMessauraExtension() {
    document.documentElement.setAttribute(
      VERSION_ATTRIBUTE,
      chrome.runtime.getManifest().version
    );
    window.dispatchEvent(new Event(READY_EVENT));
  }

  window.addEventListener(PING_EVENT, announceMessauraExtension);
  announceMessauraExtension();
})();
