import{F as v,a as m}from"./FadeLoader.76cf0f62.js";import{_ as k,c as o,a as t,d as f,e as y,b as w,n as A,F as _,r as C,t as d,o as i,w as L,v as D,f as B}from"./index.bd425abc.js";const E={components:{FadeLoader:v},mixins:[],props:{},data(){return{mdText:"",categories:new Array,categoryNames:new Array,checkedCategory:new Array,postingLength:0,isLoading:!1,categoryState:!1,pageState:!1}},computed:{},presets:{},watch:{checkedCategory(){this.isLoading=!0,this.categories=[],this.postingLength=0,this.checkedCategory.forEach(async n=>{let e=await this.getPosts(n);this.categories.push({name:n,posts:e})}),this.checkedCategory.length!==0?this.pageState=!0:this.pageState=!1,this.isLoading=!1}},created(){},async mounted(){this.fetchPosts()},methods:{async fetchPosts(){this.isLoading=!0;let n=new Array;await m.get("https://api.github.com/repos/hdomi/posts/contents").then(e=>n=e.data).catch(e=>console.log(`Category ERROR\u{1F644} ${e.response.status} : ${e.request.responseURL}`)),n.forEach(async e=>{e.name!=="img"&&this.categoryNames.push(e.name)}),this.checkedCategory=this.categoryNames,this.isLoading=!1},getPosts(n){return new Promise(e=>{let g=new Array,h=new Array,a=new Array;m.get(`https://api.github.com/repos/hdomi/posts/contents/${n}`).then(l=>{g=l.data,g.forEach(s=>{if(s.name!=="img"){const r=s.name.split("-"),c=r[2].replace(".md","");h.push({name:s.name,title:r[0],date:r[1],description:c})}}),this.postingLength=this.postingLength+h.length,a=h.sort(u);function u(s,r){var c=new Date(s.date).getTime(),p=new Date(r.date).getTime();return c>p?-1:1}console.log(`\uD604\uC7AC \uCCB4\uD06C \uCE74\uD14C\uACE0\uB9AC
`,this.checkedCategory,this.checkedCategory.length,`
\uBD88\uB7EC\uC628 \uAC8C\uC2DC\uAE00 \uC218
`,this.postingLength),e(a)})})},openCategory(){this.categoryState=!this.categoryState},goPost(n,e){this.$router.push({path:"/posting",query:{mdPath:`${n}`,mdId:`${e}`}})}}};const x={class:"page-wrap scrollBar"},P={key:0,class:"loading-container"},S={class:"loading"},b={class:"page-wrap-inner"},N={class:"page-tit-wrap"},F={class:"main-check-wrap"},V={key:0,class:"category-list"},R={class:"ckb-label"},T=["value"],q={class:"main-title",style:{"font-size":"14px"}},z={key:0,class:"list-wrap"},I={class:"category-title"},U={class:"posting-item-wrap"},$=["onClick"],M={class:"pt-item-inner"},O={class:"pt-item-title"},j={class:"pt-item-text"},G={class:"pt-item-date"},H={class:"pt-item-desc"},J={key:1};function K(n,e,g,h,a,l){const u=B("FadeLoader");return i(),o("div",x,[a.isLoading?(i(),o("div",P,[t("div",S,[f(u)])])):y("",!0),t("div",b,[t("div",N,[t("div",F,[t("div",{class:"main-title",onClick:e[0]||(e[0]=(...s)=>l.openCategory&&l.openCategory(...s))},[w("\uCE74\uD14C\uACE0\uB9AC"),t("span",{class:A(["tryAngle",{revert:a.categoryState}])},"\u25BC",2)]),a.categoryState?(i(),o("ul",V,[(i(!0),o(_,null,C(a.categoryNames,(s,r)=>(i(),o("li",{key:`chk-box${r}`},[t("label",R,[t("span",null,d(s),1),L(t("input",{"onUpdate:modelValue":e[1]||(e[1]=c=>a.checkedCategory=c),role:"switch",type:"checkbox",value:s},null,8,T),[[D,a.checkedCategory]])])]))),128))])):y("",!0)]),t("div",q,"\uCD1D \uD3EC\uC2A4\uD305 \uC218 ("+d(a.postingLength)+"\uAC1C)",1)]),a.pageState?(i(),o("div",z,[(i(!0),o(_,null,C(a.categories,(s,r)=>(i(),o("div",{key:`category${r}`,class:"category-wrap"},[t("div",I,d(s.name),1),t("div",U,[(i(!0),o(_,null,C(s.posts,(c,p)=>(i(),o("div",{key:`post${p}`,onClick:Q=>l.goPost(s.name,c.name),class:"posting-item"},[t("div",M,[t("div",O,d(c.title),1),t("div",j,[t("div",G,d(c.date),1),t("div",H,d(c.description),1)])])],8,$))),128))])]))),128))])):(i(),o("div",J,"\uAC8C\uC2DC\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."))])])}const Y=k(E,[["render",K],["__scopeId","data-v-cd26e881"]]);export{Y as default};