<template>
    <div>

        <div v-show="nicknameShow">
            <el-input style="width: 128px;" v-model="nickname" size="mini" placeholder="起个名字吧"/>
            <el-button size="mini" @click="nicknameSubmit()">OK</el-button>
        </div>

        <el-popover placement="top" width="160" height="60" v-model="visible">
            <el-input v-model="roomId" size="mini" style="width: auto" placeholder="房间号（纯数字）"
                      @input="validateRoomId"/>
            <div style="text-align: right; margin-top: 8px">
                <el-button size="mini" @click="joinRoomSend()">确定</el-button>
                <el-button size="mini" @click="visible = false">取消</el-button>
            </div>
            <template v-slot:reference>
                <el-button v-show="joinRoomShow" size="mini" @click="()=>{joinRoomShow=true}">加入房间</el-button>
            </template>
        </el-popover>

        <div v-show="createRoomShow" style="display: inline;">
            <el-button @click="createRoomSend" size="mini">创建房间</el-button>
        </div>

        <div v-show="exitRoomShow">
            <el-tag size="mini" effect="plain">房间号：{{ roomId }}</el-tag>
            <el-button @click="exitRoom" size="mini">退出房间</el-button>
        </div>

    </div>
</template>

<script>
import {EventReplyDispatcher} from "./event/EventReplyDispatcher";
import {Client} from "./client";
import store from './store';

export default {
    name: "App",
    data() {
        return {
            visible: true,
            nicknameShow: true,
            joinRoomShow: false,
            createRoomShow: false,
            exitRoomShow: false,
            nickname: '',
            roomId: '',
            webSocketClient: null,
        }
    },
    created() {
        this.webSocketClient = Client.getInstance()
        const eventDispatcher = EventReplyDispatcher.getInstance();

        eventDispatcher.registerEventHandler("createNickname", () => {
            this.nicknameShow = false;
            this.joinRoomShow = true;
            this.createRoomShow = true;
        });
        eventDispatcher.registerEventHandler("createRoom", reply => {
            this.createRoomShow = false;
            this.joinRoomShow = false;
            this.exitRoomShow = true;
            this.roomId = reply.data.roomId
        });
        eventDispatcher.registerEventHandler("joinRoom", reply => {
            if (reply.code !== 200) {
                this.$message.warning(reply.msg);
            }
            this.visible = false;
            this.joinRoomShow = false;
            this.createRoomShow = false;
            this.exitRoomShow = true;
        });
        eventDispatcher.registerEventHandler("exitRoom", reply => {
            if (reply.code !== 200) {
                this.$message.warning(reply.msg);
            }
            this.webSocketClient.close()
        });

        eventDispatcher.registerEventHandler("offLine", reply => {
            if (reply.code !== 200) {
                this.$message.warning(reply.msg);
            }
            this.webSocketClient.close()
            this.nicknameShow = true
            this.joinRoomShow = false
            this.createRoomShow = false
            this.exitRoomShow = false
            this.nickname = ''
            this.roomId = ''
        });

        // 浏览器退出监听
        window.addEventListener('beforeunload', () => this.exitRoom());
    },
    methods: {
        async nicknameSubmit() {
            if (!this.nickname && this.nickname.trim().length === 0) {
                alert('请输入昵称');
                return;
            }
            // 获取bv号
            const url = new URL(window.location.href);
            const bv = url.pathname.split('/')[2];// 从pathname中提取BV号
            const p = url.searchParams.get("p");  // 获取P参数
            const bvAndP = !p || p === "1" ? bv : `${bv}?p=${p}`; // 拼接BV号和P参数
            const send = {
                eventType: "createNickname",
                message: {
                    "nickname": this.nickname,
                    "bv": bvAndP
                }
            }
            store.commit('createNickname', true);
            this.webSocketClient.send(send)
        },

        // 房间号校验
        validateRoomId() {
            // 使用正则表达式校验输入是否为数字
            if (!/^\d*$/.test(this.roomId)) {
                this.roomId = this.roomId.replace(/\D/g, ''); // 移除非数字字符
            }
        },

        joinRoomSend() {
            if (!this.roomId || !/^\d+$/.test(this.roomId)) {
                alert('请输入正确的房间号');
                return;
            }
            const event = {
                eventType: 'joinRoom',
                message: {
                    roomId: this.roomId
                },
            }
            this.webSocketClient.send(event);

        },

        exitRoom() {
            const event = {
                eventType: 'exitRoom',
                message: {
                    roomId: this.roomId
                },
            }
            this.webSocketClient.send(event);

            this.joinRoomShow = true;
            this.createRoomShow = true;
            this.exitRoomShow = false;
            this.roomId = '';
        },

        createRoomSend() {
            const event = {
                eventType: 'createRoom',
            }
            this.webSocketClient.send(event);
        },

        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
    }
}
</script>

<style>
</style>