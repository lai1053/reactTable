支持IE8的操作步骤

1、在当前目录下执行npm run release输出资源文件
2、修改index.html文件
    将splitcss/blueTheme-1.css、splitcss/blueTheme-2.css...样式文件引入到文件中。
3、回到上级目录执行打包时，会将compatible/dist文件复制到website/ie8目录下面。如果是IE8浏览器访问产品时，将会跳转到该url.
