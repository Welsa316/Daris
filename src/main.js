import { createApp } from 'vue';
import { createHead } from '@unhead/vue';
import App from './App.vue';
import { router } from './router';
import { i18n, initLocale } from './i18n';
import '../tailwind.css';

const app = createApp(App);
const head = createHead();

app.use(head);
app.use(router);
app.use(i18n);
app.mount('#app');

initLocale();

