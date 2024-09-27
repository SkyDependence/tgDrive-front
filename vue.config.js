const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    port: 3000
  }
};
