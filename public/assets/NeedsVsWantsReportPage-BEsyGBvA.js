import{r as nt,s as C,x as ot}from"./reportApi-KO7jBzEC.js";import{a as at,s as I}from"./index-D31AWY29.js";import{s as K}from"./index-Bn8L4zEA.js";import{P as W,R as M,al as j,U as Y,aw as R,s as lt,z as rt,o as g,c as f,a as y,B as N,a4 as B,y as q,j as H,t as V,aJ as $,aK as T,a7 as it,F as x,r as U,g as O,aa as st,w as m,l as ut,h as w,d as dt,e as ct,I as gt,f as pt,aI as bt,p as ft,u,k as S,q as _,i as F,_ as ht}from"./index-2E9yD-Hx.js";import{E as vt}from"./EcPageLayout-rBry7IOm.js";import{E as mt,H as yt,a as wt}from"./EcMoneyDisplay-DTto43Gs.js";import"./index-D_tgyk7U.js";import"./index-BU66iemK.js";var St=`
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
`,kt={root:function(e){var n=e.instance,l=e.props;return["p-togglebutton p-component",{"p-togglebutton-checked":n.active,"p-invalid":n.$invalid,"p-togglebutton-fluid":l.fluid,"p-togglebutton-sm p-inputfield-sm":l.size==="small","p-togglebutton-lg p-inputfield-lg":l.size==="large"}]},content:"p-togglebutton-content",icon:"p-togglebutton-icon",label:"p-togglebutton-label"},_t=W.extend({name:"togglebutton",style:St,classes:kt}),Ot={name:"BaseToggleButton",extends:j,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:"Yes"},offLabel:{type:String,default:"No"},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:_t,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}};function P(t){"@babel/helpers - typeof";return P=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},P(t)}function Bt(t,e,n){return(e=Lt(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function Lt(t){var e=Vt(t,"string");return P(e)=="symbol"?e:e+""}function Vt(t,e){if(P(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var l=n.call(t,e);if(P(l)!="object")return l;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var J={name:"ToggleButton",extends:Ot,inheritAttrs:!1,emits:["change"],methods:{getPTOptions:function(e){var n=e==="root"?this.ptmi:this.ptm;return n(e,{context:{active:this.active,disabled:this.disabled}})},onChange:function(e){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,e),this.$emit("change",e))},onBlur:function(e){var n,l;(n=(l=this.formField).onBlur)===null||n===void 0||n.call(l,e)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return R(this.onLabel)&&R(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:" "},dataP:function(){return Y(Bt({checked:this.active,invalid:this.$invalid},this.size,this.size))}},directives:{ripple:M}},Pt=["tabindex","disabled","aria-pressed","aria-label","aria-labelledby","data-p-checked","data-p-disabled","data-p"],Tt=["data-p"];function xt(t,e,n,l,d,o){var c=lt("ripple");return rt((g(),f("button",B({type:"button",class:t.cx("root"),tabindex:t.tabindex,disabled:t.disabled,"aria-pressed":t.d_value,onClick:e[0]||(e[0]=function(){return o.onChange&&o.onChange.apply(o,arguments)}),onBlur:e[1]||(e[1]=function(){return o.onBlur&&o.onBlur.apply(o,arguments)})},o.getPTOptions("root"),{"aria-label":t.ariaLabel,"aria-labelledby":t.ariaLabelledby,"data-p-checked":o.active,"data-p-disabled":t.disabled,"data-p":o.dataP}),[y("span",B({class:t.cx("content")},o.getPTOptions("content"),{"data-p":o.dataP}),[N(t.$slots,"default",{},function(){return[N(t.$slots,"icon",{value:t.d_value,class:q(t.cx("icon"))},function(){return[t.onIcon||t.offIcon?(g(),f("span",B({key:0,class:[t.cx("icon"),t.d_value?t.onIcon:t.offIcon]},o.getPTOptions("icon")),null,16)):H("",!0)]}),y("span",B({class:t.cx("label")},o.getPTOptions("label")),V(o.label),17)]})],16,Tt)],16,Pt)),[[c]])}J.render=xt;var At=`
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
`,It={root:function(e){var n=e.props,l=e.instance;return["p-selectbutton p-component",{"p-invalid":l.$invalid,"p-selectbutton-fluid":n.fluid}]}},$t=W.extend({name:"selectbutton",style:At,classes:It}),Nt={name:"BaseSelectButton",extends:j,props:{options:Array,optionLabel:null,optionValue:null,optionDisabled:null,multiple:Boolean,allowEmpty:{type:Boolean,default:!0},dataKey:null,ariaLabelledby:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:$t,provide:function(){return{$pcSelectButton:this,$parentInstance:this}}};function zt(t,e){var n=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=G(t))||e){n&&(t=n);var l=0,d=function(){};return{s:d,n:function(){return l>=t.length?{done:!0}:{done:!1,value:t[l++]}},e:function(b){throw b},f:d}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,c=!0,r=!1;return{s:function(){n=n.call(t)},n:function(){var b=n.next();return c=b.done,b},e:function(b){r=!0,o=b},f:function(){try{c||n.return==null||n.return()}finally{if(r)throw o}}}}function Dt(t){return Kt(t)||Ct(t)||G(t)||Et()}function Et(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function G(t,e){if(t){if(typeof t=="string")return z(t,e);var n={}.toString.call(t).slice(8,-1);return n==="Object"&&t.constructor&&(n=t.constructor.name),n==="Map"||n==="Set"?Array.from(t):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?z(t,e):void 0}}function Ct(t){if(typeof Symbol<"u"&&t[Symbol.iterator]!=null||t["@@iterator"]!=null)return Array.from(t)}function Kt(t){if(Array.isArray(t))return z(t)}function z(t,e){(e==null||e>t.length)&&(e=t.length);for(var n=0,l=Array(e);n<e;n++)l[n]=t[n];return l}var Q={name:"SelectButton",extends:Nt,inheritAttrs:!1,emits:["change"],methods:{getOptionLabel:function(e){return this.optionLabel?T(e,this.optionLabel):e},getOptionValue:function(e){return this.optionValue?T(e,this.optionValue):e},getOptionRenderKey:function(e){return this.dataKey?T(e,this.dataKey):this.getOptionLabel(e)},isOptionDisabled:function(e){return this.optionDisabled?T(e,this.optionDisabled):!1},isOptionReadonly:function(e){if(this.allowEmpty)return!1;var n=this.isSelected(e);return this.multiple?n&&this.d_value.length===1:n},onOptionSelect:function(e,n,l){var d=this;if(!(this.disabled||this.isOptionDisabled(n)||this.isOptionReadonly(n))){var o=this.isSelected(n),c=this.getOptionValue(n),r;if(this.multiple)if(o){if(r=this.d_value.filter(function(p){return!$(p,c,d.equalityKey)}),!this.allowEmpty&&r.length===0)return}else r=this.d_value?[].concat(Dt(this.d_value),[c]):[c];else{if(o&&!this.allowEmpty)return;r=o?null:c}this.writeValue(r,e),this.$emit("change",{originalEvent:e,value:r})}},isSelected:function(e){var n=!1,l=this.getOptionValue(e);if(this.multiple){if(this.d_value){var d=zt(this.d_value),o;try{for(d.s();!(o=d.n()).done;){var c=o.value;if($(c,l,this.equalityKey)){n=!0;break}}}catch(r){d.e(r)}finally{d.f()}}}else n=$(this.d_value,l,this.equalityKey);return n}},computed:{equalityKey:function(){return this.optionValue?null:this.dataKey},dataP:function(){return Y({invalid:this.$invalid})}},directives:{ripple:M},components:{ToggleButton:J}},Rt=["aria-labelledby","data-p"];function Ft(t,e,n,l,d,o){var c=it("ToggleButton");return g(),f("div",B({class:t.cx("root"),role:"group","aria-labelledby":t.ariaLabelledby},t.ptmi("root"),{"data-p":o.dataP}),[(g(!0),f(x,null,U(t.options,function(r,p){return g(),O(c,{key:o.getOptionRenderKey(r),modelValue:o.isSelected(r),onLabel:o.getOptionLabel(r),offLabel:o.getOptionLabel(r),disabled:t.disabled||o.isOptionDisabled(r),unstyled:t.unstyled,size:t.size,readonly:o.isOptionReadonly(r),onChange:function(h){return o.onOptionSelect(h,r,p)},pt:t.ptm("pcToggleButton")},st({_:2},[t.$slots.option?{name:"default",fn:m(function(){return[N(t.$slots,"option",{option:r,index:p},function(){return[y("span",B({ref_for:!0},t.ptm("pcToggleButton").label),V(o.getOptionLabel(r)),17)]})]}),key:"0"}:void 0]),1032,["modelValue","onLabel","offLabel","disabled","unstyled","size","readonly","onChange","pt"])}),128))],16,Rt)}Q.render=Ft;const Wt=ut("needsVsWants",()=>{const t=w([]),e=w([]),n=w(!1),l=w(null);async function d(){n.value=!0,l.value=null;try{const o=await nt.getNeedsVsWants();t.value=o.data,e.value=o.fields}catch(o){throw l.value=o instanceof Error?o.message:"Failed to load needs vs wants data",o}finally{n.value=!1}}return{data:t,fields:e,loading:n,error:l,fetch:d}}),Mt={key:0,class:"status-message"},jt={key:1,class:"status-message status-message--error"},Yt={class:"report-controls"},qt={class:"report-table-panel"},Ht={class:"report-chart-panel"},Ut=dt({__name:"NeedsVsWantsReportPage",setup(t){const e=new Set(["budgeted_needs","actual_needs","budgeted_wants","actual_wants","budgeted_savings","actual_savings"]);function n(a){return e.has(a)}function l(a){const[i,s]=a.split("-");return new Date(Number(i),Number(s)-1).toLocaleDateString("en-GB",{month:"short",year:"numeric"})}function d(a){return a.endsWith("-01")}function o(a){return Number(a.split("-")[0])}const c=ct(),r=Wt(),{isMobile:p}=gt(),b=w("budgeted"),h=w(null),L=w(null),D=w(!1),X=[{label:"Budgeted",value:"budgeted"},{label:"Actual",value:"actual"}];pt(async()=>{c.setHeading("Needs vs Wants"),await r.fetch().catch(()=>{}),await bt(),D.value=!0});const A=_(()=>{const a=r.data.map(i=>o(i.period));return[...new Set(a)].sort()});ft(A,a=>{if(a.length>0&&h.value===null){const i=new Date().getFullYear();h.value=Math.max(a[0],i-1),L.value=a[a.length-1]}});const v=_(()=>h.value===null||L.value===null?r.data:r.data.filter(a=>{const i=o(a.period);return i>=h.value&&i<=L.value})),Z=_(()=>r.fields.filter(a=>a.class==="all"||a.class===b.value)),E=_(()=>v.value.map(a=>a.period)),tt=_(()=>b.value==="budgeted"?[{name:"Needs",data:v.value.map(a=>a.budgeted_needs_pct)},{name:"Wants",data:v.value.map(a=>a.budgeted_wants_pct)},{name:"Savings",data:v.value.map(a=>a.budgeted_savings_pct)}]:[{name:"Needs",data:v.value.map(a=>a.actual_needs_pct)},{name:"Wants",data:v.value.map(a=>a.actual_wants_pct)},{name:"Savings",data:v.value.map(a=>a.actual_savings_pct)}]),et=_(()=>({chart:{id:"needs-vs-wants-chart",toolbar:{show:!1},animations:{enabled:!1},stacked:!0},colors:["#ef4444","#6366f1","#22c55e"],xaxis:{type:"category",categories:E.value.map(l),labels:{rotate:-45,rotateAlways:!1,formatter:a=>{const i=E.value.find(s=>l(s)===a);return i?d(i)?a:"":a}},axisTicks:{show:!1}},yaxis:{min:0,max:100,labels:{formatter:a=>`${a}%`}},dataLabels:{enabled:!1},tooltip:{y:{formatter:a=>`${a}%`}},grid:{borderColor:"var(--p-surface-200)",strokeDashArray:3},legend:{show:!0},plotOptions:{bar:{columnWidth:"80%"}}}));return(a,i)=>(g(),O(vt,{"page-name":"needs-vs-wants-report"},{default:m(()=>[u(r).loading?(g(),f("div",Mt,"Loading...")):u(r).error?(g(),f("div",jt,V(u(r).error),1)):(g(),f(x,{key:2},[y("div",Yt,[S(u(Q),{modelValue:b.value,"onUpdate:modelValue":i[0]||(i[0]=s=>b.value=s),options:X,"option-label":"label","option-value":"value","data-testid":"view-toggle"},null,8,["modelValue"]),S(u(K),{modelValue:h.value,"onUpdate:modelValue":i[1]||(i[1]=s=>h.value=s),options:A.value,placeholder:"From","data-testid":"from-year"},null,8,["modelValue","options"]),i[3]||(i[3]=y("span",{class:"year-separator"},"to",-1)),S(u(K),{modelValue:L.value,"onUpdate:modelValue":i[2]||(i[2]=s=>L.value=s),options:A.value,placeholder:"To","data-testid":"to-year"},null,8,["modelValue","options"])]),y("div",{class:q(["report-layout",{"report-layout--stacked":u(p)}])},[S(u(C),{class:"report-card"},{content:m(()=>[y("div",qt,[S(u(at),{value:v.value,size:"small",scrollable:"","scroll-height":"flex","data-testid":"needs-vs-wants-table"},{default:m(()=>[(g(!0),f(x,null,U(Z.value,s=>(g(),f(x,{key:s.name},[s.name==="period"?(g(),O(u(I),{key:0,field:"period",header:"Period"},{body:m(({data:k})=>[F(V(l(k.period)),1)]),_:1})):n(s.name)?(g(),O(u(I),{key:1,field:s.name,header:s.label,class:"col-money"},{body:m(({data:k})=>[S(mt,{"model-value":k[s.name],emphasis:u(wt).Item,"highlight-mode":u(yt).None},null,8,["model-value","emphasis","highlight-mode"])]),_:2},1032,["field","header"])):(g(),O(u(I),{key:2,field:s.name,header:s.label,class:"col-money"},{body:m(({data:k})=>[F(V(k[s.name])+"% ",1)]),_:2},1032,["field","header"]))],64))),128))]),_:1},8,["value"])])]),_:1}),S(u(C),{class:"report-card"},{content:m(()=>[y("div",Ht,[D.value?(g(),O(u(ot),{key:0,type:"bar",options:et.value,series:tt.value,height:"100%","data-testid":"needs-vs-wants-chart"},null,8,["options","series"])):H("",!0)])]),_:1})],2)],64))]),_:1}))}}),oe=ht(Ut,[["__scopeId","data-v-b29c8a5e"]]);export{oe as default};
