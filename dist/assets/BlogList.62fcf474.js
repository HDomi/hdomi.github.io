import{_ as c,o,c as n,a as t,F as i,d as p,t as r,p as _,e as m}from"./index.4976206d.js";const v={components:{},mixins:[],props:{},data(){return{mdText:"",headers:[{text:"Dessert (100g serving)",value:"name"},{text:"Calories",value:"calories"},{text:"Fat (g)",value:"fat"},{text:"Carbs (g)",value:"carbs"},{text:"Protein (g)",value:"protein"},{text:"Iron (%)",value:"iron"}],desserts:[{name:"Frozen Yogurt",calories:159,fat:6},{name:"Ice cream sandwich",calories:237,fat:9},{name:"Eclair",calories:262,fat:16},{name:"Cupcake",calories:305,fat:3.7}]}},computed:{},presets:{},watch:{},mounted(){},methods:{test(e){this.$router.push({path:"/posting",query:{mdId:`${e}`}})}}};const l=e=>(_("data-v-d60b6348"),e=e(),m(),e),C={class:"page-wrap"},g=l(()=>t("h1",null,"\uBE14\uB85C\uADF8\uB9AC\uC2A4\uD2B8",-1)),x=l(()=>t("div",{class:"cutBar"},null,-1)),f={class:"posting-table",border:"1px"},h=l(()=>t("tr",null,[t("td",null,"\uC791\uC131\uC790"),t("td",null,"\uC81C\uBAA9"),t("td",null,"\uC0DD\uC131\uC77C")],-1));function B(e,a,b,I,d,u){return o(),n("div",C,[g,x,t("div",{class:"test",onClick:a[0]||(a[0]=s=>u.test("test"))},"test"),t("div",{class:"test",onClick:a[1]||(a[1]=s=>u.test("test2"))},"test2"),t("table",f,[h,(o(!0),n(i,null,p(d.desserts,s=>(o(),n("tr",{key:s.name},[t("td",null,r(s.name),1),t("td",null,r(s.calories),1),t("td",null,r(s.fat),1)]))),128))])])}const D=c(v,[["render",B],["__scopeId","data-v-d60b6348"]]);export{D as default};
