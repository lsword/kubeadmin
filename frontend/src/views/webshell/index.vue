<template>
  <div id="terminal">
  </div>
<!---
  <div class="select-menu">
    <a-space direction="vertical" size="large">
    <a-select :style="{width:'140px'}"  v-model="containername"  @change="handleSelectChange">
      <a-option v-for="(value,index) in k8sPod.spec.containers" :key="index">{{value.name}}</a-option>
    </a-select>
    </a-space>
  </div>
  -->
</template>

<script setup lang="ts">
// import { Terminal, ITerminalOptions, ITheme, IDisposable } from '@xterm/xterm';
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
const k8sPod = ref<K8sPod>();
const currentTime = new Date();

podname.value = route.params.podname;
containername.value = route.params.podname;

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

// let terminal:any;
const terminal = new Terminal(termOptions)
const fitAddon = new FitAddon();

let socket:any;
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
    socket.send(payload);
  } else {
    const payload = new Uint8Array(data.length);
    payload.set(data, 0);
    socket.send(payload);
  }
};

const onTerminalData = (data: string) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(textEncoder.encode(data)); 
  }
}

const onTerminalResize = (size: { cols: number; rows: number }) => {
 console.log("onTerminalResize", size);
 /*
  if (socket.readyState === WebSocket.OPEN) {  
    // socket.send(JSON.stringify({ type: 'resize', cols: size.cols, rows: size.rows }));
    sendData(JSON.stringify({ type: 'resize', cols: size.cols, rows: size.rows }));
  }
  */
}

const open = () => {
  terminal.loadAddon(fitAddon);
  terminal.onData(onTerminalData);
  terminal.onResize(onTerminalResize);
  terminal.open(document.getElementById("terminal"));
  fitAddon.fit();

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//localhost:3000${import.meta.env.VITE_API_PREFIX}/api/k8s/terminal`, ['tty']);
  socket.binaryType = 'arraybuffer';
  (window as any).term = terminal;
  (window as any).term.fit = () => {
    fitAddon.fit();
  };

  socket.onopen = () => {
    terminal.focus();
    const dims = fitAddon.proposeDimensions();
    console.log("dims:", dims);
  }
  socket.onmessage = (event: MessageEvent) => {  
    writeFunc(event.data)
  };

  socket.onerror = (error) => {
    terminal.write(`WebSocket error: ${error.message}\r\n`);
  };

  socket.onclose = () => {
    terminal.write('WebSocket connection closed.\r\n');
  };

}

const onWindowResize = () => {
  // sendData(JSON.stringify({ type: 'resize', cols: terminal.cols, rows: terminal.rows }));
  fitAddon.fit()
};

const handleSelectChange = async (value:any) => {
};

const fetchPodDetail = async () => {
  checkStoreData();

  try {
    const result = await api.getPodDetail(clusterStore.id!, clusterStore.curNamespace!, podname.value);
    k8sPod.value = result.data as K8sPod;
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