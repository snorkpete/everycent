!function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function n(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}(self.webpackChunkeverycent=self.webpackChunkeverycent||[]).push([[416],{58416:function(t,i,o){o.r(i),o.d(i,{SetupModule:function(){return ee}});var a=o(32833),c=o(54655),s=o(43190),r=o(37716),d=o(3679),u=o(22238),l=o(78759),g=o(56326),f=o(38583),m=o(51095);function h(e,t){if(1&e){var n=r.EpF();r.TgZ(0,"button",7),r.NdJ("click",function(){return r.CHM(n),r.oxw().cancelChanges()}),r._uU(1,"Close"),r.qZA()}}var p,v=((p=function(){function t(n,i){e(this,t),this.fb=n,this.dialogRef=i,this.allocationCategory={},this.save=new r.vpe,this.cancel=new r.vpe,this.editMode=!0}return n(t,[{key:"ngOnInit",value:function(){this.form=this.fb.group({id:this.allocationCategory.id,name:this.allocationCategory.name})}},{key:"saveChanges",value:function(){this.save.emit(this.form.value),this.save.complete()}},{key:"cancelChanges",value:function(){this.cancel.emit(),this.cancel.complete(),this.dialogRef.close()}}]),t}()).\u0275fac=function(e){return new(e||p)(r.Y36(d.qu),r.Y36(u.so))},p.\u0275cmp=r.Xpm({type:p,selectors:[["ec-account-category-edit-form"]],inputs:{allocationCategory:"allocationCategory"},outputs:{save:"save",cancel:"cancel"},decls:8,vars:4,consts:[["mat-dialog-title",""],["mat-dialog-content",""],[3,"formGroup"],["formControlName","name","placeholder","Name",3,"editMode","editModeChange"],["mat-dialog-actions",""],[3,"editMode","editModeChange","save","cancel"],["mat-raised-button","","color","warn",3,"click",4,"ngIf"],["mat-raised-button","","color","warn",3,"click"]],template:function(e,t){1&e&&(r.TgZ(0,"h1",0),r._uU(1,"Allocation Category Details"),r.qZA(),r.TgZ(2,"div",1),r.TgZ(3,"div",2),r.TgZ(4,"ec-text-field",3),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.qZA(),r.qZA(),r.TgZ(5,"div",4),r.TgZ(6,"ec-edit-actions",5),r.NdJ("editModeChange",function(e){return t.editMode=e})("save",function(){return t.saveChanges()})("cancel",function(){return t.cancelChanges()}),r.YNc(7,h,2,0,"button",6),r.qZA(),r.qZA()),2&e&&(r.xp6(3),r.Q6J("formGroup",t.form),r.xp6(1),r.Q6J("editMode",t.editMode),r.xp6(2),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("ngIf",!t.editMode))},directives:[u.uh,u.xY,d.JL,d.sg,l.a,d.JJ,d.u,u.H8,g.Y,f.O5,m.lW],encapsulation:2}),p),M=o(75572),Z=function(){var t=function(){function t(n){e(this,t),this.apiGateway=n}return n(t,[{key:"getInstitutions",value:function(){return this.apiGateway.get("/institutions")}},{key:"addInstitution",value:function(e){return this.apiGateway.post("/institutions",e)}},{key:"saveInstitution",value:function(e){return this.apiGateway.put("/institutions/".concat(e.id),e)}},{key:"createOrUpdateInstitution",value:function(e){return 0===e.id?this.addInstitution(e):this.saveInstitution(e)}},{key:"getAllBankAccounts",value:function(){return this.apiGateway.get("/bank_accounts",{include_closed:!0})}},{key:"addBankAccount",value:function(e){return this.apiGateway.post("/bank_accounts",e)}},{key:"saveBankAccount",value:function(e){return this.apiGateway.put("/bank_accounts/".concat(e.id),e)}},{key:"createOrUpdateBankAccount",value:function(e){return 0===e.id?this.addBankAccount(e):this.saveBankAccount(e)}},{key:"getAllocationCategories",value:function(){return this.apiGateway.get("/allocation_categories")}},{key:"addAllocationCategory",value:function(e){return this.apiGateway.post("/allocation_categories",e)}},{key:"saveAllocationCategory",value:function(e){return this.apiGateway.put("/allocation_categories/".concat(e.id),e)}},{key:"createOrUpdateAllocationCategory",value:function(e){return 0===e.id?this.addAllocationCategory(e):this.saveAllocationCategory(e)}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.LFG(M.i))},t.\u0275prov=r.Yz7({token:t,factory:t.\u0275fac}),t}(),A=o(29675),y=o(28731),C=o(93738),k=o(77746),b=o(1769);function x(e,t){if(1&e){var n=r.EpF();r.ynx(0),r.TgZ(1,"mat-list-item"),r.TgZ(2,"div",4),r.TgZ(3,"span"),r._uU(4),r.qZA(),r.TgZ(5,"button",2),r.NdJ("click",function(){var e=r.CHM(n).$implicit;return r.oxw().viewDetails(e)}),r._uU(6,"Edit"),r.qZA(),r.qZA(),r.qZA(),r._UZ(7,"mat-divider"),r.BQk()}if(2&e){var i=t.$implicit;r.xp6(4),r.hij(" ",i.name," ")}}var T=function(){var t=function(){function t(n,i,o,a){e(this,t),this.setupService=n,this.dialog=i,this.toolbar=o,this.messageService=a,this.allocationCategories=[]}return n(t,[{key:"ngOnInit",value:function(){this.refresh()}},{key:"refresh",value:function(){var e=this;this.setupService.getAllocationCategories().subscribe(function(t){return e.allocationCategories=t})}},{key:"viewDetails",value:function(e){var t=this,n=this.dialog.open(v,{}),i=n.componentInstance;i.allocationCategory=e,i.save.pipe((0,s.w)(function(e){return t.setupService.createOrUpdateAllocationCategory(e)})).subscribe(function(){t.messageService.setMessage("Allocation Category saved."),t.refresh(),n.close()},function(e){t.messageService.setErrorMessage("Allocation Category not saved."),t.refresh()})}},{key:"addAllocationCategory",value:function(){this.viewDetails({id:0,name:""})}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Y36(Z),r.Y36(u.uw),r.Y36(A.S),r.Y36(y.e))},t.\u0275cmp=r.Xpm({type:t,selectors:[["ec-account-categories"]],decls:12,vars:1,consts:[[1,"main"],[4,"ngFor","ngForOf"],["mat-raised-button","","color","primary",3,"click"],["mat-raised-button","",3,"click"],[1,"list-item-with-action-buttons"]],template:function(e,t){1&e&&(r.TgZ(0,"mat-card",0),r.TgZ(1,"mat-card"),r.TgZ(2,"mat-card-title"),r._uU(3,"Allocation Categories"),r.qZA(),r.TgZ(4,"mat-card-content"),r.TgZ(5,"mat-list"),r.YNc(6,x,8,1,"ng-container",1),r.qZA(),r.qZA(),r.TgZ(7,"mat-card-actions"),r.TgZ(8,"button",2),r.NdJ("click",function(){return t.addAllocationCategory()}),r._uU(9,"Add Allocation Category"),r.qZA(),r.TgZ(10,"button",3),r.NdJ("click",function(){return t.refresh()}),r._uU(11,"Refresh"),r.qZA(),r.qZA(),r.qZA(),r.qZA()),2&e&&(r.xp6(6),r.Q6J("ngForOf",t.allocationCategories))},directives:[C.a8,C.n5,C.dn,k.i$,f.sg,C.hq,m.lW,k.Tg,b.d],encapsulation:2}),t}(),_=o(76786),q=o(57576);function J(e,t){if(1&e){var n=r.EpF();r.ynx(0),r.TgZ(1,"h3"),r._uU(2,"Credit Card Related"),r.qZA(),r.TgZ(3,"ec-text-field",17),r.NdJ("editModeChange",function(e){return r.CHM(n),r.oxw().editMode=e}),r.qZA(),r.TgZ(4,"ec-text-field",18),r.NdJ("editModeChange",function(e){return r.CHM(n),r.oxw().editMode=e}),r.qZA(),r.BQk()}if(2&e){var i=r.oxw();r.xp6(3),r.Q6J("editMode",i.editMode),r.xp6(1),r.Q6J("editMode",i.editMode)}}function w(e,t){if(1&e){var n=r.EpF();r.TgZ(0,"button",19),r.NdJ("click",function(){return r.CHM(n),r.oxw().cancelChanges()}),r._uU(1," Close "),r.qZA()}}var N=function(){var t=function(){function t(n,i){e(this,t),this.fb=n,this.dialogRef=i,this.bankAccount={},this.save=new r.vpe,this.cancel=new r.vpe,this.editMode=!1,this.accountFeatureTypes=[{id:"normal",name:"Normal Features"},{id:"sink_fund",name:"Sink Fund Features"},{id:"credit_card",name:"Credit Card Features"}],this.accountCategories=[{id:"asset",name:"Asset"},{id:"liability",name:"Liability"},{id:"current",name:"Current"}],this.importFormats=[{name:"ABN Amro Bank Account",id:"abn-amro-bank"},{name:"ABN Amro Bank Account (old format)",id:"abn-amro-bank-old"},{name:"ABN Amro Credit Card",id:"abn-amro-creditcard"},{name:"Scotia Bank Account",id:"new-bank-account"},{name:"FCB Bank Account",id:"fc-bank"},{name:"FCB Credit Card (not implemented)",id:"fc-creditcard"},{text:"Republic Bank Account",value:"republic-bank"},{text:"Republic Credit Card (not implemented)",value:"republic-creditcard"}],this.institutions=[],this.yesNoList=[{id:!0,name:"Yes"},{id:!1,name:"No"}],this.statuses=[{id:"open",name:"Open"},{id:"closed",name:"Closed"}]}return n(t,[{key:"ngOnInit",value:function(){this.form=this.fb.group({id:this.bankAccount.id,name:this.bankAccount.name,account_type:this.bankAccount.account_type,account_type_description:this.bankAccount.account_type_description,account_category:this.bankAccount.account_category,is_cash:this.bankAccount.is_cash,institution_id:this.bankAccount.institution_id,account_no:this.bankAccount.account_no,opening_balance:this.bankAccount.opening_balance,import_format:this.bankAccount.import_format,status:this.bankAccount.status,statement_day:this.bankAccount.statement_day,payment_due_day:this.bankAccount.payment_due_day})}},{key:"saveChanges",value:function(){this.save.emit(this.form.value),this.save.complete()}},{key:"cancelChanges",value:function(){this.cancel.emit(),this.cancel.complete(),this.dialogRef.close()}},{key:"isCreditCard",value:function(){return this.form.value&&"credit_card"===this.form.value.account_type}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Y36(d.qu),r.Y36(u.so))},t.\u0275cmp=r.Xpm({type:t,selectors:[["ec-bank-account-edit-form"]],inputs:{bankAccount:"bankAccount",institutions:"institutions"},outputs:{save:"save",cancel:"cancel"},decls:18,vars:20,consts:[["mat-dialog-title",""],["mat-dialog-content",""],[3,"formGroup"],["formControlName","name","placeholder","Name",1,"form",3,"editMode","editModeChange"],["formControlName","account_type","placeholder","Account Features",1,"form",3,"editMode","items","editModeChange"],["formControlName","account_type_description","placeholder","Account Type Description",1,"form",3,"editMode","editModeChange"],["formControlName","account_category","placeholder","Account Category",1,"form",3,"editMode","items","editModeChange"],["formControlName","is_cash","placeholder","Is Cash Account?",1,"form",3,"editMode","items","editModeChange"],["formControlName","institution_id","placeholder","Financial Institution",1,"form",3,"editMode","items","editModeChange"],["formControlName","account_no","placeholder","Official Account #",1,"form",3,"editMode","editModeChange"],["formControlName","opening_balance","placeholder","Opening Balance",1,"form",3,"editMode","editModeChange"],["formControlName","import_format","placeholder","Bank Account Import Format",1,"form",3,"editMode","items","editModeChange"],["formControlName","status","placeholder","Status",1,"form",3,"editMode","items","editModeChange"],[4,"ngIf"],["mat-dialog-actions",""],[3,"editMode","editModeChange","save"],["mat-raised-button","","color","warn",3,"click",4,"ngIf"],["formControlName","statement_day","placeholder","Statement Day","type","number",1,"form",3,"editMode","editModeChange"],["formControlName","payment_due_day","placeholder","Payment Due Day","type","number",1,"form",3,"editMode","editModeChange"],["mat-raised-button","","color","warn",3,"click"]],template:function(e,t){1&e&&(r.TgZ(0,"h1",0),r._uU(1,"Bank Account Details"),r.qZA(),r.TgZ(2,"div",1),r.TgZ(3,"div",2),r.TgZ(4,"ec-text-field",3),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(5,"ec-list-field",4),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(6,"ec-text-field",5),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(7,"ec-list-field",6),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(8,"ec-list-field",7),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(9,"ec-list-field",8),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(10,"ec-text-field",9),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(11,"ec-money-field",10),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(12,"ec-list-field",11),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.TgZ(13,"ec-list-field",12),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.YNc(14,J,5,2,"ng-container",13),r.qZA(),r.qZA(),r.TgZ(15,"div",14),r.TgZ(16,"ec-edit-actions",15),r.NdJ("editModeChange",function(e){return t.editMode=e})("save",function(){return t.saveChanges()}),r.YNc(17,w,2,0,"button",16),r.qZA(),r.qZA()),2&e&&(r.xp6(3),r.Q6J("formGroup",t.form),r.xp6(1),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("editMode",t.editMode)("items",t.accountFeatureTypes),r.xp6(1),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("editMode",t.editMode)("items",t.accountCategories),r.xp6(1),r.Q6J("editMode",t.editMode)("items",t.yesNoList),r.xp6(1),r.Q6J("editMode",t.editMode)("items",t.institutions),r.xp6(1),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("editMode",t.editMode)("items",t.importFormats),r.xp6(1),r.Q6J("editMode",t.editMode)("items",t.statuses),r.xp6(1),r.Q6J("ngIf",t.isCreditCard()),r.xp6(2),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("ngIf",!t.editMode))},directives:[u.uh,u.xY,d.JL,d.sg,l.a,d.JJ,d.u,_.d,q.x,f.O5,u.H8,g.Y,m.lW],encapsulation:2}),t}(),S=o(12874),I=o(45396),O=o(15552);function Q(e,t){if(1&e){var n=r.EpF();r.TgZ(0,"mat-list-item",6),r.TgZ(1,"div",7),r.TgZ(2,"span"),r._uU(3),r.qZA(),r.TgZ(4,"button",3),r.NdJ("click",function(){r.CHM(n);var e=r.oxw().$implicit;return r.oxw().viewDetails(e)}),r._uU(5," View "),r.qZA(),r.qZA(),r.qZA()}if(2&e){var i=r.oxw().$implicit;r.Q6J("ecHighlightDeletedFor",i),r.xp6(3),r.hij(" ",i.name," ")}}function Y(e,t){if(1&e&&(r.ynx(0),r.YNc(1,Q,6,2,"mat-list-item",5),r._UZ(2,"mat-divider"),r.BQk()),2&e){var n=t.$implicit,i=r.oxw();r.xp6(1),r.Q6J("ngIf",i.deactivateService.isItemVisible(n,i.showClosed))}}var F=function(){var t=function(){function t(n,i,o,a,c){e(this,t),this.setupService=n,this.dialog=i,this.toolbar=o,this.messageService=a,this.deactivateService=c,this.bankAccounts=[],this.institutions=[],this.showClosed=!1}return n(t,[{key:"ngOnInit",value:function(){this.toolbar.setHeading("Setup Bank Accounts"),this.refresh()}},{key:"refresh",value:function(){var e=this;this.setupService.getAllBankAccounts().subscribe(function(t){return e.bankAccounts=t}),this.setupService.getInstitutions().subscribe(function(t){return e.institutions=t})}},{key:"viewDetails",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=this.dialog.open(N,{}),o=i.componentInstance;o.bankAccount=e,o.institutions=this.institutions,o.editMode=n,o.save.pipe((0,s.w)(function(e){return t.setupService.createOrUpdateBankAccount(e)})).subscribe(function(){t.messageService.setMessage("Bank Account saved."),t.refresh(),i.close()},function(e){t.messageService.setErrorMessage("Bank Account not saved."),t.refresh()})}},{key:"addBankAccount",value:function(){this.viewDetails({id:0,name:""},!0)}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Y36(Z),r.Y36(u.uw),r.Y36(A.S),r.Y36(y.e),r.Y36(S.u))},t.\u0275cmp=r.Xpm({type:t,selectors:[["ec-bank-accounts"]],decls:14,vars:2,consts:[[1,"main"],["color","primary",3,"ngModel","ngModelChange"],[4,"ngFor","ngForOf"],["mat-raised-button","","color","primary",3,"click"],["mat-raised-button","",3,"click"],[3,"ecHighlightDeletedFor",4,"ngIf"],[3,"ecHighlightDeletedFor"],[1,"list-item-with-action-buttons"]],template:function(e,t){1&e&&(r.TgZ(0,"mat-card",0),r.TgZ(1,"mat-card"),r.TgZ(2,"mat-card-title"),r._uU(3,"Bank Accounts"),r.qZA(),r.TgZ(4,"mat-card-content"),r.TgZ(5,"mat-slide-toggle",1),r.NdJ("ngModelChange",function(e){return t.showClosed=e}),r._uU(6,"Show Closed Accounts?"),r.qZA(),r.TgZ(7,"mat-list"),r.YNc(8,Y,3,1,"ng-container",2),r.qZA(),r.qZA(),r.TgZ(9,"mat-card-actions"),r.TgZ(10,"button",3),r.NdJ("click",function(){return t.addBankAccount()}),r._uU(11," Add Bank Account "),r.qZA(),r.TgZ(12,"button",4),r.NdJ("click",function(){return t.refresh()}),r._uU(13,"Refresh"),r.qZA(),r.qZA(),r.qZA(),r.qZA()),2&e&&(r.xp6(5),r.Q6J("ngModel",t.showClosed),r.xp6(3),r.Q6J("ngForOf",t.bankAccounts))},directives:[C.a8,C.n5,C.dn,I.Rr,d.JJ,d.On,k.i$,f.sg,C.hq,m.lW,f.O5,b.d,k.Tg,O.O],encapsulation:2}),t}();function B(e,t){if(1&e){var n=r.EpF();r.TgZ(0,"button",7),r.NdJ("click",function(){return r.CHM(n),r.oxw().cancelChanges()}),r._uU(1,"Close"),r.qZA()}}var U=function(){var t=function(){function t(n,i){e(this,t),this.fb=n,this.dialogRef=i,this.institution={},this.save=new r.vpe,this.cancel=new r.vpe,this.editMode=!0}return n(t,[{key:"ngOnInit",value:function(){this.form=this.fb.group({id:this.institution.id,name:this.institution.name})}},{key:"saveChanges",value:function(){this.save.emit(this.form.value),this.save.complete()}},{key:"cancelChanges",value:function(){this.cancel.emit(),this.cancel.complete(),this.dialogRef.close()}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Y36(d.qu),r.Y36(u.so))},t.\u0275cmp=r.Xpm({type:t,selectors:[["ec-institution-edit-form"]],inputs:{institution:"institution"},outputs:{save:"save",cancel:"cancel"},decls:8,vars:4,consts:[["mat-dialog-title",""],["mat-dialog-content",""],[3,"formGroup"],["formControlName","name","placeholder","Name",3,"editMode","editModeChange"],["mat-dialog-actions",""],[3,"editMode","editModeChange","save","cancel"],["mat-raised-button","","color","warn",3,"click",4,"ngIf"],["mat-raised-button","","color","warn",3,"click"]],template:function(e,t){1&e&&(r.TgZ(0,"h1",0),r._uU(1,"Institution Details"),r.qZA(),r.TgZ(2,"div",1),r.TgZ(3,"div",2),r.TgZ(4,"ec-text-field",3),r.NdJ("editModeChange",function(e){return t.editMode=e}),r.qZA(),r.qZA(),r.qZA(),r.TgZ(5,"div",4),r.TgZ(6,"ec-edit-actions",5),r.NdJ("editModeChange",function(e){return t.editMode=e})("save",function(){return t.saveChanges()})("cancel",function(){return t.cancelChanges()}),r.YNc(7,B,2,0,"button",6),r.qZA(),r.qZA()),2&e&&(r.xp6(3),r.Q6J("formGroup",t.form),r.xp6(1),r.Q6J("editMode",t.editMode),r.xp6(2),r.Q6J("editMode",t.editMode),r.xp6(1),r.Q6J("ngIf",!t.editMode))},directives:[u.uh,u.xY,d.JL,d.sg,l.a,d.JJ,d.u,u.H8,g.Y,f.O5,m.lW],encapsulation:2}),t}();function H(e,t){if(1&e){var n=r.EpF();r.ynx(0),r.TgZ(1,"mat-list-item"),r.TgZ(2,"div",4),r.TgZ(3,"span"),r._uU(4),r.qZA(),r.TgZ(5,"button",2),r.NdJ("click",function(){var e=r.CHM(n).$implicit;return r.oxw().viewDetails(e)}),r._uU(6,"Edit"),r.qZA(),r.qZA(),r.qZA(),r._UZ(7,"mat-divider"),r.BQk()}if(2&e){var i=t.$implicit;r.xp6(4),r.hij(" ",i.name," ")}}var E=function(){var t=function(){function t(n,i,o,a){e(this,t),this.setupService=n,this.dialog=i,this.toolbar=o,this.messageService=a,this.institutions=[]}return n(t,[{key:"ngOnInit",value:function(){this.refresh()}},{key:"refresh",value:function(){var e=this;this.setupService.getInstitutions().subscribe(function(t){return e.institutions=t})}},{key:"viewDetails",value:function(e){var t=this,n=this.dialog.open(U,{}),i=n.componentInstance;i.institution=e,i.save.pipe((0,s.w)(function(e){return t.setupService.createOrUpdateInstitution(e)})).subscribe(function(){t.messageService.setMessage("Institution saved."),t.refresh(),n.close()},function(e){t.messageService.setErrorMessage("Institution not saved."),t.refresh()})}},{key:"addInstitution",value:function(){this.viewDetails({id:0,name:""})}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Y36(Z),r.Y36(u.uw),r.Y36(A.S),r.Y36(y.e))},t.\u0275cmp=r.Xpm({type:t,selectors:[["ec-institutions"]],decls:12,vars:1,consts:[[1,"main"],[4,"ngFor","ngForOf"],["mat-raised-button","","color","primary",3,"click"],["mat-raised-button","",3,"click"],[1,"list-item-with-action-buttons"]],template:function(e,t){1&e&&(r.TgZ(0,"mat-card",0),r.TgZ(1,"mat-card"),r.TgZ(2,"mat-card-title"),r._uU(3,"Financial Institutions"),r.qZA(),r.TgZ(4,"mat-card-content"),r.TgZ(5,"mat-list"),r.YNc(6,H,8,1,"ng-container",1),r.qZA(),r.qZA(),r.TgZ(7,"mat-card-actions"),r.TgZ(8,"button",2),r.NdJ("click",function(){return t.addInstitution()}),r._uU(9,"Add Institution"),r.qZA(),r.TgZ(10,"button",3),r.NdJ("click",function(){return t.refresh()}),r._uU(11,"Refresh"),r.qZA(),r.qZA(),r.qZA(),r.qZA()),2&e&&(r.xp6(6),r.Q6J("ngForOf",t.institutions))},directives:[C.a8,C.n5,C.dn,k.i$,f.sg,C.hq,m.lW,k.Tg,b.d],styles:[""]}),t}(),D=o(10194),G=o(6497),R=o(98295),P=o(67441),$=o(72458);function W(e,t){if(1&e&&(r.TgZ(0,"mat-option",8),r._uU(1),r.qZA()),2&e){var n=t.$implicit;r.Q6J("value",n.value),r.xp6(1),r.Oqu(n.text)}}function L(e,t){if(1&e){var n=r.EpF();r.ynx(0),r.TgZ(1,"mat-form-field"),r.TgZ(2,"mat-select",6),r.NdJ("ngModelChange",function(e){return r.CHM(n),r.oxw().settings.family_type=e}),r.YNc(3,W,2,2,"mat-option",7),r.qZA(),r.qZA(),r.BQk()}if(2&e){var i=r.oxw();r.xp6(2),r.Q6J("ngModel",i.settings.family_type),r.xp6(1),r.Q6J("ngForOf",i.familyTypeOptions)}}function X(e,t){if(1&e&&(r.TgZ(0,"span",9),r.TgZ(1,"span",10),r._uU(2,"Type of Household"),r.qZA(),r.TgZ(3,"span",11),r._uU(4),r.qZA(),r.qZA()),2&e){var n=r.oxw();r.xp6(4),r.Oqu(n.settings.family_type)}}function j(e,t){if(1&e){var n=r.EpF();r.ynx(0),r.TgZ(1,"ec-text-field",12),r.NdJ("ngModelChange",function(e){return r.CHM(n),r.oxw().settings.single_person=e}),r.qZA(),r.BQk()}if(2&e){var i=r.oxw();r.xp6(1),r.Q6J("editMode",i.editMode)("ngModel",i.settings.single_person)}}function z(e,t){if(1&e){var n=r.EpF();r.TgZ(0,"ec-text-field",13),r.NdJ("ngModelChange",function(e){return r.CHM(n),r.oxw().settings.husband=e}),r.qZA(),r.TgZ(1,"ec-text-field",14),r.NdJ("ngModelChange",function(e){return r.CHM(n),r.oxw().settings.wife=e}),r.qZA()}if(2&e){var i=r.oxw();r.Q6J("editMode",i.editMode)("ngModel",i.settings.husband),r.xp6(1),r.Q6J("editMode",i.editMode)("ngModel",i.settings.wife)}}var V=[{path:"allocation-categories",component:T},{path:"institutions",component:E},{path:"bank-accounts",component:F},{path:"settings",component:function(){var t=function(){function t(n,i,o,a){e(this,t),this.toolbarService=n,this.messageService=i,this.settingsService=o,this.bankAccountService=a,this.settings={family_type:"couple"},this.bankAccounts=[],this.editMode=!1,this.familyTypeOptions=[{value:"single",text:"Single"},{value:"couple",text:"Couple"}]}return n(t,[{key:"ngOnInit",value:function(){var e=this;this.toolbarService.setHeading("General Settings"),this.bankAccountService.getBankAccounts().subscribe(function(t){return e.bankAccounts=t}),this.refresh()}},{key:"refresh",value:function(){var e=this;this.settingsService.getSettings().subscribe(function(t){e.settings=t})}},{key:"saveSettings",value:function(){var e=this;this.settingsService.saveSettings(this.settings).subscribe(function(){e.messageService.setMessage("Settings saved."),e.editMode=!1},function(t){e.messageService.setErrorMessage("Settings not saved.")})}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Y36(A.S),r.Y36(y.e),r.Y36(D.g),r.Y36(G.A))},t.\u0275cmp=r.Xpm({type:t,selectors:[["ec-settings"]],decls:14,vars:8,consts:[[1,"main"],["placeholder","Primary Budget Account",3,"editMode","items","ngModel","ngModelChange"],[4,"ngIf","ngIfElse"],["displayFamilyType",""],["coupleFields",""],[3,"editMode","editModeChange","save","cancel"],["placeholder","Type of Household",3,"ngModel","ngModelChange"],[3,"value",4,"ngFor","ngForOf"],[3,"value"],[1,"text-display"],[1,"label"],[1,"value"],["placeholder","Person's Name",3,"editMode","ngModel","ngModelChange"],["placeholder","Husband's Name",3,"editMode","ngModel","ngModelChange"],["placeholder","Wife's Name",3,"editMode","ngModel","ngModelChange"]],template:function(e,t){if(1&e&&(r.TgZ(0,"mat-card",0),r.TgZ(1,"mat-card"),r.TgZ(2,"mat-card-title"),r._uU(3,"Settings"),r.qZA(),r.TgZ(4,"mat-card-content"),r.TgZ(5,"ec-list-field",1),r.NdJ("ngModelChange",function(e){return t.settings.primary_budget_account_id=e}),r.qZA(),r.YNc(6,L,4,2,"ng-container",2),r.YNc(7,X,5,1,"ng-template",null,3,r.W1O),r.YNc(9,j,2,2,"ng-container",2),r.YNc(10,z,2,4,"ng-template",null,4,r.W1O),r.qZA(),r.TgZ(12,"mat-card-actions"),r.TgZ(13,"ec-edit-actions",5),r.NdJ("editModeChange",function(e){return t.editMode=e})("save",function(){return t.saveSettings()})("cancel",function(){return t.refresh()}),r.qZA(),r.qZA(),r.qZA(),r.qZA()),2&e){var n=r.MAs(8),i=r.MAs(11);r.xp6(5),r.Q6J("editMode",t.editMode)("items",t.bankAccounts)("ngModel",t.settings.primary_budget_account_id),r.xp6(1),r.Q6J("ngIf",t.editMode)("ngIfElse",n),r.xp6(3),r.Q6J("ngIf","single"===t.settings.family_type)("ngIfElse",i),r.xp6(4),r.Q6J("editMode",t.editMode)}},directives:[C.a8,C.n5,C.dn,_.d,d.JJ,d.On,f.O5,C.hq,g.Y,R.KE,P.gD,f.sg,$.ey,l.a],styles:['.text-display{margin-bottom:20px}.value[_ngcontent-%COMP%]{width:100%;font-size:12px;font-family:Roboto,"Helvetica Neue",sans-serif}.form[_nghost-%COMP%]   mat-form-field[_ngcontent-%COMP%], .form[_nghost-%COMP%]   .value[_ngcontent-%COMP%]{height:35px;margin-top:10px;margin-bottom:20px;font-size:16px}.text-display[_ngcontent-%COMP%]{display:flex;flex-direction:column}.label[_ngcontent-%COMP%]{font-size:12px;font-weight:400;line-height:1.125;color:#0000008a;font-family:Roboto,"Helvetica Neue",sans-serif}']}),t}()}],K=function(){var t=function t(){e(this,t)};return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=r.oAB({type:t}),t.\u0275inj=r.cJS({imports:[[c.Bz.forChild(V)],c.Bz]}),t}(),ee=function(){var t=function t(){e(this,t)};return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=r.oAB({type:t}),t.\u0275inj=r.cJS({providers:[Z],imports:[[a.m,K]]}),t}()}}])}();