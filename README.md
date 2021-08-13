# EmojioneArea-open

基于[EmojioneArea](https://github.com/mervick/emojionearea)开发的表情输入框插件，使用方法和支持的api请参考[https://github.com/mervick/emojionearea#readme](https://github.com/mervick/emojionearea#readme)。

## 在以上基础上并新增和优化了本部分功能属性：

## Options

#### `disabled`
禁用属性，设置为true将不能进行输入等功能

**type**: `boolen`
**default**: `false`

Example:
```js
$(".emojionearea").emojioneArea({
    disabled: true,
});
```

#### `insert`
插入文本功能的插入字符串内容，当内容为空时将不展示插入按钮

**type**: `string`
**default**: ``

Example:
```js
$(".emojionearea").emojioneArea({
    insert: '${money}',
});
```

#### `cdn`
表情插件所需要的静态资源地址

**type**: `string`
**default**: `https://cdn.jsdelivr.net/npm/emojionearea-open@xxx/assets`

Example:
```js
$(".emojionearea").emojioneArea({
    cnd: "https://cdn.jsdelivr.net/npm/emojionearea-open@xxx/assets",
});
```


## 使用方法1

#### 使用[npm](https://www.npmjs.com/)安装, 在vuecli中使用

```bash
npm install emojionearea-open
```

Simple usage:
```js
import 'emojionearea-open/dist/emojionearea.min.js';
import 'emojionearea-open/dist/emojionearea.min.css';

export default {
  mounted(){
    $(this.$refs.textarea).emojioneArea();
  },
}
```

插件时基于jquery开发的，因此要提前引入jquery，

方式一：
```html
<script type="text/javascript" src="file/to/path/dist/jquery.min.js"></script>
```

方式二：
vue.config.js
```js
const webpack = require('webpack');
module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
      }),
    ]
  }
}
```

## 使用方法2

Add the following lines to the `head`:
```html
<script type="text/javascript" src="file/to/path/dist/jquery.min.js"></script>
<link rel="stylesheet" href="file/to/path/dist/emojionearea.min.css">
<script type="text/javascript" src="file/to/path/dist/emojionearea.min.js"></script>
```
Simple usage:

```html
<textarea id="textarea"></textarea>
<script type="text/javascript">
  $(document).ready(function() {
    $("#textarea").emojioneArea();
  });
</script>