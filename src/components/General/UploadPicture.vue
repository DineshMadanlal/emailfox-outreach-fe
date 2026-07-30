<template>
  <div class="upload-picture-component">
    <!-- input -->
    <input
      :id="`upload-picture-${uniqueId}`"
      ref="fileInput"
      class="hidden"
      type="file"
      accept="image/*"
      @change="onFileChange"
    />

    <!-- slot -->
    <slot name="fileLabel" />

    <ApiLoader :show="isUploading" />
  </div>
</template>

<script>
// Vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'UploadPicture',

  components: {
    ApiLoader,
  },

  props: {
    uniqueId: {
      type: [String, Number],
      default: '',
    },
    uploadAction: {
      type: String,
      default: 'user/getProfileSignedURL',
    },
    maxSize: {
      type: Number,
      default: 1024, // Default to 1 MB
    },
  },

  emits: ['uploadBegin', 'uploadProgress', 'uploadComplete'],

  setup(props, { emit, expose }) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      req: null,
      fileInput: null,
      progressWidth: 0,
      isUploading: false,
    });

    const triggerFile = () => {
      state.fileInput?.click();
    };

    const uploadToAws = (requestUrl, file, fileUrl) => {
      state.req = new XMLHttpRequest();
      state.isUploading = true;

      if (state.req.upload) {
        state.req.open('PUT', requestUrl, true);
        state.req.setRequestHeader('Content-Type', file.type); // REQUIRED for 403 fix

        state.req.upload.addEventListener('progress', (e) => {
          state.progressWidth = (e.loaded / e.total) * 100;
          emit('uploadProgress', state.progressWidth);
        });

        state.req.addEventListener('load', () => {
          state.isUploading = false;
          state.progressWidth = 0;
          state.req = null;
          emit('uploadComplete', { fileUrl });
        });

        state.req.onabort = () => {
          state.progressWidth = 0;
          state.req = null;
          state.isUploading = false;
        };

        state.req.send(file);
      }
    };

    const requestSignedUrlAndUpload = async (file) => {
      try {
        state.isUploading = true;

        const response = await postApiCall({
          endpoint: props.uploadAction,
          payload: {
            filename: file.name,
            content_type: file.type,
          },
        });

        if (!response) {
          appContext.config.globalProperties.$toast({
            warning: true,
            message: response.message,
          });
          return;
        }

        const { request_url: requestUrl, file_url: fileUrl } = response;
        uploadToAws(requestUrl, file, fileUrl);
      } catch (e) {
        state.isUploading = false;

        appContext.config.globalProperties.$toast({
          warning: true,
          message: e?.body?.error || e.message || 'Could not upload image',
        });
      }
    };

    const readAndUpload = (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        emit('uploadBegin');
        requestSignedUrlAndUpload(file);
      };
      reader.readAsDataURL(file);
    };

    const onFileChange = (e) => {
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        e.target.value = ''; // Reset input
        return;
      }

      const file = files[0];
      if (!file.type.startsWith('image/')) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Only image files are allowed.',
        });

        state.fileInput = '';
        e.target.value = ''; // Reset input
        return;
      }

      // Check file size
      if (file.size > props.maxSize * 1024) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: `File is too large. Max size is ${props.maxSizeKB}KB.`,
        });

        state.fileInput = '';
        e.target.value = ''; // Reset input

        return;
      }

      readAndUpload(file);

      // ✅ Reset after processing so the same file can be picked again
      e.target.value = '';
    };

    expose({
      triggerFile,
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onFileChange,
      triggerFile,
    };
  },
});
</script>

<style scoped>
.upload-picture-component {
  display: inline-block;
}
</style>
