import Dep from "./Dep.js";
import util from "./util.js";

class Watcher{
    constructor(vm,exp,cb){
        Dep.target=this;
        util.getValue(vm,exp)
        this.cb=cb;
        Dep.target=null;
    }
    update(v){
        this.cb(v)
    }
}
export default Watcher