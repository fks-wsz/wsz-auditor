import { State } from '../shared/store';

declare module 'vue/types/vue' {
  interface Vue {
    state: State;
  }
}
