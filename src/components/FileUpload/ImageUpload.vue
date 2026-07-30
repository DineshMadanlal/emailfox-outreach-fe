<template>
  <div class="upload-picture-component">
    <input
      :id="`upload-picture-${uniqueId}`"
      :ref="`fileInput-${uniqueId}`"
      class="hidden"
      type="file"
      :accept="accept"
      @change="onFileChange"
    >

    <slot
      name="fileLabel"
      :isUploading="isUploading"
      :progress="progressWidth"
      :openFilePicker="openFilePicker"
    />
  </div>
</template>

<script>
// vue
import { reactive, toRefs, getCurrentInstance } from 'vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';

export default {
  name: 'UploadPicture',

  props: {
    uniqueId: {
      type: [String, Number],
      default: '',
    },

    accept: {
      type: String,
      default: 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml',
    },

    maxSizeInMB: {
      type: Number,
      default: 2,
    },
  },

  emits: [
    'uploadBegin',
    'onProgress',
    'uploadComplete',
    'uploadError',
  ],

  setup(props, { emit }) {
    // current instance
    const { proxy, appContext } = getCurrentInstance();

    // state
    const state = reactive({
      progressWidth: 0,
      isUploading: false,
      uploadRequest: null,
    });

    // methods
    const notifyError = (message) => {
      appContext.config.globalProperties.$toast({
        warning: true,
        message,
      });
    };

    const openFilePicker = () => {
      proxy.$refs[`fileInput-${props.uniqueId}`]?.click();
    };

    const validateFile = (file) => {
      const isImage = file.type?.startsWith('image/');

      if (!isImage) {
        throw new Error(`${file.type || 'This file'} is not supported for uploads.`);
      }

      const maxSizeInBytes = props.maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        throw new Error(`Logo size should be less than ${props.maxSizeInMB}MB.`);
      }
    };

    const getLogoSignedUrl = async (file) => {
      try {
        const response = await postApiCall({
          includeWorkspace: true,
          endpoint: '/get-logo-signed-url',
          payload: {
            filename: file.name,
            content_type: file.type,
          },
        });

        return response;
      } catch (error) {
        throw new Error(error.message);
      }
    };

    const uploadToAws = ({
      requestUrl,
      file,
      fileUrl,
      filename,
    }) => new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      state.uploadRequest = req;

      req.open('PUT', requestUrl, true);
      req.setRequestHeader('Content-Type', file.type);

      req.upload.addEventListener('progress', (event) => {
        if (!event.lengthComputable) return;

        state.progressWidth = Math.round(
          (event.loaded / event.total) * 100,
        );

        emit('onProgress', state.progressWidth);
      });

      req.onabort = () => {
        state.progressWidth = 0;
        state.uploadRequest = null;

        reject(new Error('Upload cancelled.'));
      };

      req.onerror = () => {
        state.progressWidth = 0;
        state.uploadRequest = null;

        reject(new Error('Could not upload image.'));
      };

      req.onload = () => {
        if (req.status < 200 || req.status >= 300) {
          reject(new Error('Could not upload image.'));
          return;
        }

        state.progressWidth = 0;
        state.uploadRequest = null;

        resolve({
          fileUrl,
          filename,
        });
      };

      req.send(file);
    });

    const upload = async (file) => {
      try {
        validateFile(file);

        state.isUploading = true;

        emit('uploadBegin');

        const signedUrlResponse = await getLogoSignedUrl(file);

        const uploadedFile = await uploadToAws({
          requestUrl: signedUrlResponse.request_url,
          fileUrl: signedUrlResponse.file_url,
          filename: signedUrlResponse.filename,
          file,
        });

        emit('uploadComplete', uploadedFile);
      } catch (error) {
        notifyError(error.message || 'Could not upload image.');

        emit('uploadError', error);
      } finally {
        state.isUploading = false;

        const inputRef = proxy.$refs[`fileInput-${props.uniqueId}`];

        if (inputRef) {
          inputRef.value = '';
        }
      }
    };

    const onFileChange = (event) => {
      const files = event.target.files || event.dataTransfer?.files;

      if (!files?.length) return;

      upload(files[0]);
    };

    return {
      // state
      ...toRefs(state),

      // methods
      openFilePicker,
      onFileChange,
    };
  },
};
</script>
