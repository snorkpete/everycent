import{B as M,s as z,f as j,b,c as f,a as p,m as B,r as R,e as H,g as v,d as x,h as q,w as Y,i as N,j as T,k as h,l as c,n as D,F as P,p as k,q as U,_ as $,u as G,o as J,t as K,v as Q,x as W}from"./index-BCcvD2n1.js";import{s as X}from"./index-BHUoavk_.js";import{b as V}from"./bankAccountApi-DE66mLyX.js";import{u as Z}from"./useNotifications-Cog9Gou0.js";import{s as ee}from"./index-BI6EBEMQ.js";import{E as C}from"./EcTextField-DTg5qf8z.js";import{E as A}from"./EcListField-v64NREcl.js";import{E as te}from"./EcMoneyField-Db70QCSi.js";import"./index-VAky5ZFf.js";import"./cents-to-dollars-B8dXw4U7.js";var ne=`
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`,ae={root:{position:"relative"}},ie={root:function(n){var l=n.instance,r=n.props;return["p-toggleswitch p-component",{"p-toggleswitch-checked":l.checked,"p-disabled":r.disabled,"p-invalid":l.$invalid}]},input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},oe=M.extend({name:"toggleswitch",style:ne,classes:ie,inlineStyles:ae}),le={name:"BaseToggleSwitch",extends:z,props:{trueValue:{type:null,default:!0},falseValue:{type:null,default:!1},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},inputId:{type:String,default:null},inputClass:{type:[String,Object],default:null},inputStyle:{type:Object,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:oe,provide:function(){return{$pcToggleSwitch:this,$parentInstance:this}}},L={name:"ToggleSwitch",extends:le,inheritAttrs:!1,emits:["change","focus","blur"],methods:{getPTOptions:function(n){var l=n==="root"?this.ptmi:this.ptm;return l(n,{context:{checked:this.checked,disabled:this.disabled}})},onChange:function(n){if(!this.disabled&&!this.readonly){var l=this.checked?this.falseValue:this.trueValue;this.writeValue(l,n),this.$emit("change",n)}},onFocus:function(n){this.$emit("focus",n)},onBlur:function(n){var l,r;this.$emit("blur",n),(l=(r=this.formField).onBlur)===null||l===void 0||l.call(r,n)}},computed:{checked:function(){return this.d_value===this.trueValue},dataP:function(){return j({checked:this.checked,disabled:this.disabled,invalid:this.$invalid})}}},de=["data-p-checked","data-p-disabled","data-p"],se=["id","checked","tabindex","disabled","readonly","aria-checked","aria-labelledby","aria-label","aria-invalid"],ce=["data-p"],re=["data-p"];function ue(i,n,l,r,d,a){return b(),f("div",B({class:i.cx("root"),style:i.sx("root")},a.getPTOptions("root"),{"data-p-checked":a.checked,"data-p-disabled":i.disabled,"data-p":a.dataP}),[p("input",B({id:i.inputId,type:"checkbox",role:"switch",class:[i.cx("input"),i.inputClass],style:i.inputStyle,checked:a.checked,tabindex:i.tabindex,disabled:i.disabled,readonly:i.readonly,"aria-checked":a.checked,"aria-labelledby":i.ariaLabelledby,"aria-label":i.ariaLabel,"aria-invalid":i.invalid||void 0,onFocus:n[0]||(n[0]=function(){return a.onFocus&&a.onFocus.apply(a,arguments)}),onBlur:n[1]||(n[1]=function(){return a.onBlur&&a.onBlur.apply(a,arguments)}),onChange:n[2]||(n[2]=function(){return a.onChange&&a.onChange.apply(a,arguments)})},a.getPTOptions("input")),null,16,se),p("div",B({class:i.cx("slider")},a.getPTOptions("slider"),{"data-p":a.dataP}),[p("div",B({class:i.cx("handle")},a.getPTOptions("handle"),{"data-p":a.dataP}),[R(i.$slots,"handle",{checked:a.checked})],16,re)],16,ce)],16,de)}L.render=ue;const ge=H("bankAccounts",()=>{const i=v([]),n=v([]),l=v(!1),r=v(null);async function d(){l.value=!0,r.value=null;try{const u=await V.getAll();u.sort((m,_)=>(m.name??"").localeCompare(_.name??"")),i.value=u}catch(u){r.value=u instanceof Error?u.message:"Failed to load bank accounts"}finally{l.value=!1}}async function a(){try{n.value=await V.getInstitutions()}catch(u){r.value=u instanceof Error?u.message:"Failed to load institutions"}}async function t(u){l.value=!0,r.value=null;try{u.id?await V.update(u):await V.create(u),await d()}catch(m){throw r.value=m instanceof Error?m.message:"Failed to save bank account",m}finally{l.value=!1}}return{bankAccounts:i,institutions:n,loading:l,error:r,fetchAll:d,fetchInstitutions:a,save:t}}),pe={class:"form-fields"},he={key:0,"data-testid":"credit-card-section"},me={class:"dialog-footer"},be=x({__name:"BankAccountEditDialog",props:{visible:{type:Boolean},bankAccount:{},institutions:{},initialEditMode:{type:Boolean}},emits:["update:visible","save"],setup(i,{emit:n}){const l=i,r=n,d=v(l.initialEditMode);function a(e){return{id:e.id,name:e.name??"",account_type:e.account_type,account_type_description:e.account_type_description??"",account_category:e.account_category,is_cash:e.is_cash,institution_id:e.institution_id,account_no:e.account_no??"",opening_balance:e.opening_balance??0,import_format:e.import_format,status:e.status,statement_day:e.statement_day!=null?String(e.statement_day):"",payment_due_day:e.payment_due_day!=null?String(e.payment_due_day):""}}const t=q(a(l.bankAccount));Y(()=>l.visible,e=>{e&&(Object.assign(t,a(l.bankAccount)),d.value=l.initialEditMode)});const u=U(()=>t.account_type==="credit_card"),m=U(()=>l.institutions.filter(e=>e.id!=null&&e.name!=null).map(e=>({id:e.id,name:e.name}))),_=[{id:"normal",name:"Normal Features"},{id:"sink_fund",name:"Sink Fund Features"},{id:"credit_card",name:"Credit Card Features"}],S=[{id:"asset",name:"Asset"},{id:"liability",name:"Liability"},{id:"current",name:"Current"}],F=[{id:!0,name:"Yes"},{id:!1,name:"No"}],E=[{id:"abn-amro-bank",name:"ABN Amro Bank Account"},{id:"abn-amro-bank-old",name:"ABN Amro Bank Account (old format)"},{id:"abn-amro-creditcard",name:"ABN Amro Credit Card"},{id:"new-bank-account",name:"Scotia Bank Account"},{id:"fc-bank",name:"FCB Bank Account"},{id:"fc-creditcard",name:"FCB Credit Card (not implemented)"},{id:"republic-bank",name:"Republic Bank Account"},{id:"republic-creditcard",name:"Republic Credit Card (not implemented)"}],w=[{id:"open",name:"Open"},{id:"closed",name:"Closed"}];function y(e){return{id:e.id,name:e.name,account_type:e.account_type,account_type_description:e.account_type_description,account_category:e.account_category,is_cash:e.is_cash,institution_id:e.institution_id,account_no:e.account_no,opening_balance:e.opening_balance,import_format:e.import_format,status:e.status,statement_day:e.statement_day!==""?parseInt(e.statement_day,10):void 0,payment_due_day:e.payment_due_day!==""?parseInt(e.payment_due_day,10):void 0}}function g(){r("save",y(t))}function I(){t.id?(Object.assign(t,a(l.bankAccount)),d.value=!1):r("update:visible",!1)}function O(){r("update:visible",!1)}return(e,o)=>(b(),N(h(ee),{visible:i.visible,header:"Bank Account Details",modal:"",style:{width:"40rem"},"onUpdate:visible":O},{footer:T(()=>[p("div",me,[d.value?(b(),f(P,{key:0},[c(h(k),{label:"Save","data-testid":"save-btn",onClick:g}),c(h(k),{label:"Cancel",severity:"secondary","data-testid":"cancel-btn",onClick:I})],64)):(b(),f(P,{key:1},[c(h(k),{label:"Make Changes","data-testid":"edit-btn",onClick:o[12]||(o[12]=s=>d.value=!0)}),c(h(k),{label:"Close",severity:"secondary","data-testid":"close-btn",onClick:O})],64))])]),default:T(()=>[p("div",pe,[c(C,{modelValue:t.name,"onUpdate:modelValue":o[0]||(o[0]=s=>t.name=s),label:"Name","edit-mode":d.value},null,8,["modelValue","edit-mode"]),c(A,{"model-value":t.account_type,label:"Account Features","edit-mode":d.value,items:_,"onUpdate:modelValue":o[1]||(o[1]=s=>t.account_type=s)},null,8,["model-value","edit-mode"]),c(C,{modelValue:t.account_type_description,"onUpdate:modelValue":o[2]||(o[2]=s=>t.account_type_description=s),label:"Account Type Description","edit-mode":d.value},null,8,["modelValue","edit-mode"]),c(A,{"model-value":t.account_category,label:"Account Category","edit-mode":d.value,items:S,"onUpdate:modelValue":o[3]||(o[3]=s=>t.account_category=s)},null,8,["model-value","edit-mode"]),c(A,{"model-value":t.is_cash,label:"Is Cash Account?","edit-mode":d.value,items:F,"onUpdate:modelValue":o[4]||(o[4]=s=>t.is_cash=s)},null,8,["model-value","edit-mode"]),c(A,{"model-value":t.institution_id,label:"Financial Institution","edit-mode":d.value,items:m.value,"onUpdate:modelValue":o[5]||(o[5]=s=>t.institution_id=s)},null,8,["model-value","edit-mode","items"]),c(C,{modelValue:t.account_no,"onUpdate:modelValue":o[6]||(o[6]=s=>t.account_no=s),label:"Official Account #","edit-mode":d.value},null,8,["modelValue","edit-mode"]),c(te,{modelValue:t.opening_balance,"onUpdate:modelValue":o[7]||(o[7]=s=>t.opening_balance=s),label:"Opening Balance","edit-mode":d.value},null,8,["modelValue","edit-mode"]),c(A,{"model-value":t.import_format,label:"Bank Account Import Format","edit-mode":d.value,items:E,"onUpdate:modelValue":o[8]||(o[8]=s=>t.import_format=s)},null,8,["model-value","edit-mode"]),c(A,{"model-value":t.status,label:"Status","edit-mode":d.value,items:w,"onUpdate:modelValue":o[9]||(o[9]=s=>t.status=s)},null,8,["model-value","edit-mode"]),u.value?(b(),f("div",he,[o[13]||(o[13]=p("h3",{class:"section-heading"},"Credit Card Related",-1)),c(C,{modelValue:t.statement_day,"onUpdate:modelValue":o[10]||(o[10]=s=>t.statement_day=s),label:"Statement Day",type:"number","edit-mode":d.value},null,8,["modelValue","edit-mode"]),c(C,{modelValue:t.payment_due_day,"onUpdate:modelValue":o[11]||(o[11]=s=>t.payment_due_day=s),label:"Payment Due Day",type:"number","edit-mode":d.value},null,8,["modelValue","edit-mode"])])):D("",!0)])]),_:1},8,["visible"]))}}),ve=$(be,[["__scopeId","data-v-8fd09364"]]),we={class:"bank-accounts-page"},ye={class:"controls","data-testid":"controls"},ke={class:"toggle-label"},fe={class:"account-list"},_e={class:"account-name"},Ae={class:"page-actions"},Ce=x({__name:"BankAccountsPage",setup(i){const n=ge(),l=G(),r=Z(),d=v(!1),a=v(!1),t=v({}),u=v(!1),m=U(()=>d.value?n.bankAccounts:n.bankAccounts.filter(w=>w.status!=="closed"));J(()=>{l.setHeading("Setup Bank Accounts"),_()});function _(){n.fetchAll(),n.fetchInstitutions()}function S(w){t.value=w,u.value=!1,a.value=!0}function F(){t.value={},u.value=!0,a.value=!0}async function E(w){try{await n.save(w),r.success("Bank account saved"),a.value=!1}catch{r.error(n.error??"Failed to save bank account")}}return(w,y)=>(b(),f("div",we,[p("div",ye,[p("label",ke,[c(h(L),{modelValue:d.value,"onUpdate:modelValue":y[0]||(y[0]=g=>d.value=g),"data-testid":"show-closed-toggle","input-id":"show-closed"},null,8,["modelValue"]),y[2]||(y[2]=p("span",null,"Show Closed Accounts",-1))])]),p("ul",fe,[(b(!0),f(P,null,K(m.value,g=>(b(),f("li",{key:g.id,class:Q(["account-item",{"account-item--closed":g.status==="closed"}])},[p("span",_e,W(g.name),1),g.status==="closed"?(b(),N(h(X),{key:0,value:"Closed",severity:"warn",icon:"pi pi-ban",class:"status-tag","data-testid":"closed-tag"})):D("",!0),c(h(k),{label:"View",size:"small",class:"view-btn","data-testid":`view-btn-${g.id}`,onClick:I=>S(g)},null,8,["data-testid","onClick"])],2))),128))]),p("div",Ae,[c(h(k),{label:"Add Bank Account","data-testid":"add-btn",onClick:F}),c(h(k),{label:"Refresh",severity:"secondary","data-testid":"refresh-btn",onClick:_})]),c(ve,{visible:a.value,"bank-account":t.value,"initial-edit-mode":u.value,institutions:h(n).institutions,"onUpdate:visible":y[1]||(y[1]=g=>a.value=g),onSave:E},null,8,["visible","bank-account","initial-edit-mode","institutions"])]))}}),xe=$(Ce,[["__scopeId","data-v-2b22c99a"]]);export{xe as default};
