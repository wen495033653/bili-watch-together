interface EventRequestMessage {
    eventType: string;
    memberId?: string;
    message?: {};
}

import {EventReplyDispatcher, EventReplyMessage} from "../event/EventReplyDispatcher";
import store from '../store';

class Client {
    private static instance: Client;
    private socket!: WebSocket;
    private listenerMap: Map<string, any> = new Map()

    private constructor() {
        // 监听连接消息
        const messageListener = (event: MessageEvent): void => {
            const eventReplyMessage: EventReplyMessage = JSON.parse(event.data);
            console.log(eventReplyMessage);
            EventReplyDispatcher.getInstance().handleEvent(eventReplyMessage); // 分发message
        };

        // 监听连接关闭事件
        const closeListener = (event: CloseEvent): void => {
            console.log("WebSocket closed, code: " + event.code + ", reason: " + event.reason);
            this.reconnect(); // 连接关闭后尝试重连
        };
        this.listenerMap.set("message",messageListener)
        this.listenerMap.set("close",closeListener)
        Client.instance = this;
    }

    public static getInstance(): Client {
        return Client.instance || new Client();
    }

    /**
     * 发送数据
     * @param message 要发送的数据
     */
    public async send(message: EventRequestMessage): Promise<void> {
        // 没起名字，先不建立连接
        if (!store.state.createNickname) {
            return
        }
        await this.connect()
        message.memberId = localStorage.getItem('memberId') + ""
        this.socket.send(JSON.stringify(message));
    }

    /**
     * 关闭连接
     */
    public close(): void {
        for (const [key, value] of this.listenerMap) {
            this.socket.removeEventListener(key, value); // 移除监听事件
        }
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
    }

    /**
     * 建立连接
     */
    public async connect(): Promise<void> {
        // 已经存在连接
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return;
        }
        this.socket = new WebSocket("ws://150.158.150.183:9090/enjoy");
        await new Promise<void>(resolve => {
            this.socket.addEventListener("open", (): void => {
                console.log("WebSocket connection established!");
                resolve();
            });
        });

        for (const [key, value] of this.listenerMap) {
            this.socket.addEventListener(key, value); // 添加监听事件
        }

        // 建立连接后开始心跳包检测
        // this.startHeartbeatCheck();
    }


    /**
     * 心跳包检测
     */
    private startHeartbeatCheck(): void {
        const heartbeatInterval: number = 30000; // 心跳包发送间隔，单位：毫秒

        const sendHeartbeat = (): void => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const heartbeatData: EventRequestMessage = {
                    eventType: "heartbeat",
                };
                this.send(heartbeatData);
            }
        };

        const heartbeatTimer: NodeJS.Timer = setInterval(sendHeartbeat, heartbeatInterval);

        // 监听连接关闭事件，清除心跳定时器
        this.socket.addEventListener("close", (): void => {
            clearInterval(heartbeatTimer);
        });
    }

    /**
     * 断线重连
     */
    private reconnect(): void {
        const reconnectInterval: number = 5000; // 重连间隔，单位：毫秒

        const reconnect = (): void => {
            if (this.socket && this.socket.readyState === WebSocket.CLOSED) {
                console.log("Reconnecting...");
                this.connect().then((): void => {
                    console.log("Reconnect Success");
                    const reconnect: EventRequestMessage = {
                        eventType: "reconnect",
                    };
                    this.send(reconnect);
                });
            }
        };

        setTimeout(reconnect, reconnectInterval);
    }
}

export {EventRequestMessage, Client};
