import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';

// @ts-ignore
Vue.use(Vuex);

interface RootState {
    createNickname: boolean;
}

const store: StoreOptions<RootState> = {
    state: {
        createNickname: false,
    },
    mutations: {
        createNickname(state: RootState, value: boolean) {
            state.createNickname = value;
        },
    },
};

export default new Vuex.Store<RootState>(store);
