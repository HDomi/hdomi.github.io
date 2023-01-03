import{a as g}from"./axios.f257fe29.js";import{_ as y,c as r,b as s,t as d,F as u,r as v,o as p,p as w,d as f}from"./index.e8c8171d.js";const C={components:{},mixins:[],props:{},data(){return{mdText:"",categories:new Array,categoryNames:new Array,postingLength:0}},computed:{},presets:{},watch:{},created(){},async mounted(){this.fetchPosts()},methods:{async fetchPosts(){let e=new Array;await g.get("https://api.github.com/repos/hdomi/posts/contents").then(t=>e=t.data).catch(t=>console.log(`Category ERROR\u{1F644} ${t.response.status} : ${t.request.responseURL}`)),e.forEach(async t=>{if(t.name!=="img"){this.categoryNames.push(t.name);let i=await this.getPosts(t.name);this.categories.push({name:t.name,posts:i})}})},getPosts(e){return new Promise(t=>{let i=new Array,h=new Array,n=new Array;g.get(`https://api.github.com/repos/hdomi/posts/contents/${e}`).then(l=>{i=l.data,i.forEach(a=>{if(a.name!=="img"){const o=a.name.split("-"),c=o[2].replace(".md","");h.push({name:a.name,title:o[0],date:o[1],description:c})}}),this.postingLength=this.postingLength+h.length,n=h.sort(_);function _(a,o){var c=new Date(a.date).getTime(),m=new Date(o.date).getTime();return c>m?-1:1}t(n)})})},goPost(e){this.$router.push({path:"/posting",query:{mdId:`${e}`}})}}};const A=e=>(w("data-v-232873a3"),e=e(),f(),e),P={class:"page-wrap2 scrollBar"},x={class:"page-wrap-inner"},D={class:"page-tit-wrap"},$=A(()=>s("div",{class:"main-title"},"\uD3EC\uC2A4\uD305",-1)),L={class:"main-title",style:{"font-size":"14px"}},k={class:"category-title"},E={class:"posting-item-wrap"},B=["onClick"],I={class:"pt-item-inner"},S={class:"pt-item-title"},R={class:"pt-item-text"},b={class:"pt-item-date"},F={class:"pt-item-desc"};function N(e,t,i,h,n,l){return p(),r("div",P,[s("div",x,[s("div",D,[$,s("div",L,"\uCD1D \uD3EC\uC2A4\uD305 \uC218 ("+d(n.postingLength)+"\uAC1C)",1)]),(p(!0),r(u,null,v(n.categories,(_,a)=>(p(),r("div",{key:`category${a}`,class:"category-wrap"},[s("div",k,d(_.name),1),s("div",E,[(p(!0),r(u,null,v(_.posts,(o,c)=>(p(),r("div",{key:`post${c}`,onClick:m=>l.goPost(o.name),class:"posting-item"},[s("div",I,[s("div",S,d(o.title),1),s("div",R,[s("div",b,d(o.date),1),s("div",F,d(o.description),1)])])],8,B))),128))])]))),128))])])}const z=y(C,[["render",N],["__scopeId","data-v-232873a3"]]);export{z as default};
