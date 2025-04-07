前言
为了方便引入资源，我们在tsconfig.json中以baseUrl+paths结合来配置别名
js 代码解读复制代码"baseUrl": "./src",
"paths":{
      "@code":["code/index.ts"]
    }

配置以后，编辑器（默认的配置为优先使用别名路径）还可以自动补全引入为：
js 代码解读复制代码import { fn } from '@code'
import User from "models/User.model.ts"

问题出现了
项目在本地dev启动没有报错，但是在build之后再执行node dist/main.js就报错：
"models/User.model.js" not found
居然报错找不到模块,排查一看产物代码，原来是路径没有被转换过。
ts终归是ts，node直接跑的是js。在tsconfig配的别名，在node可是不认账的~

为什么别人的react+ts等等项目就可以很爽地用上别名呢？
为什么dev启动的时候就没有报模块不存在呢？

编译没报错，运行时缺少模块
带着这个问题，首先review命令
start的命令是 "start": "ts-node -r tsconfig-paths/register src/main.ts",
而build的命令是 "rm -rf dist && tsc",
这里就发现是 tsconfig-paths/register 做了针对alias的处理。
而tsc是不处理alias path的!!
解决方案
一顿谷歌后，直接上解决方案

引入tsconfig-paths/register解决：继续使用tsc，执行tsconfig-paths/register dist/main.js
babel编译：抛弃tsc构建typescript，改用babel编译ts。
【推荐】现在nest cli已经更新，直接nest build封装好了一切，将build的脚本改为nest build问题解决。

使用nest build
我们来看看这个nest build
他就是

nest build is a wrapper on top of the standard tsc compiler (for standard projects) or the webpack compiler (for monorepos). It does not add any other compilation features or steps except for handling tsconfig-paths out of the box. The reason it exists is that most developers, especially when starting out with Nest, do not need to adjust compiler options (e.g., tsconfig.json file) which can sometimes be tricky.
See the nest build documentation for more details.

简单来说就是：
针对标准tsc编译的项目，为了避免出现例如本文所描述需要tsconfig-paths等情况，官方提供了一个封装脚本nest build。
总结
nest实践过程中，使用alias path时出现编译没报错，但运行时报错提示缺少模块的解决方案：

推荐使用nest build 来解决
手动引入tsconfig-paths/register解决
改babel/webpack编译构建
  标签： NestJS   

作者：IcPanda
链接：https://juejin.cn/post/6899334066978422792
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。