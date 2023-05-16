import {VueLoaderPlugin} from "vue-loader";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import path from "path";

export default {
  mode: "development",
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimization: {
    minimize: false, // 打包后，不进行代码压缩
  },
  plugins: [new CleanWebpackPlugin(), new VueLoaderPlugin()],
};
