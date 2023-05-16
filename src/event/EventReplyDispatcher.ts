interface EventReplyMessage {
    eventType: string;
    code: number;
    msg?: string;
    data?: any;
}

class EventReplyDispatcher {
    private static instance: EventReplyDispatcher; // 单例
    private eventHandlers: Map<string, (reply: EventReplyMessage) => void>;

    public static getInstance(): EventReplyDispatcher {
        return EventReplyDispatcher.instance || new EventReplyDispatcher();
    }

    private constructor() {
        this.eventHandlers = new Map<string, (reply: EventReplyMessage) => void>();
        EventReplyDispatcher.instance = this;
    }

    public registerEventHandler(eventType: string, eventHandler: (reply: EventReplyMessage) => void): void {
        this.eventHandlers.set(eventType, eventHandler);
    }

    /**
     * 处理事件
     * @param reply 事件对象
     */
    public handleEvent(reply: EventReplyMessage): void {
        const eventHandler: ((reply: EventReplyMessage) => void) | undefined = this.eventHandlers.get(reply.eventType);
        if (eventHandler) {
            if (reply.code === 200) {
                eventHandler(reply);
            } else {
                alert(reply.msg);
            }
        } else {
            console.log(`未注册事件类型的事件处理器：${reply.eventType}`);
        }
    }
}

export {EventReplyMessage, EventReplyDispatcher};
