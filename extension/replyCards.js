export function createReplyCard(title, reply, index) {
    return `
      <div class="rf-card">
  
        <div class="rf-card-header">
  
          <div class="rf-title">
            ${title}
          </div>
  
          <button
            class="rf-copy"
            data-index="${index}"
          >
            Copy
          </button>
  
        </div>
  
        <textarea
          readonly
          class="rf-reply"
        >${reply}</textarea>
  
      </div>
    `;
  }