import {Client, EventRequestMessage} from "../client";
import {EventReplyDispatcher, EventReplyMessage} from "../event/EventReplyDispatcher";
import {Notification} from 'element-ui';
import "element-ui/lib/theme-chalk/index.css";

class VideoController {
    private static instance: VideoController; // 单例
    private video: JQuery; // 视频元素
    private isCallBackTriggered: boolean = false; // 标识是否回调触发，是否是房间其他人触发

    public static getInstance(): VideoController {
        return VideoController.instance || new VideoController();
    }

    private constructor() {
        this.video = $(".bpx-player-video-wrap video"); // 获取视频元素
        this.registerEventReply();
        this.bindEventListeners();
        VideoController.instance = this;
    }

    // 注册响应触发事件
    private registerEventReply(): void {
        const replyEventDispatcher: EventReplyDispatcher = EventReplyDispatcher.getInstance();
        replyEventDispatcher.registerEventHandler("videoPlay" as string, (reply: EventReplyMessage): void => {
            this.isCallBackTriggered = true;
            (this.video[0] as HTMLVideoElement).play();
            Notification({
                title: '播放',
                message: reply.msg + "",
                duration: 2000
            });
        });

        replyEventDispatcher.registerEventHandler("videoPause" as string, (reply: EventReplyMessage): void => {
            this.isCallBackTriggered = true;
            (this.video[0] as HTMLVideoElement).pause();
            Notification({
                title: '暂停',
                message: reply.msg + "",
                duration: 2000
            });
        });

        replyEventDispatcher.registerEventHandler("videoTimeupdate" as string, (reply: EventReplyMessage): void => {
            this.isCallBackTriggered = true;
            this.video.prop("currentTime", reply.data.currentTime);
            Notification({
                title: '视频拖动',
                message: reply.msg + "",
                duration: 2000
            });
        });
    }

    // 绑定事件监听器
    private bindEventListeners(): void {
        const client: Client = Client.getInstance();

        // 视频播放
        $(this.video).on("play", (): void => {
            if (this.isCallBackTriggered) {
                // 如果是脚本触发，忽略该事件
                this.isCallBackTriggered = false; // 重置标识为 false
                return
            }
            const send: EventRequestMessage = {
                eventType: "videoPlay",
            }
            client.send(send);
        });

        // 视频暂停
        $(this.video).on("pause", (): void => {
            if (this.isCallBackTriggered) {
                this.isCallBackTriggered = false; // 重置标识为 false
                return
            }
            const send: EventRequestMessage = {
                eventType: "videoPause",
            }
            client.send(send);
        });

        // 视频进度条改变
        $(this.video).on("seeked", (): void => {
            if (this.isCallBackTriggered) {
                this.isCallBackTriggered = false; // 重置标识为 false
                return
            }
            const send: EventRequestMessage = {
                eventType: "videoTimeupdate",
                message: {currentTime: this.video.prop("currentTime")}
            }
            client.send(send);
        });

        // 换视频
        $(this.video).on("loadedmetadata", (): void => {
            const url: URL = new URL(window.location.href);
            const pathname: string = url.pathname;
            const bv: string = pathname.substring(pathname.lastIndexOf("/") + 1).split("?")[0];// 从pathname中提取BV号
            const p: string | null = url.searchParams.get("p");  // 获取P参数
            const bvAndP: string = !p || p === "1" ? bv : `${bv}?p=${p}`; // 拼接BV号和P参数
            const send: EventRequestMessage = {
                eventType: "videoReload",
                message: {
                    "bv": bvAndP
                }
            }
            client.send(send);
        });
    }

    // 生成UUID，用于标识每一个事件
    private generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c: string) => {
            const r: number = (Math.random() * 16) | 0,
                v: number = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

export {VideoController};
