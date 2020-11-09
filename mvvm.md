- vue的数据响应原理 根据object.defaineProperty()搭配发布订阅及渲染模板来实现

```js
class Dep{     
    constructor() {
        this.events = []; // 设置一个events 为空数组
    }
    addWatcher(watcher) {
        this.events.push(watcher)  // 将watcher 添加到events数组里面
    }
    targetWatcher () {
        this.events.length > 0 && this.events.forEach(item => { // 如果this.events的长度大于零的话 执行下面操作
            item.changeTextContent()  // 第八步
        })
    }
}
Dep.target = null;

let dep = new Dep(); // 实例化Dep

class Observer{ // 数据劫持
    constructor(data) {
        if (typeof data !== 'object' || data === '') { //判断data的类型 如果是对像  或者为空时  return 一个空
            return;
        }
        this.data = data; // 设置一个data赋值
        this.init();// 第四步 调用this.init() 方法
    }
    init () {
        Object.keys(this.data).forEach(item => { //拿到第一层的keys 循环遍历数组的每一项
            this.observer(this.data, item, this.data[item]) // 第五步 调用this.observer() 并传入三个参数  当前data对象  每一项item  每一项索引对应的具体值
        })
    }
    observer (target, key, value) { // 解析三个传过来的三个参数
        new Observer(value) // 第六步 实例化一个observer
        // Object.defineProperty()的作用就是直接在一个对象上定义一个新属性，或者修改一个已经存在的属性  访问器属性
        Object.defineProperty(target, key, { // 接受三个参数 obj=》 当前对象  key=》 当前需要定义的属性名 第三个参数=》 属性描述符
            get () {// 只要一访问就会触发get 方法
                if (Dep.target) { // Dep.target 存不存在
                    Dep.addWatcher(Dep.target) // 存在的话 第七步 存在的话执行dep.addWatcher() 方法 并传入 Dep.target
                }
                return value // 如果没有的话直接返回value
            },
            set (newVal) {// 一修改值 就会触发 set 方法
                value = newVal; // 把之前老的值赋值掉
                dep.targetWatcher();// 执行dep.addWatcher() 方法  （Dep.target存在的话 第十步 不存在的话 第八步）
                new Observer(newVal) // 实例化一个Observer 并传入 新的值  
            }
        })
    }
}

const Utils = {
    setValue (node, data, key, content) { // 文档碎片、 参数对象、obj.age 、和 字符串value
        node[content] = this.getValue(data, key) // 将参数对象 和 obj.age 传入getValue
    },
    getValue (data, key) {
        if (key.indexOf('.') > -1) {// 检测指令里面有没有.（点）
            let vals = key.split('.');// 以.为中心分割
            vals.forEach(item => {// 循环遍历
                data = data[item]// 将data 重新赋值
            })
            return data //抛出data
        } else {
            return data[key] // 没有存在.（点）的话，直接抛出 ,                          
        }
    },
    changeValue (data, key, newVal) {  // data 传过来的对象  key 指令  newVal 传过来来新的value值
        if (key.indexOf('.') > -1) {  // 检测指令里面有没有.（点）
            let vals = key.split('.'); // 以.为中心分割
            for(let i = 0; i < vals.length - 1; i++) { // 循环遍历
                data = data[vals[i]] // 将data 重新赋值
                console.log(data, "data");
                
            }
            data[vals[vals.length - 1]] = newVal  // 将新传过来的值 赋值给原来的值
        } else {
            data[key] = newVal  // 没有存在.（点）的话，直接赋值
        }
        
    }
}



class Watcher{
    constructor(key, data, cbk) {  //解析传过来的三个参数
        Dep.target = this; // 将实例 挂载到 Dep 的target上面
        this.data = data; // 定义域一个data赋值
        this.key = key;// 定义一个key 赋值
        this.cbk = cbk;// 定义一个callback赋值
        this.init(); // 调用this.init() 方法
    }
    init () {
        this.value = Utils.getValue(this.data, this.key);  //在this上定义一个value为Utils下面的getValue方法的属性
        Dep.target = null; // 讲Dep.target 赋值为 null
        return this.value // 抛出this.value
    }
    changeTextContent () {
        let val = this.init()
        this.cbk(val)  // 第九步
    }
}

class Mvvm{   // 构造函数
    constructor({el, data}) {  // 构造器  解析出来一个 el data
        this.$el = document.getElementById(el);  // 在原型上挂载一个$el   获取到ID el dom标签
        this.$data = data;  // 在原型上挂载一个 $data
        this.init(); // 第一步 调用 this.init() 这个方法 
        this.initDom(); // 第三步 调用initDom() 方法
    }
    initDom() {
        let res = this.fagrment();  //第四步  将this.fagrment 方法给到res 上面
        this.compiler(res)  //第五步 调用this.compiler这个方法 并传入一个函数
        this.$el.appendChild(res);
    }
    fagrment() {
        let FraDom = document.createDocumentFragment();  // 方法创建了一虚拟的节点对象，节点对象包含所有属性和方法  创建一个文档碎片
        // 为什么需要创建文档对象  =》 如果不使用文档对象的话 每次添加都会刷新页面  而文档对象则是吧所有的 dom 元素 放在一起整体添加到html上面
        let firstChild;
        console.log(this.$el.firstChild, "文档碎片", this);
        
        while(firstChild = this.$el.firstChild) { // 把 dom 一次添加到文档碎片中
            FraDom.appendChild(firstChild)
        }
        return FraDom  //抛出文档碎片
    }
    compiler(node) {  // node 指的就是 this.fagrment这个方法
        if (node.nodeType === 1) {  // 判断如果是元素节点的话 就执行下面的代码   元素节点：1、属性节点：2、文本节点：3、注释节点：8、文档节点：9
            //Element.attributes 属性返回该元素所有属性节点的一个实时集合 ，该集合是一个 NamedNodeMap 对象，不是一个数组
            // 用es6 的方法把它装换成一个数组
            let isInp = [...node.attributes].filter(val => val.nodeName === 'v-model') // 过滤出来属性节点为v-model 这个
            console.log(isInp, "v-mode");
            
            if (isInp.length > 0) {// 如果存在含有v-model 这个指令的话
                let value = isInp[0].nodeValue; // 拿到对应的属性值 =》 obj.age
                console.log(value, "含有v-model");
                node.addEventListener('input', (e) => {  // dom 二级 绑定事件 第一个参数是事件名 第二个参数是 执行函数  第三个是布尔值，指定事件是否在捕获或冒泡阶段执行（可选）
                    let newValue = e.target.value;
                    console.log(value);
                    Utils.changeValue(this.$data, value, newValue)  // 第六步 调用Utils 下面的changeValue方法并传入 三个参数： 参数对象、obj.age 、和当前输入最新的值newValue
                })
                Utils.setValue(node, this.$data, value, 'value') // 调用 Utils 下面的setValue放法并传入 四个参数：文档碎片、 参数对象、obj.age 、和 一个字符串value
            }
        } else if (node.nodeType === 3) {  // 文本节点：3
            let value = node.textContent.indexOf('{{') > -1 && node.textContent.split('{{')[1].split('}}')[0];  // 识别出文本节点里面的指令
            value && Utils.setValue(node, this.$data, value, 'textContent'); // 调用Utils 下面的setValue方法 传入四个参数：文档碎片、 参数对象、obj.age 、和 一个字符串textContent
            value && new Watcher(value, this.$data, (val) => { // 实例化一个watcher并传入  指令 、 data对象 和一个箭头函数
                node.textContent = val;
            })
        }
        if (node.childNodes && node.childNodes.length > 0) { // 如果存在子节点并且数量大于0 则执行下面的代码
            node.childNodes.forEach(item => { // 循环遍历所有的子节点
                this.compiler(item)  // 将每一个子节点 传入compiler方法  递归
            })
        }
    }
    
    init () {
        console.log(Object.keys(this.$data));
        Object.keys(this.$data).forEach(item => {  //拿到第一层的keys 循环遍历它
            this.observer(this, item, this.$data[item])  //第二步 调用 observer 并传入 实例对象 每一项 和每一项对应的值
        })
        new Observer(this.$data) // 第三步  实例化一个Observer并传入一个 data对象
    }
    observer (target, key, value) {  // 接受传过来的每一项参数
        // Object.defineProperty()的作用就是直接在一个对象上定义一个新属性，或者修改一个已经存在的属性  访问器属性
        Object.defineProperty(target, key, {   // 接受三个参数 obj=》 当前对象  key=》 当前需要定义的属性名 第三个参数=》 属性描述符
            get () { // 只要一访问就会触发get 方法
                return value
            },
            set (newVal) {  // 一修改值 就会触发 set 方法
                value = newVal  // 将之前的value修改
            }
        })
    }
}
```