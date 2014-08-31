require.config({
    paths: {
        jsx: "js/require-jsx",
        JSXTransformer: 'js/react/JSXTransformer'
    },

    shim: {
        JSXTransformer: {
            exports: "JSXTransformer"
        }
    }
});