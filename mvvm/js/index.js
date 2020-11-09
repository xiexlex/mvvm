import Vue from "./vue.js"

let  vm=new Vue ({
    el:'#box',
    data:{
        user:{
            username:'',
            age:''
        }
    }
})

window.vm=vm