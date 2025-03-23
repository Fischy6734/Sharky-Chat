import AblyBaseComponent from "./AblyBaseComponent";

class AblyChat extends AblyBaseComponent {
    static get observedAttributes() {
        return ['messages'];
    }

    get messages() {
        const val = this.getAttribute('messages') || "[]";
        return JSON.parse(val);
    }

    set messages(messages) {
        this.setAttribute('messages', JSON.stringify(messages));
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        super.subscribe('chat', 'chat-message', (message) => {
            this.onAblyMessageReceived(message);
        });
        
        this.id = Math.random().toString(36).substring(2, 15);
        this.renderTemplateAndRegisterClickHandlers();
        this.inputBox.focus();
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (oldValue != newValue) {
            this.chatText.innerHTML = this.formatMessages(this.messages);
            this.messageEnd.scrollIntoView();
        }
    }

    renderTemplateAndRegisterClickHandlers() {
        this.innerHTML = `
            <div id="${this.id}" class="chat-container">
                <div class="chatText"></div>
                <div class="messageEnd"></div>
                <div class="input-container">
                    <textarea class="textarea"></textarea>
                    <button class="button">Send</button>
                </div>
            </div>
        `;

        this.chatText = this.querySelectorAll(".chatText")[0];
        this.inputBox = this.querySelectorAll(".textarea")[0];
        this.sendButton = this.querySelectorAll(".button")[0];
        this.messageEnd = this.querySelectorAll(".messageEnd")[0];

        this.sendButton.addEventListener('click', () => {
            this.sendChatMessage(this.inputBox.value);
        });

        this.inputBox.addEventListener('keypress', (event) => {
            this.handleKeyPress(event);
        });
    }

    onAblyMessageReceived(message) {
        const history = this.messages.slice(-199);
        const updatedMessages = [...history, message];
        this.messages = updatedMessages;
    }

    sendChatMessage(messageText) {
        super.publish("chat", { name: "chat-message", data: messageText });
        this.inputBox.value = "";
        this.inputBox.focus();
    }

    handleKeyPress(event) {
        const messageText = this.inputBox.value;
        const messageTextIsEmpty = messageText.trim().length === 0;
        if (event.key === "Enter" && !messageTextIsEmpty) {
            this.sendChatMessage(messageText);
            event.preventDefault();
        }
    }

    formatMessages(messages) {
        return messages.map(msg => `<div class="message">${msg.data}</div>`).join('');
    }
}

customElements.define('ably-chat', AblyChat);
