class Dep{
    constructor(){
        this.subs=[]
    }
    add(sub){
        this.subs.push(sub)
    }
    notify(v){
        this.subs.forEach((sub)=>{
            sub.update(v)
        })
    }
}

export default Dep;