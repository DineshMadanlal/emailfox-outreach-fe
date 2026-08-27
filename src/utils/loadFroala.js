export const loadFroalaAssets = async () => {
  await Promise.all([
    import(
      /* webpackChunkName: "froala-editor" */
      'froala-editor/js/plugins.pkgd.min.js'
    ),

    import(
      /* webpackChunkName: "froala-editor" */
      'froala-editor/js/third_party/image_tui.min'
    ),

    import(
      /* webpackChunkName: "froala-editor" */
      'froala-editor/css/froala_editor.pkgd.min.css'
    ),

    import(
      /* webpackChunkName: "froala-editor" */
      'froala-editor/css/froala_style.min.css'
    ),
  ]);
};
