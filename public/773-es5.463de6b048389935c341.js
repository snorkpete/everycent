!function(){"use strict";function n(n,t){if(!(n instanceof t))throw new TypeError("Cannot call a class as a function")}function t(n,t){for(var e=0;e<t.length;e++){var i=t[e];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(n,i.key,i)}}function e(n,e,i){return e&&t(n.prototype,e),i&&t(n,i),n}(self.webpackChunkeverycent=self.webpackChunkeverycent||[]).push([[773],{73773:function(t,i,o){o.r(i),o.d(i,{SinkFundsModule:function(){return un}});var a,c=o(10232),r=o(32833),u=o(26215),s=o(37716),d=o(75572),l=((a=function(){function t(e){n(this,t),this.apiGateway=e,this._currentSinkFund$=new u.X({})}return e(t,[{key:"getSinkFunds",value:function(){return this.apiGateway.get("/sink_funds")}},{key:"getCurrent",value:function(){return this._currentSinkFund$.asObservable()}},{key:"refreshSinkFund",value:function(n){var t=this;this.apiGateway.get("/sink_funds/".concat(n)).subscribe(function(n){t._currentSinkFund$.next(n)})}},{key:"save",value:function(n){return this.apiGateway.put("/sink_funds/".concat(n.id),n)}},{key:"transfer",value:function(n,t){return this.apiGateway.post("/sink_funds/".concat(n.id,"/transfer_allocation"),t)}}]),t}()).\u0275fac=function(n){return new(n||a)(s.LFG(d.i))},a.\u0275prov=s.Yz7({token:a,factory:a.\u0275fac}),a),f=o(54655),g=o(79765),h=o(88002),v=o(45435),p=o(46782),Z=o(29675),m=o(93738),k=o(98295),A=o(67441),_=o(38583),y=o(72458),x=["field"];function b(n,t){if(1&n&&(s.TgZ(0,"mat-option",3),s._uU(1),s.qZA()),2&n){var e=t.$implicit;s.Q6J("value",e.id),s.xp6(1),s.hij(" ",e.name," ")}}var T=function(){var t=function(){function t(){n(this,t),this.sinkFunds=[],this.change=new s.vpe}return e(t,[{key:"value",get:function(){return this.field?this.field.value:0},set:function(n){this.field.value=n}},{key:"ngOnInit",value:function(){}}]),t}();return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=s.Xpm({type:t,selectors:[["ec-sink-fund-selector"]],viewQuery:function(n,t){var e;(1&n&&s.Gf(x,7),2&n)&&(s.iGM(e=s.CRH())&&(t.field=e.first))},inputs:{sinkFunds:"sinkFunds"},outputs:{change:"change"},decls:6,vars:1,consts:[["color","primary","placeholder","Select a sink fund",3,"selectionChange"],["field",""],[3,"value",4,"ngFor","ngForOf"],[3,"value"]],template:function(n,t){1&n&&(s.TgZ(0,"mat-card"),s.TgZ(1,"mat-card-content"),s.TgZ(2,"mat-form-field"),s.TgZ(3,"mat-select",0,1),s.NdJ("selectionChange",function(n){return t.change.emit(n)}),s.YNc(5,b,2,2,"mat-option",2),s.qZA(),s.qZA(),s.qZA(),s.qZA()),2&n&&(s.xp6(5),s.Q6J("ngForOf",t.sinkFunds))},directives:[m.a8,m.dn,k.KE,A.gD,_.sg,y.ey],styles:["mat-form-field[_ngcontent-%COMP%]{width:100%}"]}),t}(),F=o(57814),M=o(86529),w=o(21906),q=function(){function t(e){n(this,t),this.deactivateService=e}return e(t,[{key:"sinkFundAllocationsOf",value:function(n){return null===n&&void 0===n?[]:n.sink_fund_allocations||[]}},{key:"totalTarget",value:function(n,t){var e=this;return(0,w.M)(this.sinkFundAllocationsOf(n).filter(function(n){return n.target>0}).filter(function(n){return e.deactivateService.isItemVisible(n,t)}),"target")}},{key:"totalOutstanding",value:function(n,t){var e=this;return(0,w.M)(this.sinkFundAllocationsOf(n).filter(function(n){return n.target>0}).filter(function(n){return e.deactivateService.isItemVisible(n,t)}),"current_balance")-this.totalTarget(n,t)}},{key:"totalAssignedBalance",value:function(n){return(0,w.M)(this.sinkFundAllocationsOf(n),"current_balance")}},{key:"unassignedBalance",value:function(n){return null===n&&void 0===n?0:n.current_balance-this.totalAssignedBalance(n)}},{key:"allocationOutstandingAt",value:function(n,t){if(null===n&&void 0===n)return 0;var e=n.sink_fund_allocations[t];return e.current_balance-e.target}}]),t}(),J=o(22238),S=o(3679),U=o(12874),C=o(35618),O=o(57576),Q=o(51095),N=o(52205);function I(n,t){if(1&n&&(s.TgZ(0,"mat-option",4),s._uU(1),s.ALo(2,"ecMoney"),s.qZA()),2&n){var e=t.$implicit;s.Q6J("value",e.id),s.xp6(1),s.AsE(" ",e.name," ( ",s.lcZ(2,3,e.current_balance)," ) ")}}function Y(n,t){if(1&n&&(s.TgZ(0,"mat-option",4),s._uU(1),s.ALo(2,"ecMoney"),s.qZA()),2&n){var e=t.$implicit;s.Q6J("value",e.id),s.xp6(1),s.AsE(" ",e.name," - ",s.lcZ(2,3,e.current_balance)," ")}}var E=function(){var t=function(){function t(e,i,o,a){n(this,t),this.dialogRef=e,this.fb=i,this.sinkFundService=o,this.deactivateService=a}return e(t,[{key:"ngOnInit",value:function(){this.calculator=new q(this.deactivateService),this.transfer=this.fb.group({existing_allocation_id:0,new_allocation_id:0,amount:0})}},{key:"save",value:function(){var n=this;this.sinkFundService.transfer(this.sinkFund,this.transfer.value).subscribe(function(t){n.sinkFundService.refreshSinkFund(n.sinkFund.id),n.dialogRef.close(t)},function(n){return alert(n)})}},{key:"cancel",value:function(){this.dialogRef.close(!1)}}]),t}();return t.\u0275fac=function(n){return new(n||t)(s.Y36(J.so),s.Y36(S.qu),s.Y36(l),s.Y36(U.u))},t.\u0275cmp=s.Xpm({type:t,selectors:[["ec-add-transfer-form"]],inputs:{sinkFund:"sinkFund"},decls:23,vars:12,consts:[["mat-dialog-title",""],["mat-dialog-content",""],["fxLayout","column","fxLayoutAlign","space-between",3,"formGroup"],["placeholder","Transfer From","formControlName","existing_allocation_id"],[3,"value"],[3,"value",4,"ngFor","ngForOf"],["placeholder","Transfer To","formControlName","new_allocation_id"],["placeholder","Amount","formControlName","amount","fxFlex","1",3,"editMode"],["mat-dialog-actions",""],["fxLayout","row","fxLayoutAlign","space-around",1,"actions"],["mat-raised-button","","color","primary",3,"click"],["mat-raised-button","","color","warn",3,"click"]],template:function(n,t){1&n&&(s.TgZ(0,"h1",0),s._uU(1,"Transfer Money"),s.qZA(),s.TgZ(2,"div",1),s.TgZ(3,"div",2),s.TgZ(4,"mat-form-field"),s.TgZ(5,"mat-select",3),s.TgZ(6,"mat-option",4),s._uU(7),s.ALo(8,"ecMoney"),s.qZA(),s.YNc(9,I,3,5,"mat-option",5),s.qZA(),s.qZA(),s.TgZ(10,"mat-form-field"),s.TgZ(11,"mat-select",6),s.TgZ(12,"mat-option",4),s._uU(13),s.ALo(14,"ecMoney"),s.qZA(),s.YNc(15,Y,3,5,"mat-option",5),s.qZA(),s.qZA(),s._UZ(16,"ec-money-field",7),s.qZA(),s.qZA(),s.TgZ(17,"div",8),s.TgZ(18,"div",9),s.TgZ(19,"button",10),s.NdJ("click",function(){return t.save()}),s._uU(20,"Save"),s.qZA(),s.TgZ(21,"button",11),s.NdJ("click",function(){return t.cancel()}),s._uU(22," Cancel "),s.qZA(),s.qZA(),s.qZA()),2&n&&(s.xp6(3),s.Q6J("formGroup",t.transfer),s.xp6(3),s.Q6J("value",0),s.xp6(1),s.hij(" Unassigned Money - ",s.lcZ(8,8,t.calculator.unassignedBalance(t.sinkFund))," "),s.xp6(2),s.Q6J("ngForOf",t.sinkFund.sink_fund_allocations),s.xp6(3),s.Q6J("value",0),s.xp6(1),s.hij(" Unassigned Money - ",s.lcZ(14,10,t.calculator.unassignedBalance(t.sinkFund))," "),s.xp6(2),s.Q6J("ngForOf",t.sinkFund.sink_fund_allocations),s.xp6(1),s.Q6J("editMode",!0))},directives:[J.uh,J.xY,C.xw,C.Wh,S.JL,S.sg,k.KE,A.gD,S.JJ,S.u,y.ey,_.sg,O.x,C.yH,J.H8,Q.lW],pipes:[N.L],styles:["mat-form-field[_ngcontent-%COMP%], ec-money-field[_ngcontent-%COMP%]{margin-top:24px}div.actions[_ngcontent-%COMP%]{width:100%}ec-money-field[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{width:100%}"]}),t}(),D=o(7736),H=o(29210),$=o(77001),B=o(45396),P=o(56326),G=o(15552),L=o(78759),R=o(10270),j=o(27333);function z(n,t){if(1&n){var e=s.EpF();s.TgZ(0,"span",1),s.NdJ("click",function(){return s.CHM(e),s.oxw().toggle()}),s._UZ(1,"ec-icon",2),s.qZA()}if(2&n){var i=s.oxw();s.xp6(1),s.Q6J("icon",i.icon)}}var V=function(){var t=function(){function t(){n(this,t),this.editMode=!1}return e(t,[{key:"icon",get:function(){return this.item&&this.item.deactivated?F.J.ACTIVATE:F.J.DEACTIVATE}},{key:"ngOnInit",value:function(){}},{key:"toggle",value:function(){this.item.deactivated=!this.item.deactivated,this.item.status=this.item.deactivated?"closed":"open",this.item.unsaved=!0}}]),t}();return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=s.Xpm({type:t,selectors:[["ec-deactivate-button"]],inputs:{item:"item",icon:"icon",editMode:"editMode"},decls:1,vars:1,consts:[[3,"click",4,"ngIf"],[3,"click"],[3,"icon"]],template:function(n,t){1&n&&s.YNc(0,z,2,1,"span",0),2&n&&s.Q6J("ngIf",t.editMode)},directives:[_.O5,R.k],styles:["span[_ngcontent-%COMP%]{cursor:pointer}"]}),t}();function X(n,t){if(1&n){var e=s.EpF();s.TgZ(0,"tr",11),s.TgZ(1,"td"),s.TgZ(2,"ec-text-field",12),s.NdJ("ngModelChange",function(n){return s.CHM(e),s.oxw().$implicit.name=n}),s.qZA(),s.qZA(),s.TgZ(3,"td",13),s.TgZ(4,"div",14),s.TgZ(5,"ec-icon",15),s.NdJ("click",function(){s.CHM(e);var n=s.oxw().$implicit;return s.oxw(2).showTransactionsFor(n)}),s.qZA(),s._UZ(6,"span",16),s.TgZ(7,"div",17),s._UZ(8,"ec-money-field",8),s.qZA(),s.qZA(),s.qZA(),s.TgZ(9,"td",17),s.TgZ(10,"ec-money-field",12),s.NdJ("ngModelChange",function(n){return s.CHM(e),s.oxw().$implicit.target=n}),s.qZA(),s.qZA(),s.TgZ(11,"td",17),s._UZ(12,"ec-money-field",18),s.qZA(),s.TgZ(13,"td"),s.TgZ(14,"ec-text-field",12),s.NdJ("ngModelChange",function(n){return s.CHM(e),s.oxw().$implicit.comment=n}),s.qZA(),s.qZA(),s.TgZ(15,"td"),s.TgZ(16,"ec-text-field",19),s.NdJ("ngModelChange",function(n){return s.CHM(e),s.oxw().$implicit.status=n}),s.qZA(),s.qZA(),s.TgZ(17,"td"),s._UZ(18,"ec-delete-button",20),s._UZ(19,"ec-deactivate-button",20),s.qZA(),s.qZA()}if(2&n){var i=s.oxw().$implicit,o=s.oxw(2);s.Q6J("ecHighlightDeletedFor",i),s.xp6(2),s.Q6J("ngModel",i.name)("editMode",o.isEditMode),s.xp6(3),s.Q6J("icon",o.Icon.SHOW_TRANSACTIONS),s.xp6(3),s.Q6J("value",i.current_balance),s.xp6(2),s.Q6J("ngModel",i.target)("editMode",o.isEditMode),s.xp6(2),s.Q6J("value",0==i.target?0:i.current_balance-i.target),s.xp6(2),s.Q6J("ngModel",i.comment)("editMode",o.isEditMode),s.xp6(2),s.Q6J("ngModel",i.status),s.xp6(2),s.Q6J("item",i)("editMode",o.isEditMode),s.xp6(1),s.Q6J("item",i)("editMode",o.isEditMode)}}function W(n,t){if(1&n&&(s.ynx(0),s.YNc(1,X,20,15,"tr",10),s.BQk()),2&n){var e=t.$implicit,i=s.oxw(2);s.xp6(1),s.Q6J("ngIf",i.deactivateService.isItemVisible(e,i.showDeactivated))}}function K(n,t){if(1&n&&(s.TgZ(0,"table",6),s.TgZ(1,"thead"),s.TgZ(2,"tr"),s.TgZ(3,"th"),s._uU(4,"Goal / Obligation"),s.qZA(),s.TgZ(5,"th"),s._uU(6,"Current Balance"),s.qZA(),s.TgZ(7,"th"),s._uU(8,"Target"),s.qZA(),s.TgZ(9,"th"),s._uU(10,"Outstanding"),s.qZA(),s.TgZ(11,"th"),s._uU(12,"Comment"),s.qZA(),s.TgZ(13,"th"),s._uU(14,"Status"),s.qZA(),s.TgZ(15,"th"),s._uU(16,"Actions"),s.qZA(),s.qZA(),s.qZA(),s.TgZ(17,"tbody"),s.TgZ(18,"tr",7),s.TgZ(19,"td"),s._uU(20,"Sink Fund Account Balance"),s.qZA(),s.TgZ(21,"td"),s._UZ(22,"ec-money-field",8),s.qZA(),s._UZ(23,"td"),s._UZ(24,"td"),s.TgZ(25,"td"),s._uU(26,"Current Account Balance"),s.qZA(),s._UZ(27,"td"),s._UZ(28,"td"),s.qZA(),s.TgZ(29,"tr",7),s.TgZ(30,"td"),s._uU(31,"Unassigned Money"),s.qZA(),s.TgZ(32,"td"),s._UZ(33,"ec-money-field",8),s.qZA(),s._UZ(34,"td"),s._UZ(35,"td"),s.TgZ(36,"td"),s._uU(37,"Money not assigned to any financial goal/obligation"),s.qZA(),s._UZ(38,"td"),s._UZ(39,"td"),s.qZA(),s.YNc(40,W,2,1,"ng-container",9),s.qZA(),s.TgZ(41,"tfoot"),s.TgZ(42,"tr",7),s.TgZ(43,"td"),s._uU(44,"Total"),s.qZA(),s.TgZ(45,"td"),s._UZ(46,"ec-money-field",8),s.qZA(),s.TgZ(47,"td"),s._UZ(48,"ec-money-field",8),s.qZA(),s.TgZ(49,"td"),s._UZ(50,"ec-money-field",8),s.qZA(),s._UZ(51,"td"),s._UZ(52,"td"),s._UZ(53,"td"),s.qZA(),s.qZA(),s.qZA()),2&n){var e=s.oxw();s.ekj("small-screen",e.isSmallScreen),s.xp6(3),s.Udp("width",25,"%"),s.xp6(2),s.Udp("width",10,"%"),s.xp6(2),s.Udp("width",10,"%"),s.xp6(2),s.Udp("width",10,"%"),s.xp6(2),s.Udp("width",20,"%"),s.xp6(2),s.Udp("width",5,"%"),s.xp6(2),s.Udp("width",10,"%"),s.xp6(7),s.Q6J("value",e.sinkFund.current_balance),s.xp6(11),s.Q6J("value",e.calculator.unassignedBalance(e.sinkFund)),s.xp6(7),s.Q6J("ngForOf",e.sinkFund.sink_fund_allocations),s.xp6(6),s.Q6J("value",e.calculator.totalAssignedBalance(e.sinkFund)),s.xp6(2),s.Q6J("value",e.calculator.totalTarget(e.sinkFund,e.showDeactivated)),s.xp6(2),s.Q6J("value",e.calculator.totalOutstanding(e.sinkFund,e.showDeactivated))}}function nn(n,t){if(1&n){var e=s.EpF();s.TgZ(0,"button",21),s.NdJ("click",function(){return s.CHM(e),s.oxw().addObligation()}),s._uU(1," Add Obligation "),s.qZA()}}function tn(n,t){if(1&n){var e=s.EpF();s.TgZ(0,"button",22),s.NdJ("click",function(){return s.CHM(e),s.oxw().showTransferForm()}),s._uU(1," Transfer Money "),s.qZA()}}var en=function(){var t=function(){function t(e,i,o,a,c,r){n(this,t),this.media=e,this.sinkFundService=i,this.transactionService=o,this.dialog=a,this.snackbar=c,this.deactivateService=r,this.Icon=F.J,this.isEditMode=!1,this.showDeactivated=!1}return e(t,[{key:"ngOnInit",value:function(){var n=this;this.calculator=new q(this.deactivateService),this.sinkFund={sink_fund_allocations:[]},this.mediaSubscription=this.media.asObservable().subscribe(function(){n.isSmallScreen=n.media.isActive("xs")})}},{key:"save",value:function(){var n=this;this.sinkFundService.save(this.sinkFund).subscribe(function(t){n.sinkFund=t,n.isEditMode=!1,n.snackbar.open("Sink fund saved",null,{duration:3e3})},function(t){n.snackbar.open("Not saved: "+JSON.stringify(t),null,{duration:3e3})})}},{key:"cancel",value:function(){this.snackbar.open("Sink fund not saved",null,{duration:1e3})}},{key:"isAllocationVisible",value:function(n){}},{key:"showTransferForm",value:function(){var n=this,t=this.dialog.open(E,{width:"350px"});t.componentInstance.sinkFund=this.sinkFund,t.afterClosed().subscribe(function(t){t?n.snackbar.open("Transfer complete.",null,{duration:3e3}):n.snackbar.open("Transfer cancelled.",null,{duration:1500})})}},{key:"showTransactionsFor",value:function(n){var t,e=this;this.transactionService.getTransactionsForSinkFundAllocation(n.id).subscribe(function(i){(t=e.dialog.open(M.V,{width:"500px"})).componentInstance.transactions=i,t.componentInstance.itemName=n.name})}},{key:"addObligation",value:function(){this.sinkFund.sink_fund_allocations.push({amount:0,current_balance:0,target:0,unsaved:!0})}},{key:"ngOnDestroy",value:function(){this.mediaSubscription.unsubscribe()}}]),t}();return t.\u0275fac=function(n){return new(n||t)(s.Y36(D.u0),s.Y36(l),s.Y36(H.q),s.Y36(J.uw),s.Y36($.ux),s.Y36(U.u))},t.\u0275cmp=s.Xpm({type:t,selectors:[["ec-sink-fund"]],inputs:{sinkFund:"sinkFund"},decls:10,vars:5,consts:[["color","primary",3,"ngModel","ngModelChange"],[1,"fixed"],["class","table",3,"small-screen",4,"ngIf"],[3,"editMode","editModeChange","save","cancel"],["mat-raised-button","","color","accent",3,"click",4,"ngIf"],["mat-raised-button","","color","primary",3,"click",4,"ngIf"],[1,"table"],[1,"total"],[3,"value"],[4,"ngFor","ngForOf"],[3,"ecHighlightDeletedFor",4,"ngIf"],[3,"ecHighlightDeletedFor"],[3,"ngModel","editMode","ngModelChange"],[1,"highlight"],["fxLayout","row","fxLayoutAlign","start center"],[1,"small",3,"icon","click"],["fxFlex",""],[1,"right"],["highlightPositive","true",3,"value"],[3,"ngModel","ngModelChange"],[3,"item","editMode"],["mat-raised-button","","color","accent",3,"click"],["mat-raised-button","","color","primary",3,"click"]],template:function(n,t){1&n&&(s.TgZ(0,"mat-card"),s.TgZ(1,"mat-card-content"),s.TgZ(2,"mat-slide-toggle",0),s.NdJ("ngModelChange",function(n){return t.showDeactivated=n}),s._uU(3,"Show Closed Obligations?"),s.qZA(),s.TgZ(4,"div",1),s.YNc(5,K,54,22,"table",2),s.qZA(),s.qZA(),s.TgZ(6,"mat-card-actions"),s.TgZ(7,"ec-edit-actions",3),s.NdJ("editModeChange",function(n){return t.isEditMode=n})("save",function(){return t.save()})("cancel",function(){return t.cancel()}),s.YNc(8,nn,2,0,"button",4),s.YNc(9,tn,2,0,"button",5),s.qZA(),s.qZA(),s.qZA()),2&n&&(s.xp6(2),s.Q6J("ngModel",t.showDeactivated),s.xp6(3),s.Q6J("ngIf",t.sinkFund),s.xp6(2),s.Q6J("editMode",t.isEditMode),s.xp6(1),s.Q6J("ngIf",t.isEditMode),s.xp6(1),s.Q6J("ngIf",!t.isEditMode))},directives:[m.a8,m.dn,B.Rr,S.JJ,S.On,_.O5,m.hq,P.Y,O.x,_.sg,G.O,L.a,C.xw,C.Wh,R.k,C.yH,j.t,V,Q.lW],styles:["div.fixed[_ngcontent-%COMP%]{width:100%;overflow-x:auto}table.table[_ngcontent-%COMP%]{table-layout:fixed;width:100%}table.table.small-screen[_ngcontent-%COMP%]{width:768px}.highlight[_ngcontent-%COMP%]{font-weight:bold;font-size:13px}.total[_ngcontent-%COMP%]{font-weight:bold;font-size:16px;border-top:2px solid black;border-bottom:2px solid black}ec-icon.small[_ngcontent-%COMP%]     .material-icons{font-size:16px;height:16px;width:16px;padding-top:1px;cursor:pointer}"]}),t}(),on=["selector"],an=function(){var t=function(){function t(e,i,o,a){n(this,t),this.sinkFundService=e,this.toolbarService=i,this.activatedRoute=o,this.router=a,this.onDestroy$=new g.xQ}return e(t,[{key:"ngOnInit",value:function(){var n=this;this.sinkFundService.getSinkFunds().subscribe(function(t){n.sinkFunds=t}),this.activatedRoute.paramMap.pipe((0,h.U)(function(n){return Number(n.get("sink_fund_id"))}),(0,v.h)(function(n){return n>0}),(0,p.R)(this.onDestroy$)).subscribe(function(t){return n.selectSinkFund(t)}),this.toolbarService.setHeading("Sink Fund Obligations"),this.sinkFundService.getCurrent().subscribe(function(t){n.sinkFund=t})}},{key:"onSinkFundSelect",value:function(n){this.router.navigate([this.selector.value],{relativeTo:this.activatedRoute.parent})}},{key:"selectSinkFund",value:function(n){this.selector.value=n,this.sinkFundService.refreshSinkFund(n)}},{key:"ngOnDestroy",value:function(){this.onDestroy$.next(),this.onDestroy$.complete()}}]),t}();return t.\u0275fac=function(n){return new(n||t)(s.Y36(l),s.Y36(Z.S),s.Y36(f.gz),s.Y36(f.F0))},t.\u0275cmp=s.Xpm({type:t,selectors:[["ec-sink-funds"]],viewQuery:function(n,t){var e;(1&n&&s.Gf(on,7),2&n)&&(s.iGM(e=s.CRH())&&(t.selector=e.first))},decls:4,vars:2,consts:[[1,"main"],[3,"sinkFunds","change"],["selector",""],[3,"sinkFund"]],template:function(n,t){1&n&&(s.TgZ(0,"mat-card",0),s.TgZ(1,"ec-sink-fund-selector",1,2),s.NdJ("change",function(n){return t.onSinkFundSelect(n)}),s.qZA(),s._UZ(3,"ec-sink-fund",3),s.qZA()),2&n&&(s.xp6(1),s.Q6J("sinkFunds",t.sinkFunds),s.xp6(2),s.Q6J("sinkFund",t.sinkFund))},directives:[m.a8,T,en],encapsulation:2}),t}(),cn=[{path:"",canActivate:[o(31265).a],children:[{path:":sink_fund_id",component:an},{path:"",component:an}]}],rn=function(){var t=function t(){n(this,t)};return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=s.oAB({type:t}),t.\u0275inj=s.cJS({providers:[],imports:[[f.Bz.forChild(cn)],f.Bz]}),t}(),un=function(){var t=function t(){n(this,t)};return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=s.oAB({type:t}),t.\u0275inj=s.cJS({providers:[l],imports:[[r.m,c.c,rn]]}),t}()}}])}();