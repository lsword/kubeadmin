<template>
  <div>
    <div v-if="props.diffEditor" style="display: flex">
      <a-button type="text" :style="originalEditorStyle">{{ $t('components.configediter.originalconfig') }}</a-button>
      <a-button type="text" :style="modifiedEditorStyle">{{ $t('components.configediter.customconfig') }}</a-button>
    </div>
    <MonacoEditor
      :theme="theme"
      language="yaml"
      :options="monacoEditorOptions"
      :height="props.height"
      :diffEditor="props.diffEditor"
      :original="props.originalConf"
      :value="props.currentConf"
      :DigitalList="[]"
      :TailSepartorLabel="[]"
      :MiddleSepartorLabel="[]"
      :_interpolateUnit="(segment: string, unitIdx: number):string=>{return ''}"
      :_parseDecimal="(decimal: string):string=>{return ''}"
      :formatRMB="(num: number, prefix?: string):{errCode:number,msg:string,value:string}=>{return {errCode:0, msg:'', value: ''}}"
      @editorDidMount="editorDidMount"
    ></MonacoEditor>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import MonacoEditor from 'monaco-editor-vue3'
  import { useAppStore } from '@/store';

  const appStore = useAppStore();
  const theme = ref();
  appStore.$subscribe((mutation, state) => {
    if (appStore.appCurrentSetting.theme === 'dark')
      theme.value = "vs-dark";
    else
      theme.value = "vs-light";
  })

  const monacoEditorOptions = reactive<any>({});
  monacoEditorOptions.minimap = {
    enabled: false,
  };

  const originalEditorStyle = ref("width: calc(50%)");
  const modifiedEditorStyle = ref("width: calc(50%)");

  const props = defineProps({
    originalConf: String,
    currentConf: String,
    diffEditor: Boolean,
    height: Number,
  })

  const emit = defineEmits(['valueChanged'])
  const editorDidMount = (editor: { getOriginalEditor: () => any; getModifiedEditor: () => any; }) => {
   if (!props.diffEditor){
      return
   }
   const originalEditor = editor.getOriginalEditor();
   const modifiedEditor = editor.getModifiedEditor();
   originalEditor.onDidLayoutChange((e: { width: any; }) => {
      originalEditorStyle.value = `width: ${e.width}px`;
    })
    modifiedEditor.onDidLayoutChange((e: { width: any; }) => {
      modifiedEditorStyle.value = `width: ${e.width}px`;
    })
    modifiedEditor.onDidChangeModelContent((e: any) => {
      emit('valueChanged', modifiedEditor.getValue());
    })
  }
  
</script>

<style scoped lang="less">

</style>
