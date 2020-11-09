import Watcher from './Watch.js';
import Dep from './Dep.js';
import util from './util.js';

class Vue {
    constructor(option) {
        this.$el = option.el;
        this.$data = option.data
        this.observer(this.$data)
        this.proxy(this.$data)
        this.compile(this.$el)
    }
    proxy(obj) {
        Object.keys(obj).forEach((key) => {
            Object.defineProperty(this, key, {
                get() {
                    return this.$data[key]
                },
                set(v) {
                    this.$data[key] = v;
                }
            })
        })
    }
    observer(obj) {
        Object.keys(obj).forEach((key) => {
            console.log(obj, key)
            let value = obj[key];
            let dep = new Dep();
            if (typeof value === "object") {
                console.log(typeof value, value)
                this.observer(value)
            }
            Object.defineProperty(obj, key, {
                get() {
                    if (Dep.target) {
                        dep.add(Dep.target)
                    }
                    return value;
                },
                set(v) {
                    console.log("update", v)
                    if (v !== value) {
                        // console.log("update2222")
                        value = v;
                        dep.notify(v)   //  watcherins.update(v)
                    }
                }

            })
        })
    }
    compile(el) {
        let element = document.querySelector(el);
        this.compileTemplate(element)
    }
    compileTemplate(tem) {
        console.log(tem)
        let nodes = tem.childNodes;
        [...nodes].forEach((node) => {
            if (node.nodeType === 3) {
                let reg = /\{\{\s*(\S*)\s*\}\}/  // {{  xxx  }}
                if (reg.test(node.textContent)) {
                    //node.textContent=this.$data[RegExp.$1] // RegExp.$1
                    node.textContent = util.getValue(this, RegExp.$1)
                    //watcher new       保存
                    new Watcher(this, RegExp.$1, (newValue) => {
                        console.log(newValue)
                        node.textContent = newValue
                    })
                }
            }
            else if (node.nodeType === 1) {
                let attrs = node.attributes
                Array.from(attrs).forEach((attr) => {
                    var name = attr.name
                    var value = attr.value
                    if (name.startsWith("v-")) {
                        let dir = name.substr(2)
                        if (dir === "model") {
                            //node.value=this.$data[value]

                            node.value = util.getValue(this, value)
                            node.oninput = (e) => {
                                // this.$data[value]=e.target.value
                                util.setValue(this, value, e.target.value)
                            }
                            new Watcher(this, value, (value) => {
                                node.value = value
                            })
                        }

                    }
                })
            }
            if (node.childNodes.length > 0) {
                this.compileTemplate(node)
            }
        })
    }

}

export default Vue;
