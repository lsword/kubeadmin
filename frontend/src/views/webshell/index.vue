<template>
  <div id="terminal">
  </div>
  <div v-if="k8sPod" class="select-menu">
    <a-space direction="vertical" size="large">
    <a-select :style="{width:'140px'}"  v-model="containername"  @change="handleSelectChange">
      <a-option v-for="(value,index) in k8sPod.spec.containers" :key="index">{{value.name}}</a-option>
    </a-select>
    </a-space>
  </div>
</template>

<script setup lang="ts">
// import { Terminal, ITerminalOptions, type ITheme, type IDisposable } from '@xterm/xterm';
// import { FitAddon } from '@xterm/addon-fit';
// import '@xterm/xterm/css/xterm.css';
import { Terminal, ITerminalOptions, ITheme, IDisposable } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClusterStore } from '@/store';
import api, { K8sPod } from '@/api/cluster';
import useLoading from '@/hooks/loading';

const { loading, setLoading } = useLoading();
const clusterStore = useClusterStore();
const router = useRouter();

const checkStoreData = () => {
  if (!clusterStore.id || !clusterStore.curNamespace) {
    router.push("/");
  }
}

const route = useRoute();
const podname = ref();
const containername = ref();
const preContainername = ref();
const k8sPod = ref<K8sPod>();
const currentTime = new Date();

podname.value = route.params.podname;
containername.value = route.params.containername;
preContainername.value = route.params.containername;

const termOptions = {
  fontSize: 18,
  fontFamily: 'Menlo For Powerline,Consolas,Liberation Mono,Menlo,Courier,monospace',
    theme: {
      foreground: '#d2d2d2',
      background: '#2b2b2b',
      cursor: '#adadad',
      black: '#000000',
      red: '#d81e00',
      green: '#5ea702',
      yellow: '#cfae00',
      blue: '#427ab3',
      magenta: '#89658e',
      cyan: '#00a7aa',
      white: '#dbded8',
      brightBlack: '#686a66',
      brightRed: '#f54235',
      brightGreen: '#99e343',
      brightYellow: '#fdeb61',
      brightBlue: '#84b0d8',
      brightMagenta: '#bc94b7',
      brightCyan: '#37e6e8',
      brightWhite: '#f1f1f0',
    } as ITheme,
    allowProposedApi: true,
} as ITerminalOptions;

const terminal = new Terminal(termOptions)
const fitAddon = new FitAddon();

let socket:WebSocket;
const written = 0;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const disposables: IDisposable[] = [];
// const overlayAddon = new OverlayAddon();

const writeData = (data: string | Uint8Array) => {
  terminal.write(data);
};
const writeFunc = (data: ArrayBuffer) => writeData(new Uint8Array(data));

const sendData = (data: string | Uint8Array) => {
  if (socket?.readyState !== WebSocket.OPEN) return;

  if (typeof data === 'string') {
    const payload = new Uint8Array(data.length * 3);
    const stats = textEncoder.encodeInto(data, payload);
    socket.send(payload.subarray(0, stats.written as number));
    console.log(data);
  } else {
    const payload = new Uint8Array(data.length);
    payload.set(data, 0);
    socket.send(payload);
  }
};

const onTerminalData = (data: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(textEncoder.encode(data)); 
  }
}
const onTerminalResize = (size: { cols: number; rows: number }) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const resizeData = JSON.stringify({ type: 'resize', cols: size.cols, rows: size.rows });
    sendData(resizeData);
  }
}

const open = () => {
  terminal.loadAddon(fitAddon);
  terminal.onData(onTerminalData);
  terminal.onResize(onTerminalResize);
  terminal.open(document.getElementById("terminal"));

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//localhost:3000${import.meta.env.VITE_API_PREFIX}/api/k8s/terminal`, ['tty']);
  socket.binaryType = 'arraybuffer';

  socket.onopen = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      const initData = JSON.stringify({ type: 'init', clusterid: clusterStore.id!, namespace: clusterStore.curNamespace!, podname: podname.value, containername: containername.value });
      sendData(initData);

      fitAddon.fit();
      terminal.focus();
    }
  }
  socket.onmessage = (event: MessageEvent) => {  
    writeFunc(event.data)
  };

  socket.onerror = (error) => {
    terminal.write(`WebSocket error: ${error}\r\n`);
  };

  socket.onclose = () => {
    terminal.write('WebSocket connection closed.\r\n');
  };

}

const onWindowResize = () => {
  fitAddon.fit()
};

const handleSelectChange = async (containerName: string) => {
  console.log(containerName);
  const win = window.open(
    `${import.meta.env.VITE_API_PREFIX}/webshell/${podname.value}/${containerName}`,
    "_blank"
  );
  containername.value = preContainername.value;
};

const fetchPodDetail = async () => {
  checkStoreData();

  try {
    const result = await api.getPodDetail(clusterStore.id!, clusterStore.curNamespace!, podname.value);
    k8sPod.value = result.data as K8sPod;
    console.log(k8sPod.value)
    // containername.value = k8sPod.value.spec.containers[0].name;
  } catch (error) {
    console.error('Failed to fetch pod details:', error);
  }
};

onMounted(() => {
  fetchPodDetail();
  open();
  window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(()=>{
  socket.close();
  terminal.dispose();
  window.removeEventListener('resize', onWindowResize);
});

</script>

<style scoped lang="less">
  @import 'xterm/css/xterm.css';
  .container {
    padding: 0 20px 20px 20px;
  }
  #terminal {
    width: auto;
    height: 100vh;
  }
  .terminal-container {
    width: auto;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    background-color: #2b2b2b;
    .terminal {
      padding: 5px;
    }
  }

  .select-menu {
    position: fixed;
    top: 10px;
    right: 30px;
    //background-color: rgba(0, 0, 0, 0.5);
    color: white;
    //padding: 15px;
    border-radius: 4px;
    z-index: 1000; /* 设置 z-index 确保悬浮在顶层 */
  }

</style>