import{r as nt,s as K,x as ot}from"./reportApi-C0aArLra.js";import{a as at,s as I}from"./index-QRUKYvUN.js";import{s as R}from"./index-D8GJULvM.js";import{W as M,Y as j,ap as Y,$ as q,aB as F,s as lt,z as rt,o as p,c as S,a as y,G as N,aa as B,y as H,j as z,t as x,aJ as $,aK as P,N as it,F as T,r as U,g as O,P as st,w as m,l as ut,h as w,d as dt,e as ct,O as gt,f as pt,aI as bt,p as ft,k as v,u as d,I as ht,i as W,q as _,_ as vt}from"./index-C-rOU8lt.js";import{E as mt}from"./EcPageLayout-DhmBwfqG.js";import{E as yt,H as wt,a as St}from"./EcMoneyDisplay-JVrehZ4t.js";import{u as kt}from"./useReadyStatus-g_NaJMe1.js";import"./index-DnmRHSY3.js";import"./index-BKdXVgxP.js";var _t=`
    .p-togglebutton {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .p-togglebutton-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .p-togglebutton-checked .p-togglebutton-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .p-togglebutton:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .p-togglebutton.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .p-togglebutton:disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .p-togglebutton-label,
    .p-togglebutton-icon {
        position: relative;
        transition: none;
    }

    .p-togglebutton-icon {
        color: dt('togglebutton.icon.color');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
        color: dt('togglebutton.icon.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
        color: dt('togglebutton.icon.checked.color');
    }

    .p-togglebutton:disabled .p-togglebutton-icon {
        color: dt('togglebutton.icon.disabled.color');
    }

    .p-togglebutton-sm {
        padding: dt('togglebutton.sm.padding');
        font-size: dt('togglebutton.sm.font.size');
    }

    .p-togglebutton-sm .p-togglebutton-content {
        padding: dt('togglebutton.content.sm.padding');
    }

    .p-togglebutton-lg {
        padding: dt('togglebutton.lg.padding');
        font-size: dt('togglebutton.lg.font.size');
    }

    .p-togglebutton-lg .p-togglebutton-content {
        padding: dt('togglebutton.content.lg.padding');
    }

    .p-togglebutton-fluid {
        width: 100%;
    }
`,Ot={root:function(e){var n=e.instance,l=e.props;return["p-togglebutton p-component",{"p-togglebutton-checked":n.active,"p-invalid":n.$invalid,"p-togglebutton-fluid":l.fluid,"p-togglebutton-sm p-inputfield-sm":l.size==="small","p-togglebutton-lg p-inputfield-lg":l.size==="large"}]},content:"p-togglebutton-content",icon:"p-togglebutton-icon",label:"p-togglebutton-label"},Bt=M.extend({name:"togglebutton",style:_t,classes:Ot}),Lt={name:"BaseToggleButton",extends:Y,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:"Yes"},offLabel:{type:String,default:"No"},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:Bt,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}};function V(t){"@babel/helpers - typeof";return V=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},V(t)}function Vt(t,e,n){return(e=Pt(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function Pt(t){var e=Tt(t,"string");return V(e)=="symbol"?e:e+""}function Tt(t,e){if(V(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var l=n.call(t,e);if(V(l)!="object")return l;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var G={name:"ToggleButton",extends:Lt,inheritAttrs:!1,emits:["change"],methods:{getPTOptions:function(e){var n=e==="root"?this.ptmi:this.ptm;return n(e,{context:{active:this.active,disabled:this.disabled}})},onChange:function(e){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,e),this.$emit("change",e))},onBlur:function(e){var n,l;(n=(l=this.formField).onBlur)===null||n===void 0||n.call(l,e)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return F(this.onLabel)&&F(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:" "},dataP:function(){return q(Vt({checked:this.active,invalid:this.$invalid},this.size,this.size))}},directives:{ripple:j}},xt=["tabindex","disabled","aria-pressed","aria-label","aria-labelledby","data-p-checked","data-p-disabled","data-p"],At=["data-p"];function It(t,e,n,l,c,a){var i=lt("ripple");return rt((p(),S("button",B({type:"button",class:t.cx("root"),tabindex:t.tabindex,disabled:t.disabled,"aria-pressed":t.d_value,onClick:e[0]||(e[0]=function(){return a.onChange&&a.onChange.apply(a,arguments)}),onBlur:e[1]||(e[1]=function(){return a.onBlur&&a.onBlur.apply(a,arguments)})},a.getPTOptions("root"),{"aria-label":t.ariaLabel,"aria-labelledby":t.ariaLabelledby,"data-p-checked":a.active,"data-p-disabled":t.disabled,"data-p":a.dataP}),[y("span",B({class:t.cx("content")},a.getPTOptions("content"),{"data-p":a.dataP}),[N(t.$slots,"default",{},function(){return[N(t.$slots,"icon",{value:t.d_value,class:H(t.cx("icon"))},function(){return[t.onIcon||t.offIcon?(p(),S("span",B({key:0,class:[t.cx("icon"),t.d_value?t.onIcon:t.offIcon]},a.getPTOptions("icon")),null,16)):z("",!0)]}),y("span",B({class:t.cx("label")},a.getPTOptions("label")),x(a.label),17)]})],16,At)],16,xt)),[[i]])}G.render=It;var $t=`
    .p-selectbutton {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton {
        border-radius: 0;
        border-width: 1px 1px 1px 0;
    }

    .p-selectbutton .p-togglebutton:focus-visible {
        position: relative;
        z-index: 1;
    }

    .p-selectbutton .p-togglebutton:first-child {
        border-inline-start-width: 1px;
        border-start-start-radius: dt('selectbutton.border.radius');
        border-end-start-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton:last-child {
        border-start-end-radius: dt('selectbutton.border.radius');
        border-end-end-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton.p-invalid {
        outline: 1px solid dt('selectbutton.invalid.border.color');
        outline-offset: 0;
    }

    .p-selectbutton-fluid {
        width: 100%;
    }
    
    .p-selectbutton-fluid .p-togglebutton {
        flex: 1 1 0;
    }
`,Nt={root:function(e){var n=e.props,l=e.instance;return["p-selectbutton p-component",{"p-invalid":l.$invalid,"p-selectbutton-fluid":n.fluid}]}},zt=M.extend({name:"selectbutton",style:$t,classes:Nt}),Et={name:"BaseSelectButton",extends:Y,props:{options:Array,optionLabel:null,optionValue:null,optionDisabled:null,multiple:Boolean,allowEmpty:{type:Boolean,default:!0},dataKey:null,ariaLabelledby:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:zt,provide:function(){return{$pcSelectButton:this,$parentInstance:this}}};function Dt(t,e){var n=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=J(t))||e){n&&(t=n);var l=0,c=function(){};return{s:c,n:function(){return l>=t.length?{done:!0}:{done:!1,value:t[l++]}},e:function(b){throw b},f:c}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var a,i=!0,r=!1;return{s:function(){n=n.call(t)},n:function(){var b=n.next();return i=b.done,b},e:function(b){r=!0,a=b},f:function(){try{i||n.return==null||n.return()}finally{if(r)throw a}}}}function Ct(t){return Ft(t)||Rt(t)||J(t)||Kt()}function Kt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function J(t,e){if(t){if(typeof t=="string")return E(t,e);var n={}.toString.call(t).slice(8,-1);return n==="Object"&&t.constructor&&(n=t.constructor.name),n==="Map"||n==="Set"?Array.from(t):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?E(t,e):void 0}}function Rt(t){if(typeof Symbol<"u"&&t[Symbol.iterator]!=null||t["@@iterator"]!=null)return Array.from(t)}function Ft(t){if(Array.isArray(t))return E(t)}function E(t,e){(e==null||e>t.length)&&(e=t.length);for(var n=0,l=Array(e);n<e;n++)l[n]=t[n];return l}var Q={name:"SelectButton",extends:Et,inheritAttrs:!1,emits:["change"],methods:{getOptionLabel:function(e){return this.optionLabel?P(e,this.optionLabel):e},getOptionValue:function(e){return this.optionValue?P(e,this.optionValue):e},getOptionRenderKey:function(e){return this.dataKey?P(e,this.dataKey):this.getOptionLabel(e)},isOptionDisabled:function(e){return this.optionDisabled?P(e,this.optionDisabled):!1},isOptionReadonly:function(e){if(this.allowEmpty)return!1;var n=this.isSelected(e);return this.multiple?n&&this.d_value.length===1:n},onOptionSelect:function(e,n,l){var c=this;if(!(this.disabled||this.isOptionDisabled(n)||this.isOptionReadonly(n))){var a=this.isSelected(n),i=this.getOptionValue(n),r;if(this.multiple)if(a){if(r=this.d_value.filter(function(g){return!$(g,i,c.equalityKey)}),!this.allowEmpty&&r.length===0)return}else r=this.d_value?[].concat(Ct(this.d_value),[i]):[i];else{if(a&&!this.allowEmpty)return;r=a?null:i}this.writeValue(r,e),this.$emit("change",{originalEvent:e,value:r})}},isSelected:function(e){var n=!1,l=this.getOptionValue(e);if(this.multiple){if(this.d_value){var c=Dt(this.d_value),a;try{for(c.s();!(a=c.n()).done;){var i=a.value;if($(i,l,this.equalityKey)){n=!0;break}}}catch(r){c.e(r)}finally{c.f()}}}else n=$(this.d_value,l,this.equalityKey);return n}},computed:{equalityKey:function(){return this.optionValue?null:this.dataKey},dataP:function(){return q({invalid:this.$invalid})}},directives:{ripple:j},components:{ToggleButton:G}},Wt=["aria-labelledby","data-p"];function Mt(t,e,n,l,c,a){var i=it("ToggleButton");return p(),S("div",B({class:t.cx("root"),role:"group","aria-labelledby":t.ariaLabelledby},t.ptmi("root"),{"data-p":a.dataP}),[(p(!0),S(T,null,U(t.options,function(r,g){return p(),O(i,{key:a.getOptionRenderKey(r),modelValue:a.isSelected(r),onLabel:a.getOptionLabel(r),offLabel:a.getOptionLabel(r),disabled:t.disabled||a.isOptionDisabled(r),unstyled:t.unstyled,size:t.size,readonly:a.isOptionReadonly(r),onChange:function(f){return a.onOptionSelect(f,r,g)},pt:t.ptm("pcToggleButton")},st({_:2},[t.$slots.option?{name:"default",fn:m(function(){return[N(t.$slots,"option",{option:r,index:g},function(){return[y("span",B({ref_for:!0},t.ptm("pcToggleButton").label),x(a.getOptionLabel(r)),17)]})]}),key:"0"}:void 0]),1032,["modelValue","onLabel","offLabel","disabled","unstyled","size","readonly","onChange","pt"])}),128))],16,Wt)}Q.render=Mt;const jt=ut("needsVsWants",()=>{const t=w([]),e=w([]),n=w(!1),l=w(null);async function c(){n.value=!0,l.value=null;try{const i=await nt.getNeedsVsWants();t.value=i.data,e.value=i.fields}catch(i){throw l.value=i instanceof Error?i.message:"Failed to load needs vs wants data",i}finally{n.value=!1}}const a=kt({loading:n,error:l});return{data:t,fields:e,loading:n,error:l,ready:a,fetch:c}}),Yt={class:"report-controls"},qt={class:"report-table-panel"},Ht={class:"report-chart-panel"},Ut=dt({__name:"NeedsVsWantsReportPage",setup(t){const e=new Set(["budgeted_needs","actual_needs","budgeted_wants","actual_wants","budgeted_savings","actual_savings"]);function n(o){return e.has(o)}function l(o){const[s,u]=o.split("-");return new Date(Number(s),Number(u)-1).toLocaleDateString("en-GB",{month:"short",year:"numeric"})}function c(o){return o.endsWith("-01")}function a(o){return Number(o.split("-")[0])}const i=ct(),r=jt(),{isMobile:g}=gt(),b=w("budgeted"),f=w(null),L=w(null),D=w(!1),X=[{label:"Budgeted",value:"budgeted"},{label:"Actual",value:"actual"}];pt(async()=>{i.setHeading("Needs vs Wants"),await r.fetch().catch(()=>{}),await bt(),D.value=!0});const A=_(()=>{const o=r.data.map(s=>a(s.period));return[...new Set(o)].sort()});ft(A,o=>{if(o.length>0&&f.value===null){const s=new Date().getFullYear();f.value=Math.max(o[0],s-1),L.value=o[o.length-1]}});const h=_(()=>f.value===null||L.value===null?r.data:r.data.filter(o=>{const s=a(o.period);return s>=f.value&&s<=L.value})),Z=_(()=>r.fields.filter(o=>o.class==="all"||o.class===b.value)),C=_(()=>h.value.map(o=>o.period)),tt=_(()=>b.value==="budgeted"?[{name:"Needs",data:h.value.map(o=>o.budgeted_needs_pct)},{name:"Wants",data:h.value.map(o=>o.budgeted_wants_pct)},{name:"Savings",data:h.value.map(o=>o.budgeted_savings_pct)}]:[{name:"Needs",data:h.value.map(o=>o.actual_needs_pct)},{name:"Wants",data:h.value.map(o=>o.actual_wants_pct)},{name:"Savings",data:h.value.map(o=>o.actual_savings_pct)}]),et=_(()=>({chart:{id:"needs-vs-wants-chart",toolbar:{show:!1},animations:{enabled:!1},stacked:!0},colors:["#ef4444","#6366f1","#22c55e"],xaxis:{type:"category",categories:C.value.map(l),labels:{rotate:-45,rotateAlways:!1,formatter:o=>{const s=C.value.find(u=>l(u)===o);return s?c(s)?o:"":o}},axisTicks:{show:!1}},yaxis:{min:0,max:100,labels:{formatter:o=>`${o}%`}},dataLabels:{enabled:!1},tooltip:{y:{formatter:o=>`${o}%`}},grid:{borderColor:"var(--p-surface-200)",strokeDashArray:3},legend:{show:!0},plotOptions:{bar:{columnWidth:"80%"}}}));return(o,s)=>(p(),O(mt,{"page-name":"needs-vs-wants-report"},{default:m(()=>[v(ht,{loading:d(r).loading,error:d(r).error},null,8,["loading","error"]),d(r).ready?(p(),S(T,{key:0},[y("div",Yt,[v(d(Q),{modelValue:b.value,"onUpdate:modelValue":s[0]||(s[0]=u=>b.value=u),options:X,"option-label":"label","option-value":"value","data-testid":"view-toggle"},null,8,["modelValue"]),v(d(R),{modelValue:f.value,"onUpdate:modelValue":s[1]||(s[1]=u=>f.value=u),options:A.value,placeholder:"From","data-testid":"from-year"},null,8,["modelValue","options"]),s[3]||(s[3]=y("span",{class:"year-separator"},"to",-1)),v(d(R),{modelValue:L.value,"onUpdate:modelValue":s[2]||(s[2]=u=>L.value=u),options:A.value,placeholder:"To","data-testid":"to-year"},null,8,["modelValue","options"])]),y("div",{class:H(["report-layout",{"report-layout--stacked":d(g)}])},[v(d(K),{class:"report-card"},{content:m(()=>[y("div",qt,[v(d(at),{value:h.value,size:"small",scrollable:"","scroll-height":"flex","data-testid":"needs-vs-wants-table"},{default:m(()=>[(p(!0),S(T,null,U(Z.value,u=>(p(),S(T,{key:u.name},[u.name==="period"?(p(),O(d(I),{key:0,field:"period",header:"Period"},{body:m(({data:k})=>[W(x(l(k.period)),1)]),_:1})):n(u.name)?(p(),O(d(I),{key:1,field:u.name,header:u.label,class:"col-money"},{body:m(({data:k})=>[v(yt,{"model-value":k[u.name],emphasis:d(St).Item,"highlight-mode":d(wt).None},null,8,["model-value","emphasis","highlight-mode"])]),_:2},1032,["field","header"])):(p(),O(d(I),{key:2,field:u.name,header:u.label,class:"col-money"},{body:m(({data:k})=>[W(x(k[u.name])+"% ",1)]),_:2},1032,["field","header"]))],64))),128))]),_:1},8,["value"])])]),_:1}),v(d(K),{class:"report-card"},{content:m(()=>[y("div",Ht,[D.value?(p(),O(d(ot),{key:0,type:"bar",options:et.value,series:tt.value,height:"100%","data-testid":"needs-vs-wants-chart"},null,8,["options","series"])):z("",!0)])]),_:1})],2)],64)):z("",!0)]),_:1}))}}),ae=vt(Ut,[["__scopeId","data-v-1afde4fd"]]);export{ae as default};
