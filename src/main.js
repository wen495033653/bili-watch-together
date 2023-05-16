import {VideoController} from "./logic/VideoController";
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";
import fingerprint2 from 'fingerprintjs2';

(async () => {
    // 延迟2秒执行
    await new Promise(resolve => setTimeout(resolve, 2000));
    $(".video-data").css("height", "28px");

    // 全局唯一id
    const memberId = await new Promise(resolve => fingerprint2.get(components => resolve(fingerprint2.x64hash128(components.map(pair => pair.value).join(), 31))));
    localStorage.setItem("memberId", memberId);

    // 初始化框架
    Vue.use(ElementUI);
    const app = new Vue({
        render: h => h(App),
    }).$mount();
    $(".video-data-list").append(app.$el);

    VideoController.getInstance();
})();