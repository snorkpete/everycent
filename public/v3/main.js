(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"app/account-balances/account-balances.module.ngfactory": [
		"./src/app/account-balances/account-balances.module.ngfactory.js",
		"app-account-balances-account-balances-module-ngfactory"
	],
	"app/budgets/budgets.module.ngfactory": [
		"./src/app/budgets/budgets.module.ngfactory.js",
		"app-budgets-budgets-module-ngfactory"
	],
	"app/sink-funds/sink-funds.module.ngfactory": [
		"./src/app/sink-funds/sink-funds.module.ngfactory.js",
		"app-sink-funds-sink-funds-module-ngfactory"
	],
	"app/transactions/transactions.module.ngfactory": [
		"./src/app/transactions/transactions.module.ngfactory.js",
		"app-transactions-transactions-module-ngfactory"
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids) {
		return Promise.resolve().then(function() {
			var e = new Error('Cannot find module "' + req + '".');
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}
	return __webpack_require__.e(ids[1]).then(function() {
		var module = __webpack_require__(ids[0]);
		return module;
	});
}
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src/api/api-gateway.service.ts":
/*!****************************************!*\
  !*** ./src/api/api-gateway.service.ts ***!
  \****************************************/
/*! exports provided: ApiGateway */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ApiGateway", function() { return ApiGateway; });
/* harmony import */ var _angular_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/http */ "./node_modules/@angular/http/esm5/http.js");
/* harmony import */ var _base_url_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base-url.service */ "./src/api/base-url.service.ts");
/* harmony import */ var rxjs_Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/Observable */ "./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var _app_core_auth_auth_credentials__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../app/core/auth/auth-credentials */ "./src/app/core/auth/auth-credentials.ts");




var ApiGateway = /*@__PURE__*/ (function () {
    function ApiGateway(http, router, loadingIndicator) {
        this.http = http;
        this.router = router;
        this.loadingIndicator = loadingIndicator;
        this.BASE_URL = _base_url_service__WEBPACK_IMPORTED_MODULE_1__["BASE_URL"];
    }
    ApiGateway.prototype.get = function (url, params) {
        var _this = this;
        var options = new _angular_http__WEBPACK_IMPORTED_MODULE_0__["RequestOptions"]({ headers: this.getAuthenticationHeaders() });
        var fullUrl = "" + this.BASE_URL + url + "?" + this.urlEncode(params);
        this.loadingIndicator.show();
        return this.http.get(fullUrl, options)
            .do(function () { return _this.loadingIndicator.hide(); })
            .map(function (res) { return res.json(); })
            .catch(function (error) {
            // TODO: only catch authentication errors
            //       when doing this redirect
            _this.router.navigateByUrl('/login');
            _this.loadingIndicator.hide();
            return rxjs_Observable__WEBPACK_IMPORTED_MODULE_2__["Observable"].empty();
        });
    };
    ApiGateway.prototype.post = function (url, data) {
        var _this = this;
        var options = new _angular_http__WEBPACK_IMPORTED_MODULE_0__["RequestOptions"]({ headers: this.getAuthenticationHeaders() });
        var fullUrl = "" + this.BASE_URL + url;
        this.loadingIndicator.show();
        return this.http.post(fullUrl, data, options)
            .do(function () { return _this.loadingIndicator.hide(); })
            .map(function (res) { return res.json(); });
    };
    ApiGateway.prototype.put = function (url, data) {
        var _this = this;
        var options = new _angular_http__WEBPACK_IMPORTED_MODULE_0__["RequestOptions"]({ headers: this.getAuthenticationHeaders() });
        var fullUrl = "" + this.BASE_URL + url;
        this.loadingIndicator.show();
        return this.http.put(fullUrl, data, options)
            .do(function () { return _this.loadingIndicator.hide(); })
            .map(function (res) { return res.json(); });
    };
    ApiGateway.prototype.postWithoutAuthentication = function (url, data) {
        var _this = this;
        var headers = new _angular_http__WEBPACK_IMPORTED_MODULE_0__["Headers"]({
            'Content-Type': 'application/json'
        });
        var options = new _angular_http__WEBPACK_IMPORTED_MODULE_0__["RequestOptions"]({ headers: headers });
        var fullUrl = "" + this.BASE_URL + url;
        this.loadingIndicator.show();
        return this.http.post(fullUrl, data, options)
            .do(function () { return _this.loadingIndicator.hide(); })
            .map(function (response) {
            return {
                'access-token': response.headers.get('access-token'),
                'client': response.headers.get('client'),
                'expiry': response.headers.get('expiry'),
                'token-type': response.headers.get('token-type'),
                'uid': response.headers.get('uid'),
            };
        })
            .catch(function (error) {
            _this.loadingIndicator.hide();
            var errorResponse = error.json();
            return rxjs_Observable__WEBPACK_IMPORTED_MODULE_2__["Observable"].throw(errorResponse["errors"][0]);
        });
    };
    ApiGateway.prototype.getAuthenticationHeaders = function () {
        var headers = _app_core_auth_auth_credentials__WEBPACK_IMPORTED_MODULE_3__["AuthCredentials"].fromLocalStorage().toHeaders();
        // ensure that we receive responses as json
        headers.append('Content-Type', 'application/json');
        return headers;
    };
    ApiGateway.prototype.urlEncode = function (obj) {
        var urlSearchParams = new _angular_http__WEBPACK_IMPORTED_MODULE_0__["URLSearchParams"]();
        for (var key in obj) {
            urlSearchParams.append(key, obj[key]);
        }
        return urlSearchParams.toString();
    };
    return ApiGateway;
}());




/***/ }),

/***/ "./src/api/api.module.ts":
/*!*******************************!*\
  !*** ./src/api/api.module.ts ***!
  \*******************************/
/*! exports provided: ApiModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ApiModule", function() { return ApiModule; });
var ApiModule = /*@__PURE__*/ (function () {
    function ApiModule() {
    }
    return ApiModule;
}());




/***/ }),

/***/ "./src/api/base-url.service.ts":
/*!*************************************!*\
  !*** ./src/api/base-url.service.ts ***!
  \*************************************/
/*! exports provided: BASE_URL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BASE_URL", function() { return BASE_URL; });
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../environments/environment */ "./src/environments/environment.ts");

var BASE_URL = '';
if (_environments_environment__WEBPACK_IMPORTED_MODULE_0__["environment"].production) {
    BASE_URL = '';
}
else {
    BASE_URL = 'http://localhost:3000';
}



/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./login/login.component */ "./src/app/login/login.component.ts");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./home/home.component */ "./src/app/home/home.component.ts");
/* harmony import */ var _core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/auth/auth-guard.service */ "./src/app/core/auth/auth-guard.service.ts");



var appRoutes = [
    { path: 'login', component: _login_login_component__WEBPACK_IMPORTED_MODULE_0__["LoginComponent"] },
    { path: 'logout', redirectTo: 'login' },
    {
        path: '',
        canActivate: [_core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_2__["AuthGuard"]],
        children: [
            { path: '', component: _home_home_component__WEBPACK_IMPORTED_MODULE_1__["HomeComponent"] },
            { path: 'budgets', loadChildren: 'app/budgets/budgets.module#BudgetsModule' },
            { path: 'transactions', loadChildren: 'app/transactions/transactions.module#TransactionsModule' },
            { path: 'sink-funds', loadChildren: 'app/sink-funds/sink-funds.module#SinkFundsModule' },
            { path: 'account-balances', loadChildren: 'app/account-balances/account-balances.module#AccountBalancesModule' },
        ]
    }
];
var AppRoutingModule = /*@__PURE__*/ (function () {
    function AppRoutingModule() {
    }
    return AppRoutingModule;
}());




/***/ }),

/***/ "./src/app/app.component.ngfactory.js":
/*!********************************************!*\
  !*** ./src/app/app.component.ngfactory.js ***!
  \********************************************/
/*! exports provided: RenderType_AppComponent, View_AppComponent_0, View_AppComponent_Host_0, AppComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_AppComponent", function() { return RenderType_AppComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AppComponent_0", function() { return View_AppComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AppComponent_Host_0", function() { return View_AppComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponentNgFactory", function() { return AppComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _shared_main_toolbar_main_toolbar_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/main-toolbar/main-toolbar.component.ngfactory */ "./src/app/shared/main-toolbar/main-toolbar.component.ngfactory.js");
/* harmony import */ var _shared_main_toolbar_main_toolbar_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shared/main-toolbar/main-toolbar.component */ "./src/app/shared/main-toolbar/main-toolbar.component.ts");
/* harmony import */ var _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shared/main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/* harmony import */ var _node_modules_angular_material_sidenav_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../node_modules/@angular/material/sidenav/typings/index.ngfactory */ "./node_modules/@angular/material/sidenav/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/sidenav */ "./node_modules/@angular/material/esm5/sidenav.es5.js");
/* harmony import */ var _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/cdk/bidi */ "./node_modules/@angular/cdk/esm5/bidi.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _shared_menu_menu_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./shared/menu/menu.component.ngfactory */ "./src/app/shared/menu/menu.component.ngfactory.js");
/* harmony import */ var _shared_menu_menu_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./shared/menu/menu.component */ "./src/app/shared/menu/menu.component.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./core/auth/auth.service */ "./src/app/core/auth/auth.service.ts");
/* harmony import */ var _shared_loading_indicator_loading_indicator_component_ngfactory__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./shared/loading-indicator/loading-indicator.component.ngfactory */ "./src/app/shared/loading-indicator/loading-indicator.component.ngfactory.js");
/* harmony import */ var _shared_loading_indicator_loading_indicator_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./shared/loading-indicator/loading-indicator.component */ "./src/app/shared/loading-indicator/loading-indicator.component.ts");
/* harmony import */ var _shared_loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./shared/loading-indicator/loading-indicator.service */ "./src/app/shared/loading-indicator/loading-indicator.service.ts");
/* harmony import */ var _shared_message_display_message_display_component_ngfactory__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./shared/message-display/message-display.component.ngfactory */ "./src/app/shared/message-display/message-display.component.ngfactory.js");
/* harmony import */ var _shared_message_display_message_display_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./shared/message-display/message-display.component */ "./src/app/shared/message-display/message-display.component.ts");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./message-display/message.service */ "./src/app/message-display/message.service.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_flex_layout,_shared_main_toolbar_main_toolbar.component.ngfactory,_shared_main_toolbar_main_toolbar.component,_shared_main_toolbar_main_toolbar.service,_.._node_modules__angular_material_sidenav_typings_index.ngfactory,_angular_material_sidenav,_angular_cdk_bidi,_angular_cdk_a11y,_angular_cdk_platform,_angular_common,_shared_menu_menu.component.ngfactory,_shared_menu_menu.component,_angular_router,_core_auth_auth.service,_shared_loading_indicator_loading_indicator.component.ngfactory,_shared_loading_indicator_loading_indicator.component,_shared_loading_indicator_loading_indicator.service,_shared_message_display_message_display.component.ngfactory,_shared_message_display_message_display.component,_message_display_message.service,_app.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_flex_layout,_shared_main_toolbar_main_toolbar.component.ngfactory,_shared_main_toolbar_main_toolbar.component,_shared_main_toolbar_main_toolbar.service,_.._node_modules__angular_material_sidenav_typings_index.ngfactory,_angular_material_sidenav,_angular_cdk_bidi,_angular_cdk_a11y,_angular_cdk_platform,_angular_common,_shared_menu_menu.component.ngfactory,_shared_menu_menu.component,_angular_router,_core_auth_auth.service,_shared_loading_indicator_loading_indicator.component.ngfactory,_shared_loading_indicator_loading_indicator.component,_shared_loading_indicator_loading_indicator.service,_shared_message_display_message_display.component.ngfactory,_shared_message_display_message_display.component,_message_display_message.service,_app.component PURE_IMPORTS_END */






















var styles_AppComponent = ["[_nghost-%COMP%] {\n        display: flex;\n        flex: 1;\n    }"];
var RenderType_AppComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_AppComponent, data: {} });

function View_AppComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 30, "div", [["fxFlex", ""], ["fxLayout", "column"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["LayoutDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["StyleUtils"]], { layout: [0, "layout"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["FlexDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [3, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["StyleUtils"]], { flex: [0, "flex"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n       "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](5, 0, null, null, 2, "ec-main-toolbar", [], null, [[null, "openMenu"]], function (_v, en, $event) {
            var ad = true;
            if (("openMenu" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).toggle() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_main_toolbar_main_toolbar_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["View_MainToolbarComponent_0"], _shared_main_toolbar_main_toolbar_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["RenderType_MainToolbarComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 114688, null, 0, _shared_main_toolbar_main_toolbar_component__WEBPACK_IMPORTED_MODULE_3__["MainToolbarComponent"], [_shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_4__["MainToolbarService"]], null, { openMenu: "openMenu" }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, [" "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n         "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 21, "mat-sidenav-container", [["class", "main mat-drawer-container mat-sidenav-container"], ["fxFlex", ""]], null, null, null, _node_modules_angular_material_sidenav_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatSidenavContainer_0"], _node_modules_angular_material_sidenav_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatSidenavContainer"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](10, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["FlexDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [3, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["StyleUtils"]], { flex: [0, "flex"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 1490944, null, 2, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__["MatSidenavContainer"], [[2, _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_7__["Directionality"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__["MAT_DRAWER_DEFAULT_AUTOSIZE"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 1, { _drawers: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _content: 0 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n\n           "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, 0, 5, "mat-sidenav", [["class", "mat-drawer mat-sidenav"], ["mode", "side"], ["tabIndex", "-1"]], [[40, "@transform", 0], [1, "align", 0], [2, "mat-drawer-end", null], [2, "mat-drawer-over", null], [2, "mat-drawer-push", null], [2, "mat-drawer-side", null], [2, "mat-sidenav-fixed", null], [4, "top", "px"], [4, "bottom", "px"]], [["component", "@transform.start"], ["component", "@transform.done"], [null, "keydown"]], function (_v, en, $event) {
            var ad = true;
            if (("component:@transform.start" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._onAnimationStart($event) !== false);
                ad = (pd_0 && ad);
            }
            if (("component:@transform.done" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._onAnimationEnd($event) !== false);
                ad = (pd_1 && ad);
            }
            if (("keydown" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).handleKeydown($event) !== false);
                ad = (pd_2 && ad);
            }
            return ad;
        }, _node_modules_angular_material_sidenav_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatSidenav_0"], _node_modules_angular_material_sidenav_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatSidenav"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 3325952, [[1, 4], ["sideNav", 4]], 0, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_6__["MatSidenav"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_8__["FocusTrapFactory"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_8__["FocusMonitor"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_9__["Platform"], [2, _angular_common__WEBPACK_IMPORTED_MODULE_10__["DOCUMENT"]]], { mode: [0, "mode"], opened: [1, "opened"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n             "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](18, 0, null, 0, 1, "ec-menu", [], null, [[null, "menuSelect"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("menuSelect" === en)) {
                var pd_0 = (_co.onMenuSelect() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_menu_menu_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__["View_MenuComponent_0"], _shared_menu_menu_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__["RenderType_MenuComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](19, 114688, null, 0, _shared_menu_menu_component__WEBPACK_IMPORTED_MODULE_12__["MenuComponent"], [_angular_router__WEBPACK_IMPORTED_MODULE_13__["Router"], _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_14__["AuthService"]], null, { menuSelect: "menuSelect" }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n           "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n\n           "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](22, 0, null, 2, 1, "ec-loading-indicator", [], null, null, null, _shared_loading_indicator_loading_indicator_component_ngfactory__WEBPACK_IMPORTED_MODULE_15__["View_LoadingIndicatorComponent_0"], _shared_loading_indicator_loading_indicator_component_ngfactory__WEBPACK_IMPORTED_MODULE_15__["RenderType_LoadingIndicatorComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](23, 114688, null, 0, _shared_loading_indicator_loading_indicator_component__WEBPACK_IMPORTED_MODULE_16__["LoadingIndicatorComponent"], [_shared_loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_17__["LoadingIndicator"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n           "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](25, 0, null, 2, 1, "ec-message-display", [], null, null, null, _shared_message_display_message_display_component_ngfactory__WEBPACK_IMPORTED_MODULE_18__["View_MessageDisplayComponent_0"], _shared_message_display_message_display_component_ngfactory__WEBPACK_IMPORTED_MODULE_18__["RenderType_MessageDisplayComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 114688, null, 0, _shared_message_display_message_display_component__WEBPACK_IMPORTED_MODULE_19__["MessageDisplayComponent"], [_message_display_message_service__WEBPACK_IMPORTED_MODULE_20__["MessageService"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n           "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](28, 16777216, null, 2, 1, "router-outlet", [], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](29, 212992, null, 0, _angular_router__WEBPACK_IMPORTED_MODULE_13__["RouterOutlet"], [_angular_router__WEBPACK_IMPORTED_MODULE_13__["ChildrenOutletContexts"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ComponentFactoryResolver"], [8, null], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n\n         "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n     "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var currVal_0 = "column"; _ck(_v, 2, 0, currVal_0); var currVal_1 = ""; _ck(_v, 3, 0, currVal_1); _ck(_v, 6, 0); var currVal_2 = ""; _ck(_v, 10, 0, currVal_2); _ck(_v, 11, 0); var currVal_12 = "side"; var currVal_13 = true; _ck(_v, 16, 0, currVal_12, currVal_13); _ck(_v, 19, 0); _ck(_v, 23, 0); _ck(_v, 26, 0); _ck(_v, 29, 0); }, function (_ck, _v) { var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._animationState; var currVal_4 = null; var currVal_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).position === "end"); var currVal_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).mode === "over"); var currVal_7 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).mode === "push"); var currVal_8 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).mode === "side"); var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).fixedInViewport; var currVal_10 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).fixedInViewport ? _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).fixedTopGap : null); var currVal_11 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).fixedInViewport ? _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).fixedBottomGap : null); _ck(_v, 15, 0, currVal_3, currVal_4, currVal_5, currVal_6, currVal_7, currVal_8, currVal_9, currVal_10, currVal_11); });
}
function View_AppComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-root", [], null, null, null, View_AppComponent_0, RenderType_AppComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _app_component__WEBPACK_IMPORTED_MODULE_21__["AppComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var AppComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-root", _app_component__WEBPACK_IMPORTED_MODULE_21__["AppComponent"], View_AppComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
var AppComponent = /*@__PURE__*/ (function () {
    function AppComponent() {
    }
    AppComponent.prototype.ngOnInit = function () {
    };
    AppComponent.prototype.onMenuSelect = function () {
    };
    return AppComponent;
}());




/***/ }),

/***/ "./src/app/app.module.ngfactory.js":
/*!*****************************************!*\
  !*** ./src/app/app.module.ngfactory.js ***!
  \*****************************************/
/*! exports provided: AppModuleNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModuleNgFactory", function() { return AppModuleNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _app_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app.module */ "./src/app/app.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _node_modules_angular_material_dialog_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../node_modules/@angular/material/dialog/typings/index.ngfactory */ "./node_modules/@angular/material/dialog/typings/index.ngfactory.js");
/* harmony import */ var _node_modules_angular_material_snack_bar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../node_modules/@angular/material/snack-bar/typings/index.ngfactory */ "./node_modules/@angular/material/snack-bar/typings/index.ngfactory.js");
/* harmony import */ var _shared_confirmation_confirmation_component_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shared/confirmation/confirmation.component.ngfactory */ "./src/app/shared/confirmation/confirmation.component.ngfactory.js");
/* harmony import */ var _login_login_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./login/login.component.ngfactory */ "./src/app/login/login.component.ngfactory.js");
/* harmony import */ var _home_home_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./home/home.component.ngfactory */ "./src/app/home/home.component.ngfactory.js");
/* harmony import */ var _budgets_future_budgets_future_budgets_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./budgets/future-budgets/future-budgets.component.ngfactory */ "./src/app/budgets/future-budgets/future-budgets.component.ngfactory.js");
/* harmony import */ var _budgets_budget_budget_component_ngfactory__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./budgets/budget/budget.component.ngfactory */ "./src/app/budgets/budget/budget.component.ngfactory.js");
/* harmony import */ var _budgets_budgets_budgets_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./budgets/budgets/budgets.component.ngfactory */ "./src/app/budgets/budgets/budgets.component.ngfactory.js");
/* harmony import */ var _shared_transactions_compact_transaction_list_compact_transaction_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./shared-transactions/compact-transaction-list/compact-transaction-list.component.ngfactory */ "./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ngfactory.js");
/* harmony import */ var _app_component_ngfactory__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./app.component.ngfactory */ "./src/app/app.component.ngfactory.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/esm5/platform-browser.js");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var _angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/animations/browser */ "./node_modules/@angular/animations/esm5/browser.js");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/esm5/animations.js");
/* harmony import */ var _angular_animations__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/animations */ "./node_modules/@angular/animations/esm5/animations.js");
/* harmony import */ var _angular_http__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/http */ "./node_modules/@angular/http/esm5/http.js");
/* harmony import */ var _shared_loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./shared/loading-indicator/loading-indicator.service */ "./src/app/shared/loading-indicator/loading-indicator.service.ts");
/* harmony import */ var _api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../api/api-gateway.service */ "./src/api/api-gateway.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./core/auth/auth.service */ "./src/app/core/auth/auth.service.ts");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/cdk/scrolling */ "./node_modules/@angular/cdk/esm5/scrolling.es5.js");
/* harmony import */ var _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/cdk/overlay */ "./node_modules/@angular/cdk/esm5/overlay.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/cdk/layout */ "./node_modules/@angular/cdk/esm5/layout.es5.js");
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm5/snack-bar.es5.js");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./message-display/message.service */ "./src/app/message-display/message.service.ts");
/* harmony import */ var _core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./core/auth/auth-guard.service */ "./src/app/core/auth/auth-guard.service.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! @angular/cdk/bidi */ "./node_modules/@angular/cdk/esm5/bidi.es5.js");
/* harmony import */ var _angular_cdk_observers__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! @angular/cdk/observers */ "./node_modules/@angular/cdk/esm5/observers.es5.js");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm5/dialog.es5.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/esm5/icon.es5.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/esm5/http.js");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! @angular/material/select */ "./node_modules/@angular/material/esm5/select.es5.js");
/* harmony import */ var _shared_confirmation_service__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./shared/confirmation.service */ "./src/app/shared/confirmation.service.ts");
/* harmony import */ var _shared_deactivate_button_deactivate_service__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./shared/deactivate-button/deactivate.service */ "./src/app/shared/deactivate-button/deactivate.service.ts");
/* harmony import */ var _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./shared/main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/* harmony import */ var _shared_settings_service__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./shared/settings.service */ "./src/app/shared/settings.service.ts");
/* harmony import */ var _bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./bank-accounts/bank-account.service */ "./src/app/bank-accounts/bank-account.service.ts");
/* harmony import */ var _budgets_future_budgets_future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./budgets/future-budgets/future-budgets-data-formatter.service */ "./src/app/budgets/future-budgets/future-budgets-data-formatter.service.ts");
/* harmony import */ var _shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./shared-transactions/shared-transaction.service */ "./src/app/shared-transactions/shared-transaction.service.ts");
/* harmony import */ var _budgets_budget_service__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./budgets/budget.service */ "./src/app/budgets/budget.service.ts");
/* harmony import */ var _api_api_module__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ../api/api.module */ "./src/api/api.module.ts");
/* harmony import */ var _core_auth_auth_module__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./core/auth/auth.module */ "./src/app/core/auth/auth.module.ts");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./login/login.component */ "./src/app/login/login.component.ts");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./home/home.component */ "./src/app/home/home.component.ts");
/* harmony import */ var _budgets_future_budgets_future_budgets_component__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./budgets/future-budgets/future-budgets.component */ "./src/app/budgets/future-budgets/future-budgets.component.ts");
/* harmony import */ var _budgets_budget_budget_component__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ./budgets/budget/budget.component */ "./src/app/budgets/budget/budget.component.ts");
/* harmony import */ var _budgets_budgets_budgets_component__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ./budgets/budgets/budgets.component */ "./src/app/budgets/budgets/budgets.component.ts");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! @angular/material/checkbox */ "./node_modules/@angular/material/esm5/checkbox.es5.js");
/* harmony import */ var _angular_cdk_portal__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! @angular/cdk/portal */ "./node_modules/@angular/cdk/esm5/portal.es5.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! @angular/material/divider */ "./node_modules/@angular/material/esm5/divider.es5.js");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! @angular/material/list */ "./node_modules/@angular/material/esm5/list.es5.js");
/* harmony import */ var _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! @angular/material/progress-bar */ "./node_modules/@angular/material/esm5/progress-bar.es5.js");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! @angular/material/sidenav */ "./node_modules/@angular/material/esm5/sidenav.es5.js");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! @angular/material/slide-toggle */ "./node_modules/@angular/material/esm5/slide-toggle.es5.js");
/* harmony import */ var _angular_cdk_table__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! @angular/cdk/table */ "./node_modules/@angular/cdk/esm5/table.es5.js");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm5/table.es5.js");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! @angular/material/toolbar */ "./node_modules/@angular/material/esm5/toolbar.es5.js");
/* harmony import */ var _shared_ec_material_ec_material_module__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! ./shared/ec-material/ec-material.module */ "./src/app/shared/ec-material/ec-material.module.ts");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! ./shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _core_core_module__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! ./core/core.module */ "./src/app/core/core.module.ts");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _bank_accounts_bank_accounts_routing_module__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! ./bank-accounts/bank-accounts-routing.module */ "./src/app/bank-accounts/bank-accounts-routing.module.ts");
/* harmony import */ var _bank_accounts_bank_accounts_module__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! ./bank-accounts/bank-accounts.module */ "./src/app/bank-accounts/bank-accounts.module.ts");
/* harmony import */ var _budgets_future_budgets_future_budgets_module__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! ./budgets/future-budgets/future-budgets.module */ "./src/app/budgets/future-budgets/future-budgets.module.ts");
/* harmony import */ var _budgets_budgets_routing_module__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! ./budgets/budgets-routing.module */ "./src/app/budgets/budgets-routing.module.ts");
/* harmony import */ var _shared_transactions_shared_transactions_module__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! ./shared-transactions/shared-transactions.module */ "./src/app/shared-transactions/shared-transactions.module.ts");
/* harmony import */ var _budgets_budgets_module__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! ./budgets/budgets.module */ "./src/app/budgets/budgets.module.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_app.module,_app.component,_.._node_modules__angular_material_dialog_typings_index.ngfactory,_.._node_modules__angular_material_snack_bar_typings_index.ngfactory,_shared_confirmation_confirmation.component.ngfactory,_login_login.component.ngfactory,_home_home.component.ngfactory,_budgets_future_budgets_future_budgets.component.ngfactory,_budgets_budget_budget.component.ngfactory,_budgets_budgets_budgets.component.ngfactory,_shared_transactions_compact_transaction_list_compact_transaction_list.component.ngfactory,_app.component.ngfactory,_angular_common,_angular_platform_browser,_angular_material_core,_angular_animations_browser,_angular_platform_browser_animations,_angular_animations,_angular_http,_shared_loading_indicator_loading_indicator.service,_api_api_gateway.service,_angular_router,_core_auth_auth.service,_angular_cdk_platform,_angular_cdk_scrolling,_angular_cdk_overlay,_angular_cdk_a11y,_angular_cdk_layout,_angular_material_snack_bar,_message_display_message.service,_core_auth_auth_guard.service,_angular_forms,_angular_flex_layout,_angular_cdk_bidi,_angular_cdk_observers,_angular_material_dialog,_angular_material_icon,_angular_common_http,_angular_material_select,_shared_confirmation.service,_shared_deactivate_button_deactivate.service,_shared_main_toolbar_main_toolbar.service,_shared_settings.service,_bank_accounts_bank_account.service,_budgets_future_budgets_future_budgets_data_formatter.service,_shared_transactions_shared_transaction.service,_budgets_budget.service,_api_api.module,_core_auth_auth.module,_login_login.component,_home_home.component,_budgets_future_budgets_future_budgets.component,_budgets_budget_budget.component,_budgets_budgets_budgets.component,_angular_material_button,_angular_material_card,_angular_material_checkbox,_angular_cdk_portal,_angular_material_form_field,_angular_material_input,_angular_material_divider,_angular_material_list,_angular_material_progress_bar,_angular_material_sidenav,_angular_material_slide_toggle,_angular_cdk_table,_angular_material_table,_angular_material_toolbar,_shared_ec_material_ec_material.module,_shared_shared.module,_core_core.module,_app_routing.module,_bank_accounts_bank_accounts_routing.module,_bank_accounts_bank_accounts.module,_budgets_future_budgets_future_budgets.module,_budgets_budgets_routing.module,_shared_transactions_shared_transactions.module,_budgets_budgets.module PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_app.module,_app.component,_.._node_modules__angular_material_dialog_typings_index.ngfactory,_.._node_modules__angular_material_snack_bar_typings_index.ngfactory,_shared_confirmation_confirmation.component.ngfactory,_login_login.component.ngfactory,_home_home.component.ngfactory,_budgets_future_budgets_future_budgets.component.ngfactory,_budgets_budget_budget.component.ngfactory,_budgets_budgets_budgets.component.ngfactory,_shared_transactions_compact_transaction_list_compact_transaction_list.component.ngfactory,_app.component.ngfactory,_angular_common,_angular_platform_browser,_angular_material_core,_angular_animations_browser,_angular_platform_browser_animations,_angular_animations,_angular_http,_shared_loading_indicator_loading_indicator.service,_api_api_gateway.service,_angular_router,_core_auth_auth.service,_angular_cdk_platform,_angular_cdk_scrolling,_angular_cdk_overlay,_angular_cdk_a11y,_angular_cdk_layout,_angular_material_snack_bar,_message_display_message.service,_core_auth_auth_guard.service,_angular_forms,_angular_flex_layout,_angular_cdk_bidi,_angular_cdk_observers,_angular_material_dialog,_angular_material_icon,_angular_common_http,_angular_material_select,_shared_confirmation.service,_shared_deactivate_button_deactivate.service,_shared_main_toolbar_main_toolbar.service,_shared_settings.service,_bank_accounts_bank_account.service,_budgets_future_budgets_future_budgets_data_formatter.service,_shared_transactions_shared_transaction.service,_budgets_budget.service,_api_api.module,_core_auth_auth.module,_login_login.component,_home_home.component,_budgets_future_budgets_future_budgets.component,_budgets_budget_budget.component,_budgets_budgets_budgets.component,_angular_material_button,_angular_material_card,_angular_material_checkbox,_angular_cdk_portal,_angular_material_form_field,_angular_material_input,_angular_material_divider,_angular_material_list,_angular_material_progress_bar,_angular_material_sidenav,_angular_material_slide_toggle,_angular_cdk_table,_angular_material_table,_angular_material_toolbar,_shared_ec_material_ec_material.module,_shared_shared.module,_core_core.module,_app_routing.module,_bank_accounts_bank_accounts_routing.module,_bank_accounts_bank_accounts.module,_budgets_future_budgets_future_budgets.module,_budgets_budgets_routing.module,_shared_transactions_shared_transactions.module,_budgets_budgets.module PURE_IMPORTS_END */















































































var AppModuleNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcmf"](_app_module__WEBPACK_IMPORTED_MODULE_1__["AppModule"], [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]], function (_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmod"]([_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ComponentFactoryResolver"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵCodegenComponentFactoryResolver"], [[8, [_node_modules_angular_material_dialog_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["MatDialogContainerNgFactory"], _node_modules_angular_material_snack_bar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["MatSnackBarContainerNgFactory"], _node_modules_angular_material_snack_bar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["SimpleSnackBarNgFactory"], _shared_confirmation_confirmation_component_ngfactory__WEBPACK_IMPORTED_MODULE_5__["ConfirmationComponentNgFactory"], _login_login_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["LoginComponentNgFactory"], _home_home_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["HomeComponentNgFactory"], _budgets_future_budgets_future_budgets_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["FutureBudgetsComponentNgFactory"], _budgets_budget_budget_component_ngfactory__WEBPACK_IMPORTED_MODULE_9__["BudgetComponentNgFactory"], _budgets_budgets_budgets_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["BudgetsComponentNgFactory"], _shared_transactions_compact_transaction_list_compact_transaction_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__["CompactTransactionListComponentNgFactory"], _app_component_ngfactory__WEBPACK_IMPORTED_MODULE_12__["AppComponentNgFactory"]]], [3, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ComponentFactoryResolver"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModuleRef"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_core__WEBPACK_IMPORTED_MODULE_0__["LOCALE_ID"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵq"], [[3, _angular_core__WEBPACK_IMPORTED_MODULE_0__["LOCALE_ID"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgLocalization"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgLocaleLocalization"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["LOCALE_ID"], [2, _angular_common__WEBPACK_IMPORTED_MODULE_13__["ɵa"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_core__WEBPACK_IMPORTED_MODULE_0__["APP_ID"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵi"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵn"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_core__WEBPACK_IMPORTED_MODULE_0__["KeyValueDiffers"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵo"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["DomSanitizer"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵe"], [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](6144, _angular_core__WEBPACK_IMPORTED_MODULE_0__["Sanitizer"], null, [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["DomSanitizer"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["HAMMER_GESTURE_CONFIG"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["GestureConfig"], [[2, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MAT_HAMMER_OPTIONS"]], [2, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatCommonModule"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["EVENT_MANAGER_PLUGINS"], function (p0_0, p0_1, p1_0, p2_0, p2_1) { return [new _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomEventsPlugin"](p0_0, p0_1), new _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵKeyEventsPlugin"](p1_0), new _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵHammerGesturesPlugin"](p2_0, p2_1)]; }, [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["HAMMER_GESTURE_CONFIG"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["EventManager"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["EventManager"], [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["EVENT_MANAGER_PLUGINS"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](135680, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomSharedStylesHost"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomSharedStylesHost"], [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomRendererFactory2"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomRendererFactory2"], [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["EventManager"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomSharedStylesHost"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__["AnimationDriver"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["ɵc"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__["ɵAnimationStyleNormalizer"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["ɵd"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__["ɵAnimationEngine"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["ɵb"], [_angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__["AnimationDriver"], _angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__["ɵAnimationStyleNormalizer"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_core__WEBPACK_IMPORTED_MODULE_0__["RendererFactory2"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["ɵe"], [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomRendererFactory2"], _angular_animations_browser__WEBPACK_IMPORTED_MODULE_16__["ɵAnimationEngine"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](6144, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵSharedStylesHost"], null, [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵDomSharedStylesHost"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_core__WEBPACK_IMPORTED_MODULE_0__["Testability"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Testability"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["Meta"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["Meta"], [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["Title"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["Title"], [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_animations__WEBPACK_IMPORTED_MODULE_18__["AnimationBuilder"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["ɵBrowserAnimationBuilder"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["RendererFactory2"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_http__WEBPACK_IMPORTED_MODULE_19__["BrowserXhr"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["BrowserXhr"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_http__WEBPACK_IMPORTED_MODULE_19__["ResponseOptions"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["BaseResponseOptions"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_http__WEBPACK_IMPORTED_MODULE_19__["XSRFStrategy"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["ɵa"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_http__WEBPACK_IMPORTED_MODULE_19__["XHRBackend"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["XHRBackend"], [_angular_http__WEBPACK_IMPORTED_MODULE_19__["BrowserXhr"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["ResponseOptions"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["XSRFStrategy"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_http__WEBPACK_IMPORTED_MODULE_19__["RequestOptions"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["BaseRequestOptions"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_http__WEBPACK_IMPORTED_MODULE_19__["Http"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["ɵb"], [_angular_http__WEBPACK_IMPORTED_MODULE_19__["XHRBackend"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["RequestOptions"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _shared_loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_20__["LoadingIndicator"], _shared_loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_20__["LoadingIndicator"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"], _api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"], [_angular_http__WEBPACK_IMPORTED_MODULE_19__["Http"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"], _shared_loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_20__["LoadingIndicator"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_23__["AuthService"], _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_23__["AuthService"], [_api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ScrollDispatcher"], _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["SCROLL_DISPATCHER_PROVIDER_FACTORY"], [[3, _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ScrollDispatcher"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ViewportRuler"], _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["VIEWPORT_RULER_PROVIDER_FACTORY"], [[3, _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ViewportRuler"]], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ScrollStrategyOptions"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ScrollStrategyOptions"], [_angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ScrollDispatcher"], _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ViewportRuler"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayContainer"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ɵa"], [[3, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayContainer"]], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayPositionBuilder"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayPositionBuilder"], [_angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ViewportRuler"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayKeyboardDispatcher"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ɵf"], [[3, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayKeyboardDispatcher"]], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"], [_angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ScrollStrategyOptions"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayContainer"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ComponentFactoryResolver"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayPositionBuilder"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayKeyboardDispatcher"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["LiveAnnouncer"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["LIVE_ANNOUNCER_PROVIDER_FACTORY"], [[3, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["LiveAnnouncer"]], [2, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["LIVE_ANNOUNCER_ELEMENT_TOKEN"]], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["MediaMatcher"], _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["MediaMatcher"], [_angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](135680, _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["BreakpointObserver"], _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["BreakpointObserver"], [_angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["MediaMatcher"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__["MatSnackBar"], _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__["MatSnackBar"], [_angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["LiveAnnouncer"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"], _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["BreakpointObserver"], [3, _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__["MatSnackBar"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _message_display_message_service__WEBPACK_IMPORTED_MODULE_30__["MessageService"], _message_display_message_service__WEBPACK_IMPORTED_MODULE_30__["MessageService"], [_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__["MatSnackBar"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_31__["AuthGuard"], _core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_31__["AuthGuard"], [_message_display_message_service__WEBPACK_IMPORTED_MODULE_30__["MessageService"], _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_23__["AuthService"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_forms__WEBPACK_IMPORTED_MODULE_32__["ɵi"], _angular_forms__WEBPACK_IMPORTED_MODULE_32__["ɵi"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_forms__WEBPACK_IMPORTED_MODULE_32__["FormBuilder"], _angular_forms__WEBPACK_IMPORTED_MODULE_32__["FormBuilder"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["BREAKPOINTS"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["DEFAULT_BREAKPOINTS_PROVIDER_FACTORY"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["BreakPointRegistry"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["BreakPointRegistry"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["BREAKPOINTS"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MatchMedia"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MatchMedia"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["PLATFORM_ID"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MediaMonitor"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MediaMonitor"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["BreakPointRegistry"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MatchMedia"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ObservableMedia"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["OBSERVABLE_MEDIA_PROVIDER_FACTORY"], [[3, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ObservableMedia"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MatchMedia"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["BreakPointRegistry"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](6144, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ɵa"], null, [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ɵb"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ɵb"], [[2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ɵa"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ServerStylesheet"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ServerStylesheet"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["StyleUtils"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["StyleUtils"], [[2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ServerStylesheet"]], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["SERVER_TOKEN"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["PLATFORM_ID"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTER_INITIALIZER"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵi"], [_angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵg"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_core__WEBPACK_IMPORTED_MODULE_0__["APP_BOOTSTRAP_LISTENER"], function (p0_0, p0_1, p1_0) { return [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["removeStyles"](p0_0, p0_1), p1_0]; }, [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["PLATFORM_ID"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTER_INITIALIZER"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](6144, _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__["DIR_DOCUMENT"], null, [_angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__["Directionality"], _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__["Directionality"], [[2, _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__["DIR_DOCUMENT"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["InteractivityChecker"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["InteractivityChecker"], [_angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["FocusTrapFactory"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["FocusTrapFactory"], [_angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["InteractivityChecker"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](136192, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["AriaDescriber"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["ARIA_DESCRIBER_PROVIDER_FACTORY"], [[3, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["AriaDescriber"]], _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["FocusMonitor"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["FOCUS_MONITOR_PROVIDER_FACTORY"], [[3, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["FocusMonitor"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["Platform"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_cdk_observers__WEBPACK_IMPORTED_MODULE_35__["MutationObserverFactory"], _angular_cdk_observers__WEBPACK_IMPORTED_MODULE_35__["MutationObserverFactory"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ɵc"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["ɵd"], [_angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MAT_DIALOG_SCROLL_STRATEGY"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY"], [_angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialog"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialog"], [_angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"], [2, _angular_common__WEBPACK_IMPORTED_MODULE_13__["Location"]], [2, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MAT_DIALOG_DEFAULT_OPTIONS"]], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MAT_DIALOG_SCROLL_STRATEGY"], [3, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialog"]], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayContainer"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_material_icon__WEBPACK_IMPORTED_MODULE_37__["MatIconRegistry"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_37__["ICON_REGISTRY_PROVIDER_FACTORY"], [[3, _angular_material_icon__WEBPACK_IMPORTED_MODULE_37__["MatIconRegistry"]], [2, _angular_common_http__WEBPACK_IMPORTED_MODULE_38__["HttpClient"]], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["DomSanitizer"], [2, _angular_common__WEBPACK_IMPORTED_MODULE_13__["DOCUMENT"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["ErrorStateMatcher"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["ErrorStateMatcher"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_material_select__WEBPACK_IMPORTED_MODULE_39__["MAT_SELECT_SCROLL_STRATEGY"], _angular_material_select__WEBPACK_IMPORTED_MODULE_39__["MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY"], [_angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["Overlay"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _shared_confirmation_service__WEBPACK_IMPORTED_MODULE_40__["ConfirmationService"], _shared_confirmation_service__WEBPACK_IMPORTED_MODULE_40__["ConfirmationService"], [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialog"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _shared_deactivate_button_deactivate_service__WEBPACK_IMPORTED_MODULE_41__["DeactivateService"], _shared_deactivate_button_deactivate_service__WEBPACK_IMPORTED_MODULE_41__["DeactivateService"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_42__["MainToolbarService"], _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_42__["MainToolbarService"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _shared_settings_service__WEBPACK_IMPORTED_MODULE_43__["SettingsService"], _shared_settings_service__WEBPACK_IMPORTED_MODULE_43__["SettingsService"], [_api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](5120, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ActivatedRoute"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵf"], [_angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_router__WEBPACK_IMPORTED_MODULE_22__["NoPreloading"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["NoPreloading"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](6144, _angular_router__WEBPACK_IMPORTED_MODULE_22__["PreloadingStrategy"], null, [_angular_router__WEBPACK_IMPORTED_MODULE_22__["NoPreloading"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](135680, _angular_router__WEBPACK_IMPORTED_MODULE_22__["RouterPreloader"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["RouterPreloader"], [_angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModuleFactoryLoader"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Compiler"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["PreloadingStrategy"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _angular_router__WEBPACK_IMPORTED_MODULE_22__["PreloadAllModules"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["PreloadAllModules"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_44__["BankAccountService"], _bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_44__["BankAccountService"], [_api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _budgets_future_budgets_future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_45__["FutureBudgetsDataFormatterService"], _budgets_future_budgets_future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_45__["FutureBudgetsDataFormatterService"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_46__["SharedTransactionService"], _shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_46__["SharedTransactionService"], [_api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](4608, _budgets_budget_service__WEBPACK_IMPORTED_MODULE_47__["BudgetService"], _budgets_budget_service__WEBPACK_IMPORTED_MODULE_47__["BudgetService"], [_api_api_gateway_service__WEBPACK_IMPORTED_MODULE_21__["ApiGateway"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_common__WEBPACK_IMPORTED_MODULE_13__["CommonModule"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["CommonModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ErrorHandler"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵa"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgProbeToken"], function () { return [_angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵb"]()]; }, []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵg"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵg"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_core__WEBPACK_IMPORTED_MODULE_0__["APP_INITIALIZER"], function (p0_0, p1_0) { return [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["ɵh"](p0_0), _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵh"](p1_0)]; }, [[2, _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgProbeToken"]], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵg"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationInitStatus"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationInitStatus"], [[2, _angular_core__WEBPACK_IMPORTED_MODULE_0__["APP_INITIALIZER"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](131584, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationRef"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵConsole"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ErrorHandler"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ComponentFactoryResolver"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationInitStatus"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationModule"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationModule"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationRef"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["BrowserModule"], _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["BrowserModule"], [[3, _angular_platform_browser__WEBPACK_IMPORTED_MODULE_14__["BrowserModule"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["BrowserAnimationsModule"], _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_17__["BrowserAnimationsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_http__WEBPACK_IMPORTED_MODULE_19__["HttpModule"], _angular_http__WEBPACK_IMPORTED_MODULE_19__["HttpModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _api_api_module__WEBPACK_IMPORTED_MODULE_48__["ApiModule"], _api_api_module__WEBPACK_IMPORTED_MODULE_48__["ApiModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _core_auth_auth_module__WEBPACK_IMPORTED_MODULE_49__["AuthModule"], _core_auth_auth_module__WEBPACK_IMPORTED_MODULE_49__["AuthModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_forms__WEBPACK_IMPORTED_MODULE_32__["ɵba"], _angular_forms__WEBPACK_IMPORTED_MODULE_32__["ɵba"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_forms__WEBPACK_IMPORTED_MODULE_32__["FormsModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_32__["FormsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_forms__WEBPACK_IMPORTED_MODULE_32__["ReactiveFormsModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_32__["ReactiveFormsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵa"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵd"], [[3, _angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_router__WEBPACK_IMPORTED_MODULE_22__["UrlSerializer"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["DefaultUrlSerializer"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ChildrenOutletContexts"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ChildrenOutletContexts"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](256, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTER_CONFIGURATION"], { useHash: true }, []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_common__WEBPACK_IMPORTED_MODULE_13__["LocationStrategy"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵc"], [_angular_common__WEBPACK_IMPORTED_MODULE_13__["PlatformLocation"], [2, _angular_common__WEBPACK_IMPORTED_MODULE_13__["APP_BASE_HREF"]], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTER_CONFIGURATION"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_common__WEBPACK_IMPORTED_MODULE_13__["Location"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["Location"], [_angular_common__WEBPACK_IMPORTED_MODULE_13__["LocationStrategy"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_core__WEBPACK_IMPORTED_MODULE_0__["Compiler"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Compiler"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModuleFactoryLoader"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["SystemJsNgModuleLoader"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Compiler"], [2, _angular_core__WEBPACK_IMPORTED_MODULE_0__["SystemJsNgModuleLoaderConfig"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTES"], function () { return [[{ path: "login", component: _login_login_component__WEBPACK_IMPORTED_MODULE_50__["LoginComponent"] }, { path: "logout", redirectTo: "login" }, { path: "", canActivate: [_core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_31__["AuthGuard"]], children: [{ path: "", component: _home_home_component__WEBPACK_IMPORTED_MODULE_51__["HomeComponent"] }, { path: "budgets", loadChildren: "app/budgets/budgets.module#BudgetsModule" }, { path: "transactions", loadChildren: "app/transactions/transactions.module#TransactionsModule" }, { path: "sink-funds", loadChildren: "app/sink-funds/sink-funds.module#SinkFundsModule" }, { path: "account-balances", loadChildren: "app/account-balances/account-balances.module#AccountBalancesModule" }] }], [], [{ path: "", canActivate: [_core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_31__["AuthGuard"]], children: [{ path: "future", component: _budgets_future_budgets_future_budgets_component__WEBPACK_IMPORTED_MODULE_52__["FutureBudgetsComponent"] }, { path: ":id", component: _budgets_budget_budget_component__WEBPACK_IMPORTED_MODULE_53__["BudgetComponent"] }, { path: "", component: _budgets_budgets_budgets_component__WEBPACK_IMPORTED_MODULE_54__["BudgetsComponent"] }] }]]; }, []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](1024, _angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵe"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ApplicationRef"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["UrlSerializer"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ChildrenOutletContexts"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["Location"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injector"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModuleFactoryLoader"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Compiler"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTES"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["ROUTER_CONFIGURATION"], [2, _angular_router__WEBPACK_IMPORTED_MODULE_22__["UrlHandlingStrategy"]], [2, _angular_router__WEBPACK_IMPORTED_MODULE_22__["RouteReuseStrategy"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_router__WEBPACK_IMPORTED_MODULE_22__["RouterModule"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["RouterModule"], [[2, _angular_router__WEBPACK_IMPORTED_MODULE_22__["ɵa"]], [2, _angular_router__WEBPACK_IMPORTED_MODULE_22__["Router"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MediaQueriesModule"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["MediaQueriesModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ɵc"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["ɵc"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["FlexLayoutModule"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["FlexLayoutModule"], [[2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_33__["SERVER_TOKEN"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["PLATFORM_ID"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__["BidiModule"], _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_34__["BidiModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](256, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MATERIAL_SANITY_CHECKS"], true, []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatCommonModule"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatCommonModule"], [[2, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MATERIAL_SANITY_CHECKS"]]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["PlatformModule"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_24__["PlatformModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatRippleModule"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatRippleModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["A11yModule"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_27__["A11yModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_button__WEBPACK_IMPORTED_MODULE_55__["MatButtonModule"], _angular_material_button__WEBPACK_IMPORTED_MODULE_55__["MatButtonModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_card__WEBPACK_IMPORTED_MODULE_56__["MatCardModule"], _angular_material_card__WEBPACK_IMPORTED_MODULE_56__["MatCardModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_observers__WEBPACK_IMPORTED_MODULE_35__["ObserversModule"], _angular_cdk_observers__WEBPACK_IMPORTED_MODULE_35__["ObserversModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_57__["MatCheckboxModule"], _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_57__["MatCheckboxModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_portal__WEBPACK_IMPORTED_MODULE_58__["PortalModule"], _angular_cdk_portal__WEBPACK_IMPORTED_MODULE_58__["PortalModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ScrollDispatchModule"], _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_25__["ScrollDispatchModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayModule"], _angular_cdk_overlay__WEBPACK_IMPORTED_MODULE_26__["OverlayModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialogModule"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_36__["MatDialogModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_icon__WEBPACK_IMPORTED_MODULE_37__["MatIconModule"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_37__["MatIconModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_59__["MatFormFieldModule"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_59__["MatFormFieldModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_input__WEBPACK_IMPORTED_MODULE_60__["MatInputModule"], _angular_material_input__WEBPACK_IMPORTED_MODULE_60__["MatInputModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatLineModule"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatLineModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatPseudoCheckboxModule"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatPseudoCheckboxModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_divider__WEBPACK_IMPORTED_MODULE_61__["MatDividerModule"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_61__["MatDividerModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_list__WEBPACK_IMPORTED_MODULE_62__["MatListModule"], _angular_material_list__WEBPACK_IMPORTED_MODULE_62__["MatListModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_63__["MatProgressBarModule"], _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_63__["MatProgressBarModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatOptionModule"], _angular_material_core__WEBPACK_IMPORTED_MODULE_15__["MatOptionModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_select__WEBPACK_IMPORTED_MODULE_39__["MatSelectModule"], _angular_material_select__WEBPACK_IMPORTED_MODULE_39__["MatSelectModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_64__["MatSidenavModule"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_64__["MatSidenavModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_65__["MatSlideToggleModule"], _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_65__["MatSlideToggleModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["LayoutModule"], _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_28__["LayoutModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__["MatSnackBarModule"], _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_29__["MatSnackBarModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_cdk_table__WEBPACK_IMPORTED_MODULE_66__["CdkTableModule"], _angular_cdk_table__WEBPACK_IMPORTED_MODULE_66__["CdkTableModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_table__WEBPACK_IMPORTED_MODULE_67__["MatTableModule"], _angular_material_table__WEBPACK_IMPORTED_MODULE_67__["MatTableModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_68__["MatToolbarModule"], _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_68__["MatToolbarModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _shared_ec_material_ec_material_module__WEBPACK_IMPORTED_MODULE_69__["EcMaterialModule"], _shared_ec_material_ec_material_module__WEBPACK_IMPORTED_MODULE_69__["EcMaterialModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _shared_shared_module__WEBPACK_IMPORTED_MODULE_70__["SharedModule"], _shared_shared_module__WEBPACK_IMPORTED_MODULE_70__["SharedModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _core_core_module__WEBPACK_IMPORTED_MODULE_71__["CoreModule"], _core_core_module__WEBPACK_IMPORTED_MODULE_71__["CoreModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _app_routing_module__WEBPACK_IMPORTED_MODULE_72__["AppRoutingModule"], _app_routing_module__WEBPACK_IMPORTED_MODULE_72__["AppRoutingModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _bank_accounts_bank_accounts_routing_module__WEBPACK_IMPORTED_MODULE_73__["BankAccountsRoutingModule"], _bank_accounts_bank_accounts_routing_module__WEBPACK_IMPORTED_MODULE_73__["BankAccountsRoutingModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _bank_accounts_bank_accounts_module__WEBPACK_IMPORTED_MODULE_74__["BankAccountsModule"], _bank_accounts_bank_accounts_module__WEBPACK_IMPORTED_MODULE_74__["BankAccountsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _budgets_future_budgets_future_budgets_module__WEBPACK_IMPORTED_MODULE_75__["FutureBudgetsModule"], _budgets_future_budgets_future_budgets_module__WEBPACK_IMPORTED_MODULE_75__["FutureBudgetsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _budgets_budgets_routing_module__WEBPACK_IMPORTED_MODULE_76__["BudgetsRoutingModule"], _budgets_budgets_routing_module__WEBPACK_IMPORTED_MODULE_76__["BudgetsRoutingModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _shared_transactions_shared_transactions_module__WEBPACK_IMPORTED_MODULE_77__["SharedTransactionsModule"], _shared_transactions_shared_transactions_module__WEBPACK_IMPORTED_MODULE_77__["SharedTransactionsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _budgets_budgets_module__WEBPACK_IMPORTED_MODULE_78__["BudgetsModule"], _budgets_budgets_module__WEBPACK_IMPORTED_MODULE_78__["BudgetsModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](512, _app_module__WEBPACK_IMPORTED_MODULE_1__["AppModule"], _app_module__WEBPACK_IMPORTED_MODULE_1__["AppModule"], []), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵmpd"](256, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_64__["MAT_DRAWER_DEFAULT_AUTOSIZE"], false, [])]); });




/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
var AppModule = /*@__PURE__*/ (function () {
    function AppModule() {
    }
    return AppModule;
}());




/***/ }),

/***/ "./src/app/bank-accounts/bank-account.service.ts":
/*!*******************************************************!*\
  !*** ./src/app/bank-accounts/bank-account.service.ts ***!
  \*******************************************************/
/*! exports provided: BankAccountService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BankAccountService", function() { return BankAccountService; });
var BankAccountService = /*@__PURE__*/ (function () {
    function BankAccountService(apiGateway) {
        this.apiGateway = apiGateway;
    }
    BankAccountService.prototype.getBankAccounts = function () {
        return this.apiGateway.get('/bank_accounts');
    };
    BankAccountService.prototype.getSinkFundAllocations = function (bankAccountId) {
        return this.apiGateway.get('/sink_fund_allocations', { bank_account_id: bankAccountId });
    };
    return BankAccountService;
}());




/***/ }),

/***/ "./src/app/bank-accounts/bank-accounts-routing.module.ts":
/*!***************************************************************!*\
  !*** ./src/app/bank-accounts/bank-accounts-routing.module.ts ***!
  \***************************************************************/
/*! exports provided: BankAccountsRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BankAccountsRoutingModule", function() { return BankAccountsRoutingModule; });
var routes = [];
var BankAccountsRoutingModule = /*@__PURE__*/ (function () {
    function BankAccountsRoutingModule() {
    }
    return BankAccountsRoutingModule;
}());




/***/ }),

/***/ "./src/app/bank-accounts/bank-accounts.module.ts":
/*!*******************************************************!*\
  !*** ./src/app/bank-accounts/bank-accounts.module.ts ***!
  \*******************************************************/
/*! exports provided: BankAccountsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BankAccountsModule", function() { return BankAccountsModule; });
var BankAccountsModule = /*@__PURE__*/ (function () {
    function BankAccountsModule() {
    }
    return BankAccountsModule;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ngfactory.js":
/*!**************************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ngfactory.js ***!
  \**************************************************************************************************/
/*! exports provided: RenderType_AllocationCategoryRowComponent, View_AllocationCategoryRowComponent_0, View_AllocationCategoryRowComponent_Host_0, AllocationCategoryRowComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_AllocationCategoryRowComponent", function() { return RenderType_AllocationCategoryRowComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationCategoryRowComponent_0", function() { return View_AllocationCategoryRowComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationCategoryRowComponent_Host_0", function() { return View_AllocationCategoryRowComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationCategoryRowComponentNgFactory", function() { return AllocationCategoryRowComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/form/text-field/text-field.component.ngfactory */ "./src/app/shared/form/text-field/text-field.component.ngfactory.js");
/* harmony import */ var _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/form/text-field/text-field.component */ "./src/app/shared/form/text-field/text-field.component.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component.ngfactory */ "./src/app/shared/form/money-field/money-field.component.ngfactory.js");
/* harmony import */ var _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component */ "./src/app/shared/form/money-field/money-field.component.ts");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _shared_ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../shared/ec-icon/ec-icon.component.ngfactory */ "./src/app/shared/ec-icon/ec-icon.component.ngfactory.js");
/* harmony import */ var _shared_ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../shared/ec-icon/ec-icon.component */ "./src/app/shared/ec-icon/ec-icon.component.ts");
/* harmony import */ var _shared_delete_button_delete_button_component_ngfactory__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../shared/delete-button/delete-button.component.ngfactory */ "./src/app/shared/delete-button/delete-button.component.ngfactory.js");
/* harmony import */ var _shared_delete_button_delete_button_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../shared/delete-button/delete-button.component */ "./src/app/shared/delete-button/delete-button.component.ts");
/* harmony import */ var _allocation_category_row_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./allocation-category-row.component */ "./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ts");
/* harmony import */ var _shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../shared-transactions/shared-transaction.service */ "./src/app/shared-transactions/shared-transaction.service.ts");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm5/dialog.es5.js");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_form_text_field_text_field.component.ngfactory,_.._.._shared_form_text_field_text_field.component,_angular_forms,_.._.._shared_form_money_field_money_field.component.ngfactory,_.._.._shared_form_money_field_money_field.component,_angular_flex_layout,_.._.._shared_ec_icon_ec_icon.component.ngfactory,_.._.._shared_ec_icon_ec_icon.component,_.._.._shared_delete_button_delete_button.component.ngfactory,_.._.._shared_delete_button_delete_button.component,_allocation_category_row.component,_.._.._shared_transactions_shared_transaction.service,_angular_material_dialog PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_form_text_field_text_field.component.ngfactory,_.._.._shared_form_text_field_text_field.component,_angular_forms,_.._.._shared_form_money_field_money_field.component.ngfactory,_.._.._shared_form_money_field_money_field.component,_angular_flex_layout,_.._.._shared_ec_icon_ec_icon.component.ngfactory,_.._.._shared_ec_icon_ec_icon.component,_.._.._shared_delete_button_delete_button.component.ngfactory,_.._.._shared_delete_button_delete_button.component,_allocation_category_row.component,_.._.._shared_transactions_shared_transaction.service,_angular_material_dialog PURE_IMPORTS_END */














var styles_AllocationCategoryRowComponent = ["ec-icon.small[_ngcontent-%COMP%]     .material-icons {\n      font-size: 16px;\n      height: 16px;\n      width: 16px;\n      padding-top: 1px;\n      cursor: pointer;\n    }"];
var RenderType_AllocationCategoryRowComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_AllocationCategoryRowComponent, data: {} });

function View_AllocationCategoryRowComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 8, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, null, 5, "ec-text-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.allocation.name = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_TextFieldComponent_0"], _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_TextFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](4, 4308992, null, 0, _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"], [], { editMode: [0, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 8, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 5, "ec-money-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.allocation.amount = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](14, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"], [], { editMode: [0, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](21, 0, null, null, 17, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](23, 0, null, null, 14, "div", [["fxLayout", "row"], ["fxLayoutAlign", "start center"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](24, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["StyleUtils"]], { layout: [0, "layout"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](25, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutAlignDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["StyleUtils"]], { align: [0, "align"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](27, 0, null, null, 2, "ec-icon", [["class", "small"]], null, [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.showTransactionsFor(_co.allocation) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_EcIconComponent_0"], _shared_ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_EcIconComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](28, 114688, null, 0, _shared_ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_8__["EcIconComponent"], [], { icon: [0, "icon"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](31, 0, null, null, 1, "span", [["fxFlex", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](32, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["FlexDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [3, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["StyleUtils"]], { flex: [0, "flex"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](34, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](36, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](40, 0, null, null, 5, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](42, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](44, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"], [], { highlightPositive: [0, "highlightPositive"], value: [1, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](47, 0, null, null, 8, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](49, 0, null, null, 5, "ec-text-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.allocation.comment = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_TextFieldComponent_0"], _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_TextFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](50, 4308992, null, 0, _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"], [], { editMode: [0, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](52, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](54, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](57, 0, null, null, 4, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](59, 0, null, null, 1, "ec-delete-button", [], null, null, null, _shared_delete_button_delete_button_component_ngfactory__WEBPACK_IMPORTED_MODULE_9__["View_DeleteButtonComponent_0"], _shared_delete_button_delete_button_component_ngfactory__WEBPACK_IMPORTED_MODULE_9__["RenderType_DeleteButtonComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](60, 114688, null, 0, _shared_delete_button_delete_button_component__WEBPACK_IMPORTED_MODULE_10__["DeleteButtonComponent"], [], { item: [0, "item"], editMode: [1, "editMode"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_7 = _co.editMode; _ck(_v, 4, 0, currVal_7); var currVal_8 = _co.allocation.name; _ck(_v, 6, 0, currVal_8); var currVal_16 = _co.editMode; _ck(_v, 14, 0, currVal_16); var currVal_17 = _co.allocation.amount; _ck(_v, 16, 0, currVal_17); var currVal_18 = "row"; _ck(_v, 24, 0, currVal_18); var currVal_19 = "start center"; _ck(_v, 25, 0, currVal_19); var currVal_20 = _co.Icon.SHOW_TRANSACTIONS; _ck(_v, 28, 0, currVal_20); var currVal_21 = ""; _ck(_v, 32, 0, currVal_21); var currVal_22 = _co.allocation.spent; _ck(_v, 36, 0, currVal_22); var currVal_23 = true; var currVal_24 = (_co.allocation.amount - _co.allocation.spent); _ck(_v, 44, 0, currVal_23, currVal_24); var currVal_32 = _co.editMode; _ck(_v, 50, 0, currVal_32); var currVal_33 = _co.allocation.comment; _ck(_v, 52, 0, currVal_33); var currVal_34 = _co.allocation; var currVal_35 = _co.editMode; _ck(_v, 60, 0, currVal_34, currVal_35); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassUntouched; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassTouched; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassPristine; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassDirty; var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassValid; var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassInvalid; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassPending; _ck(_v, 3, 0, currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6); var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassUntouched; var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassTouched; var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassPristine; var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassDirty; var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassValid; var currVal_14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassInvalid; var currVal_15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassPending; _ck(_v, 13, 0, currVal_9, currVal_10, currVal_11, currVal_12, currVal_13, currVal_14, currVal_15); var currVal_25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassUntouched; var currVal_26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassTouched; var currVal_27 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassPristine; var currVal_28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassDirty; var currVal_29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassValid; var currVal_30 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassInvalid; var currVal_31 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 54).ngClassPending; _ck(_v, 49, 0, currVal_25, currVal_26, currVal_27, currVal_28, currVal_29, currVal_30, currVal_31); });
}
function View_AllocationCategoryRowComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-allocation-category-row", ""]], null, null, null, View_AllocationCategoryRowComponent_0, RenderType_AllocationCategoryRowComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _allocation_category_row_component__WEBPACK_IMPORTED_MODULE_11__["AllocationCategoryRowComponent"], [_shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_12__["SharedTransactionService"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_13__["MatDialog"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var AllocationCategoryRowComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-allocation-category-row]", _allocation_category_row_component__WEBPACK_IMPORTED_MODULE_11__["AllocationCategoryRowComponent"], View_AllocationCategoryRowComponent_Host_0, { allocation: "allocation", editMode: "editMode" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ts":
/*!****************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ts ***!
  \****************************************************************************************/
/*! exports provided: AllocationCategoryRowComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationCategoryRowComponent", function() { return AllocationCategoryRowComponent; });
/* harmony import */ var _shared_ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../shared/ec-icon/icon.type */ "./src/app/shared/ec-icon/icon.type.ts");
/* harmony import */ var _shared_transactions_compact_transaction_list_compact_transaction_list_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared-transactions/compact-transaction-list/compact-transaction-list.component */ "./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ts");


var AllocationCategoryRowComponent = /*@__PURE__*/ (function () {
    function AllocationCategoryRowComponent(transactionService, dialog) {
        this.transactionService = transactionService;
        this.dialog = dialog;
        this.Icon = _shared_ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_0__["Icon"];
        this.allocation = {};
        this.editMode = false;
    }
    AllocationCategoryRowComponent.prototype.ngOnInit = function () {
    };
    AllocationCategoryRowComponent.prototype.showTransactionsFor = function (allocation) {
        var _this = this;
        var dialogRef;
        this.transactionService
            .transactionsForAllocation(allocation.id)
            .subscribe(function (transactions) {
            dialogRef = _this.dialog.open(_shared_transactions_compact_transaction_list_compact_transaction_list_component__WEBPACK_IMPORTED_MODULE_1__["CompactTransactionListComponent"], { width: '500px' });
            dialogRef.componentInstance.transactions = transactions;
            dialogRef.componentInstance.itemName = allocation.name;
        });
    };
    return AllocationCategoryRowComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ngfactory.js":
/*!*************************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ngfactory.js ***!
  \*************************************************************************************************/
/*! exports provided: RenderType_AllocationListFooterComponent, View_AllocationListFooterComponent_0, View_AllocationListFooterComponent_Host_0, AllocationListFooterComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_AllocationListFooterComponent", function() { return RenderType_AllocationListFooterComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListFooterComponent_0", function() { return View_AllocationListFooterComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListFooterComponent_Host_0", function() { return View_AllocationListFooterComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListFooterComponentNgFactory", function() { return AllocationListFooterComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _shared_money_pipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/money.pipe */ "./src/app/shared/money.pipe.ts");
/* harmony import */ var _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component.ngfactory */ "./src/app/shared/form/money-field/money-field.component.ngfactory.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component */ "./src/app/shared/form/money-field/money-field.component.ts");
/* harmony import */ var _allocation_list_footer_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./allocation-list-footer.component */ "./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_money.pipe,_.._.._shared_form_money_field_money_field.component.ngfactory,_angular_forms,_.._.._shared_form_money_field_money_field.component,_allocation_list_footer.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_money.pipe,_.._.._shared_form_money_field_money_field.component.ngfactory,_angular_forms,_.._.._shared_form_money_field_money_field.component,_allocation_list_footer.component PURE_IMPORTS_END */






var styles_AllocationListFooterComponent = [".heading[_ngcontent-%COMP%] {\n      font-weight: bold;\n      font-size: 20px;\n    }\n    .total[_ngcontent-%COMP%] {\n      display: flex;\n      justify-content: space-between;\n    }\n    .label[_ngcontent-%COMP%] {\n      border-radius: 5px;\n      border: 2px solid grey;\n      background-color: darkgrey;\n      font-size: 14px;\n      color: white;\n      padding-left: 5px;\n      padding-right: 5px;\n      padding-top: 3px;\n    }"];
var RenderType_AllocationListFooterComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_AllocationListFooterComponent, data: {} });

function View_AllocationListFooterComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _shared_money_pipe__WEBPACK_IMPORTED_MODULE_1__["MoneyPipe"], []), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 36, "tr", [["class", "heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 8, "td", [["class", "total"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, null, 1, "span", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Total"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 2, "span", [["class", "label"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](10, null, ["\n          Unallocated: ", "\n        "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](11, 1), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](14, 0, null, null, 5, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](16, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](21, 0, null, null, 5, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](23, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](25, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](28, 0, null, null, 5, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](30, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_2__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](32, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_4__["MoneyFieldComponent"], [], { highlightPositive: [0, "highlightPositive"], value: [1, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](35, 0, null, null, 0, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](37, 0, null, null, 0, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.totalAmount(); _ck(_v, 18, 0, currVal_1); var currVal_2 = _co.totalSpent(); _ck(_v, 25, 0, currVal_2); var currVal_3 = true; var currVal_4 = _co.totalRemaining(); _ck(_v, 32, 0, currVal_3, currVal_4); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 10, 0, _ck(_v, 11, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 0), _co.totalDiscretionaryAmount())); _ck(_v, 10, 0, currVal_0); }); }
function View_AllocationListFooterComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-allocation-list-footer", ""]], null, null, null, View_AllocationListFooterComponent_0, RenderType_AllocationListFooterComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _allocation_list_footer_component__WEBPACK_IMPORTED_MODULE_5__["AllocationListFooterComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var AllocationListFooterComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-allocation-list-footer]", _allocation_list_footer_component__WEBPACK_IMPORTED_MODULE_5__["AllocationListFooterComponent"], View_AllocationListFooterComponent_Host_0, { budget: "budget" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ts":
/*!***************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ts ***!
  \***************************************************************************************/
/*! exports provided: AllocationListFooterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListFooterComponent", function() { return AllocationListFooterComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/total */ "./src/app/util/total.ts");

var AllocationListFooterComponent = /*@__PURE__*/ (function () {
    function AllocationListFooterComponent() {
        this.budget = { incomes: [], allocations: [] };
    }
    AllocationListFooterComponent.prototype.ngOnInit = function () {
    };
    AllocationListFooterComponent.prototype.totalAmount = function () {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.budget.allocations, 'amount');
    };
    AllocationListFooterComponent.prototype.totalSpent = function () {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.budget.allocations, 'spent');
    };
    AllocationListFooterComponent.prototype.totalRemaining = function () {
        return this.totalAmount() - this.totalSpent();
    };
    AllocationListFooterComponent.prototype.totalDiscretionaryAmount = function () {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.budget.incomes, 'amount') - Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.budget.allocations, 'amount');
    };
    return AllocationListFooterComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ngfactory.js":
/*!*************************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ngfactory.js ***!
  \*************************************************************************************************/
/*! exports provided: RenderType_AllocationListHeaderComponent, View_AllocationListHeaderComponent_0, View_AllocationListHeaderComponent_Host_0, AllocationListHeaderComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_AllocationListHeaderComponent", function() { return RenderType_AllocationListHeaderComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListHeaderComponent_0", function() { return View_AllocationListHeaderComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListHeaderComponent_Host_0", function() { return View_AllocationListHeaderComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListHeaderComponentNgFactory", function() { return AllocationListHeaderComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _allocation_list_header_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./allocation-list-header.component */ "./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_allocation_list_header.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_allocation_list_header.component PURE_IMPORTS_END */


var styles_AllocationListHeaderComponent = [];
var RenderType_AllocationListHeaderComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_AllocationListHeaderComponent, data: {} });

function View_AllocationListHeaderComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 23, "tr", [["class", "heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, null, 1, "th", [["style", "width:25%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Name"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, null, 1, "th", [["class", "right"], ["style", "width:15%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Amount"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 1, "th", [["class", "right"], ["style", "width:15%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Spent"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 1, "th", [["class", "right"], ["style", "width:15%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Remaining"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, null, 6, "th", [["class", "hidden-xs"], ["style", "width:25%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](17, 0, null, null, 1, "span", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, [" Comment "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](23, 0, null, null, 0, "th", [["style", "width:5%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], null, null); }
function View_AllocationListHeaderComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-allocation-list-header", ""]], null, null, null, View_AllocationListHeaderComponent_0, RenderType_AllocationListHeaderComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _allocation_list_header_component__WEBPACK_IMPORTED_MODULE_1__["AllocationListHeaderComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var AllocationListHeaderComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-allocation-list-header]", _allocation_list_header_component__WEBPACK_IMPORTED_MODULE_1__["AllocationListHeaderComponent"], View_AllocationListHeaderComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ts":
/*!***************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ts ***!
  \***************************************************************************************/
/*! exports provided: AllocationListHeaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListHeaderComponent", function() { return AllocationListHeaderComponent; });
var AllocationListHeaderComponent = /*@__PURE__*/ (function () {
    function AllocationListHeaderComponent() {
    }
    AllocationListHeaderComponent.prototype.ngOnInit = function () {
    };
    return AllocationListHeaderComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ngfactory.js":
/*!**************************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ngfactory.js ***!
  \**************************************************************************************************/
/*! exports provided: RenderType_AllocationListSummaryComponent, View_AllocationListSummaryComponent_0, View_AllocationListSummaryComponent_Host_0, AllocationListSummaryComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_AllocationListSummaryComponent", function() { return RenderType_AllocationListSummaryComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListSummaryComponent_0", function() { return View_AllocationListSummaryComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListSummaryComponent_Host_0", function() { return View_AllocationListSummaryComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListSummaryComponentNgFactory", function() { return AllocationListSummaryComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _shared_money_pipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/money.pipe */ "./src/app/shared/money.pipe.ts");
/* harmony import */ var _allocation_list_summary_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./allocation-list-summary.component */ "./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ts");
/* harmony import */ var _shared_settings_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/settings.service */ "./src/app/shared/settings.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_money.pipe,_allocation_list_summary.component,_.._.._shared_settings.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_money.pipe,_allocation_list_summary.component,_.._.._shared_settings.service PURE_IMPORTS_END */




var styles_AllocationListSummaryComponent = [".highlight[_ngcontent-%COMP%] {\n      font-weight: bold;\n      font-size: 14px;\n    }"];
var RenderType_AllocationListSummaryComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_AllocationListSummaryComponent, data: {} });

function View_AllocationListSummaryComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _shared_money_pipe__WEBPACK_IMPORTED_MODULE_1__["MoneyPipe"], []), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 1, "h1", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Summary"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](5, 0, null, null, 34, "table", [["class", "table"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 31, "tbody", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 8, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 1, "td", [["class", "right highlight"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Total Discretionary Amount"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](14, 0, null, null, 2, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](15, null, ["", ""])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](16, 1), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](19, 0, null, null, 8, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](21, 0, null, null, 1, "td", [["class", "right highlight"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](22, null, [" ", "'s Amount"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](24, 0, null, null, 2, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](25, null, ["", ""])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](26, 1), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](29, 0, null, null, 8, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](31, 0, null, null, 1, "td", [["class", "right highlight"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](32, null, [" ", "'s Amount"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](34, 0, null, null, 2, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](35, null, ["", ""])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](36, 1), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 15, 0, _ck(_v, 16, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 0), _co.totalDiscretionaryAmount())); _ck(_v, 15, 0, currVal_0); var currVal_1 = _co.wife; _ck(_v, 22, 0, currVal_1); var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 25, 0, _ck(_v, 26, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 0), (_co.totalDiscretionaryAmount() / 2))); _ck(_v, 25, 0, currVal_2); var currVal_3 = _co.husband; _ck(_v, 32, 0, currVal_3); var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 35, 0, _ck(_v, 36, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 0), (_co.totalDiscretionaryAmount() / 2))); _ck(_v, 35, 0, currVal_4); }); }
function View_AllocationListSummaryComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-allocation-list-summary", [], null, null, null, View_AllocationListSummaryComponent_0, RenderType_AllocationListSummaryComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _allocation_list_summary_component__WEBPACK_IMPORTED_MODULE_2__["AllocationListSummaryComponent"], [_shared_settings_service__WEBPACK_IMPORTED_MODULE_3__["SettingsService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var AllocationListSummaryComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-allocation-list-summary", _allocation_list_summary_component__WEBPACK_IMPORTED_MODULE_2__["AllocationListSummaryComponent"], View_AllocationListSummaryComponent_Host_0, { budget: "budget" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ts":
/*!****************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ts ***!
  \****************************************************************************************/
/*! exports provided: AllocationListSummaryComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListSummaryComponent", function() { return AllocationListSummaryComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/total */ "./src/app/util/total.ts");

var AllocationListSummaryComponent = /*@__PURE__*/ (function () {
    function AllocationListSummaryComponent(settingsService) {
        this.settingsService = settingsService;
        this.budget = { incomes: [], allocations: [] };
        this.wife = 'Wife';
        this.husband = 'Husband';
    }
    AllocationListSummaryComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.settingsService.getSettings().subscribe(function (settings) {
            _this.wife = settings.wife;
            _this.husband = settings.husband;
        });
    };
    AllocationListSummaryComponent.prototype.totalDiscretionaryAmount = function () {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.budget.incomes, 'amount') - Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.budget.allocations, 'amount');
    };
    return AllocationListSummaryComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list.component.ngfactory.js":
/*!******************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list.component.ngfactory.js ***!
  \******************************************************************************************/
/*! exports provided: RenderType_AllocationListComponent, View_AllocationListComponent_0, View_AllocationListComponent_Host_0, AllocationListComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_AllocationListComponent", function() { return RenderType_AllocationListComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListComponent_0", function() { return View_AllocationListComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_AllocationListComponent_Host_0", function() { return View_AllocationListComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListComponentNgFactory", function() { return AllocationListComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _allocation_category_row_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./allocation-category-row.component.ngfactory */ "./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ngfactory.js");
/* harmony import */ var _shared_highlight_deleted_directive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/highlight-deleted.directive */ "./src/app/shared/highlight-deleted.directive.ts");
/* harmony import */ var _allocation_category_row_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./allocation-category-row.component */ "./src/app/budgets/budget-editor/allocations/allocation-category-row.component.ts");
/* harmony import */ var _shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared-transactions/shared-transaction.service */ "./src/app/shared-transactions/shared-transaction.service.ts");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm5/dialog.es5.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component.ngfactory */ "./src/app/shared/form/money-field/money-field.component.ngfactory.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component */ "./src/app/shared/form/money-field/money-field.component.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _allocation_list_header_component_ngfactory__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./allocation-list-header.component.ngfactory */ "./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ngfactory.js");
/* harmony import */ var _allocation_list_header_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./allocation-list-header.component */ "./src/app/budgets/budget-editor/allocations/allocation-list-header.component.ts");
/* harmony import */ var _allocation_list_footer_component_ngfactory__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./allocation-list-footer.component.ngfactory */ "./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ngfactory.js");
/* harmony import */ var _allocation_list_footer_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./allocation-list-footer.component */ "./src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ts");
/* harmony import */ var _allocation_list_summary_component_ngfactory__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./allocation-list-summary.component.ngfactory */ "./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ngfactory.js");
/* harmony import */ var _allocation_list_summary_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./allocation-list-summary.component */ "./src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ts");
/* harmony import */ var _shared_settings_service__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../shared/settings.service */ "./src/app/shared/settings.service.ts");
/* harmony import */ var _allocation_list_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./allocation-list.component */ "./src/app/budgets/budget-editor/allocations/allocation-list.component.ts");
/* harmony import */ var _budget_service__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../budget.service */ "./src/app/budgets/budget.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_allocation_category_row.component.ngfactory,_.._.._shared_highlight_deleted.directive,_allocation_category_row.component,_.._.._shared_transactions_shared_transaction.service,_angular_material_dialog,_.._.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_.._.._shared_form_money_field_money_field.component.ngfactory,_angular_forms,_.._.._shared_form_money_field_money_field.component,_angular_common,_allocation_list_header.component.ngfactory,_allocation_list_header.component,_allocation_list_footer.component.ngfactory,_allocation_list_footer.component,_allocation_list_summary.component.ngfactory,_allocation_list_summary.component,_.._.._shared_settings.service,_allocation_list.component,_.._budget.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_allocation_category_row.component.ngfactory,_.._.._shared_highlight_deleted.directive,_allocation_category_row.component,_.._.._shared_transactions_shared_transaction.service,_angular_material_dialog,_.._.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_.._.._shared_form_money_field_money_field.component.ngfactory,_angular_forms,_.._.._shared_form_money_field_money_field.component,_angular_common,_allocation_list_header.component.ngfactory,_allocation_list_header.component,_allocation_list_footer.component.ngfactory,_allocation_list_footer.component,_allocation_list_summary.component.ngfactory,_allocation_list_summary.component,_.._.._shared_settings.service,_allocation_list.component,_.._budget.service PURE_IMPORTS_END */























var styles_AllocationListComponent = [".heading[_ngcontent-%COMP%] {\n      font-weight: bold;\n      font-size: 16px;\n      border-top: 3px solid blue;\n      border-bottom: 2px solid blue;\n    }\n    .footer[_ngcontent-%COMP%] {\n      font-weight: bold;\n      font-size: 18px;\n      border-top: 2px solid grey;\n      border-bottom: 2px solid grey;\n    }\n    .category-button[_ngcontent-%COMP%] {\n      margin: 5px;\n    }"];
var RenderType_AllocationListComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_AllocationListComponent, data: {} });

function View_AllocationListComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 3, "tr", [["ec-allocation-category-row", ""]], [[2, "deleted", null], [2, "unpaid", null], [2, "deactivated", null]], null, null, _allocation_category_row_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_AllocationCategoryRowComponent_0"], _allocation_category_row_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_AllocationCategoryRowComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 16384, null, 0, _shared_highlight_deleted_directive__WEBPACK_IMPORTED_MODULE_2__["HighlightDeletedDirective"], [], { item: [0, "item"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 114688, null, 0, _allocation_category_row_component__WEBPACK_IMPORTED_MODULE_3__["AllocationCategoryRowComponent"], [_shared_transactions_shared_transaction_service__WEBPACK_IMPORTED_MODULE_4__["SharedTransactionService"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_5__["MatDialog"]], { allocation: [0, "allocation"], editMode: [1, "editMode"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "]))], function (_ck, _v) { var _co = _v.component; var currVal_3 = _v.context.$implicit; _ck(_v, 1, 0, currVal_3); var currVal_4 = _v.context.$implicit; var currVal_5 = _co.editMode; _ck(_v, 2, 0, currVal_4, currVal_5); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).isDeleted; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).isUnpaid; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).isDeactivated; _ck(_v, 0, 0, currVal_0, currVal_1, currVal_2); }); }
function View_AllocationListComponent_3(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 5, "div", [["class", "category-button"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 2, "button", [["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.addAllocation(_v.parent.context.$implicit) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_6__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_6__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_7__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_8__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_9__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](4, 0, ["\n                  Add ", " Allocation\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "]))], function (_ck, _v) { var currVal_1 = "primary"; _ck(_v, 3, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).disabled || null); _ck(_v, 2, 0, currVal_0); var currVal_2 = _v.parent.context.$implicit.name; _ck(_v, 4, 0, currVal_2); });
}
function View_AllocationListComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 38, null, null, null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 23, "tr", [["class", "heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 1, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](5, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 3, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_11__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](10, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 3, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_11__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](15, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](17, 0, null, null, 3, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](18, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_11__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](20, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_12__["MoneyFieldComponent"], [], { highlightPositive: [0, "highlightPositive"], value: [1, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](22, 0, null, null, 0, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](24, 0, null, null, 0, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_AllocationListComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](28, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](30, 0, null, null, 7, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](32, 0, null, null, 4, "td", [["colspan", "5"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_AllocationListComponent_3)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](35, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.totalAmountFor(_v.context.$implicit); _ck(_v, 10, 0, currVal_1); var currVal_2 = _co.totalSpentFor(_v.context.$implicit); _ck(_v, 15, 0, currVal_2); var currVal_3 = true; var currVal_4 = _co.totalRemainingFor(_v.context.$implicit); _ck(_v, 20, 0, currVal_3, currVal_4); var currVal_5 = _v.context.$implicit.allocations; var currVal_6 = _co.trackAllocation; _ck(_v, 28, 0, currVal_5, currVal_6); var currVal_7 = _co.editMode; _ck(_v, 35, 0, currVal_7); }, function (_ck, _v) { var currVal_0 = _v.context.$implicit.name; _ck(_v, 5, 0, currVal_0); }); }
function View_AllocationListComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 1, "h1", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Allocations"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 14, "table", [["class", "table"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, null, 2, "thead", [["ec-allocation-list-header", ""]], null, null, null, _allocation_list_header_component_ngfactory__WEBPACK_IMPORTED_MODULE_14__["View_AllocationListHeaderComponent_0"], _allocation_list_header_component_ngfactory__WEBPACK_IMPORTED_MODULE_14__["RenderType_AllocationListHeaderComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](7, 114688, null, 0, _allocation_list_header_component__WEBPACK_IMPORTED_MODULE_15__["AllocationListHeaderComponent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, null, null, 4, "tbody", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_AllocationListComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](16, 0, null, null, 1, "tfoot", [["ec-allocation-list-footer", ""]], null, null, null, _allocation_list_footer_component_ngfactory__WEBPACK_IMPORTED_MODULE_16__["View_AllocationListFooterComponent_0"], _allocation_list_footer_component_ngfactory__WEBPACK_IMPORTED_MODULE_16__["RenderType_AllocationListFooterComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](17, 114688, null, 0, _allocation_list_footer_component__WEBPACK_IMPORTED_MODULE_17__["AllocationListFooterComponent"], [], { budget: [0, "budget"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 2, "ec-allocation-list-summary", [], null, null, null, _allocation_list_summary_component_ngfactory__WEBPACK_IMPORTED_MODULE_18__["View_AllocationListSummaryComponent_0"], _allocation_list_summary_component_ngfactory__WEBPACK_IMPORTED_MODULE_18__["RenderType_AllocationListSummaryComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](21, 114688, null, 0, _allocation_list_summary_component__WEBPACK_IMPORTED_MODULE_19__["AllocationListSummaryComponent"], [_shared_settings_service__WEBPACK_IMPORTED_MODULE_20__["SettingsService"]], { budget: [0, "budget"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; _ck(_v, 7, 0); var currVal_0 = _co.allocationsByCategory; var currVal_1 = _co.trackCategory; _ck(_v, 13, 0, currVal_0, currVal_1); var currVal_2 = _co.budget; _ck(_v, 17, 0, currVal_2); var currVal_3 = _co.budget; _ck(_v, 21, 0, currVal_3); }, null); }
function View_AllocationListComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-allocation-list", [], null, null, null, View_AllocationListComponent_0, RenderType_AllocationListComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _allocation_list_component__WEBPACK_IMPORTED_MODULE_21__["AllocationListComponent"], [_budget_service__WEBPACK_IMPORTED_MODULE_22__["BudgetService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var AllocationListComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-allocation-list", _allocation_list_component__WEBPACK_IMPORTED_MODULE_21__["AllocationListComponent"], View_AllocationListComponent_Host_0, { editMode: "editMode", budget: "budget" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/allocations/allocation-list.component.ts":
/*!********************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/allocations/allocation-list.component.ts ***!
  \********************************************************************************/
/*! exports provided: AllocationListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AllocationListComponent", function() { return AllocationListComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/total */ "./src/app/util/total.ts");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);


var AllocationListComponent = /*@__PURE__*/ (function () {
    function AllocationListComponent(budgetService) {
        this.budgetService = budgetService;
        this.editMode = false;
        this._budget = { allocations: [], incomes: [] };
        this._allocationCategories = [];
    }
    Object.defineProperty(AllocationListComponent.prototype, "budget", {
        get: function () {
            return this._budget;
        },
        set: function (newBudget) {
            this._budget = newBudget;
            this.updateGroupings();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AllocationListComponent.prototype, "allocationCategories", {
        get: function () {
            return this._allocationCategories;
        },
        set: function (newCategories) {
            this._allocationCategories = newCategories;
            this.updateGroupings();
        },
        enumerable: true,
        configurable: true
    });
    AllocationListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.budgetService
            .getAllocationCategories()
            .subscribe(function (categories) { return _this.allocationCategories = categories; });
    };
    AllocationListComponent.prototype.trackCategory = function (index, category) {
        if (!category) {
            return 10;
        }
        return category.id;
    };
    AllocationListComponent.prototype.trackAllocation = function (index, allocation) {
        if (!allocation) {
            return 11;
        }
        return allocation.id;
    };
    AllocationListComponent.prototype.updateGroupings = function () {
        var groupedCategories = Object(lodash__WEBPACK_IMPORTED_MODULE_1__["groupBy"])(this.budget.allocations, 'allocation_category_id');
        this.allocationsByCategory = this.allocationCategories.map(function (category) {
            return {
                id: category.id,
                name: category.name,
                allocations: groupedCategories[category.id] || []
            };
        });
    };
    AllocationListComponent.prototype.addAllocation = function (category) {
        var newAllocation = {
            id: null,
            name: '',
            amount: 0,
            spent: 0,
            budget_id: this.budget.id,
            allocation_category_id: category.id,
        };
        this.budget.allocations.push(newAllocation);
        category.allocations.push(newAllocation);
    };
    AllocationListComponent.prototype.totalAmountFor = function (category) {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(category.allocations, 'amount');
    };
    AllocationListComponent.prototype.totalSpentFor = function (category) {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(category.allocations, 'spent');
    };
    AllocationListComponent.prototype.totalRemainingFor = function (category) {
        return this.totalAmountFor(category) - this.totalSpentFor(category);
    };
    return AllocationListComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/budget-editor.component.ngfactory.js":
/*!****************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/budget-editor.component.ngfactory.js ***!
  \****************************************************************************/
/*! exports provided: RenderType_BudgetEditorComponent, View_BudgetEditorComponent_0, View_BudgetEditorComponent_Host_0, BudgetEditorComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_BudgetEditorComponent", function() { return RenderType_BudgetEditorComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetEditorComponent_0", function() { return View_BudgetEditorComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetEditorComponent_Host_0", function() { return View_BudgetEditorComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetEditorComponentNgFactory", function() { return BudgetEditorComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _incomes_income_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./incomes/income-list.component.ngfactory */ "./src/app/budgets/budget-editor/incomes/income-list.component.ngfactory.js");
/* harmony import */ var _incomes_income_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./incomes/income-list.component */ "./src/app/budgets/budget-editor/incomes/income-list.component.ts");
/* harmony import */ var _bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../bank-accounts/bank-account.service */ "./src/app/bank-accounts/bank-account.service.ts");
/* harmony import */ var _allocations_allocation_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./allocations/allocation-list.component.ngfactory */ "./src/app/budgets/budget-editor/allocations/allocation-list.component.ngfactory.js");
/* harmony import */ var _allocations_allocation_list_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./allocations/allocation-list.component */ "./src/app/budgets/budget-editor/allocations/allocation-list.component.ts");
/* harmony import */ var _budget_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../budget.service */ "./src/app/budgets/budget.service.ts");
/* harmony import */ var _budget_editor_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./budget-editor.component */ "./src/app/budgets/budget-editor/budget-editor.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_incomes_income_list.component.ngfactory,_incomes_income_list.component,_.._bank_accounts_bank_account.service,_allocations_allocation_list.component.ngfactory,_allocations_allocation_list.component,_budget.service,_budget_editor.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_incomes_income_list.component.ngfactory,_incomes_income_list.component,_.._bank_accounts_bank_account.service,_allocations_allocation_list.component.ngfactory,_allocations_allocation_list.component,_budget.service,_budget_editor.component PURE_IMPORTS_END */










var styles_BudgetEditorComponent = [];
var RenderType_BudgetEditorComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_BudgetEditorComponent, data: {} });

function View_BudgetEditorComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 12, "mat-card", [["class", "mat-card"]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCard"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, 0, 8, "mat-card-content", [["class", "mat-card-content"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 1, "ec-income-list", [], null, null, null, _incomes_income_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_IncomeListComponent_0"], _incomes_income_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_IncomeListComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 114688, null, 0, _incomes_income_list_component__WEBPACK_IMPORTED_MODULE_4__["IncomeListComponent"], [_bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_5__["BankAccountService"]], { budget: [0, "budget"], editMode: [1, "editMode"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, null, null, 1, "ec-allocation-list", [], null, null, null, _allocations_allocation_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["View_AllocationListComponent_0"], _allocations_allocation_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["RenderType_AllocationListComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 114688, null, 0, _allocations_allocation_list_component__WEBPACK_IMPORTED_MODULE_7__["AllocationListComponent"], [_budget_service__WEBPACK_IMPORTED_MODULE_8__["BudgetService"]], { editMode: [0, "editMode"], budget: [1, "budget"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.budget; var currVal_1 = _co.editMode; _ck(_v, 8, 0, currVal_0, currVal_1); var currVal_2 = _co.editMode; var currVal_3 = _co.budget; _ck(_v, 11, 0, currVal_2, currVal_3); }, null); }
function View_BudgetEditorComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-budget-editor", [], null, null, null, View_BudgetEditorComponent_0, RenderType_BudgetEditorComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _budget_editor_component__WEBPACK_IMPORTED_MODULE_9__["BudgetEditorComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var BudgetEditorComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-budget-editor", _budget_editor_component__WEBPACK_IMPORTED_MODULE_9__["BudgetEditorComponent"], View_BudgetEditorComponent_Host_0, { budget: "budget", editMode: "editMode" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/budget-editor.component.ts":
/*!******************************************************************!*\
  !*** ./src/app/budgets/budget-editor/budget-editor.component.ts ***!
  \******************************************************************/
/*! exports provided: BudgetEditorComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetEditorComponent", function() { return BudgetEditorComponent; });
var BudgetEditorComponent = /*@__PURE__*/ (function () {
    function BudgetEditorComponent() {
        this.budget = { incomes: [], allocations: [] };
        this.editMode = false;
    }
    BudgetEditorComponent.prototype.ngOnInit = function () {
    };
    return BudgetEditorComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list-footer.component.ngfactory.js":
/*!*****************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list-footer.component.ngfactory.js ***!
  \*****************************************************************************************/
/*! exports provided: RenderType_IncomeListFooterComponent, View_IncomeListFooterComponent_0, View_IncomeListFooterComponent_Host_0, IncomeListFooterComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_IncomeListFooterComponent", function() { return RenderType_IncomeListFooterComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListFooterComponent_0", function() { return View_IncomeListFooterComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListFooterComponent_Host_0", function() { return View_IncomeListFooterComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListFooterComponentNgFactory", function() { return IncomeListFooterComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _shared_money_pipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/money.pipe */ "./src/app/shared/money.pipe.ts");
/* harmony import */ var _income_list_footer_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./income-list-footer.component */ "./src/app/budgets/budget-editor/incomes/income-list-footer.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_money.pipe,_income_list_footer.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_money.pipe,_income_list_footer.component PURE_IMPORTS_END */



var styles_IncomeListFooterComponent = [];
var RenderType_IncomeListFooterComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_IncomeListFooterComponent, data: {} });

function View_IncomeListFooterComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _shared_money_pipe__WEBPACK_IMPORTED_MODULE_1__["MoneyPipe"], []), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 14, "tr", [["class", "total"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Total"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 2, "th", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](8, null, ["", ""])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](9, 1), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 0, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 0, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, null, 0, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 8, 0, _ck(_v, 9, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 0), _co.incomeTotal())); _ck(_v, 8, 0, currVal_0); }); }
function View_IncomeListFooterComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-income-list-footer", ""]], null, null, null, View_IncomeListFooterComponent_0, RenderType_IncomeListFooterComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _income_list_footer_component__WEBPACK_IMPORTED_MODULE_2__["IncomeListFooterComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var IncomeListFooterComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-income-list-footer]", _income_list_footer_component__WEBPACK_IMPORTED_MODULE_2__["IncomeListFooterComponent"], View_IncomeListFooterComponent_Host_0, { incomes: "incomes" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list-footer.component.ts":
/*!*******************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list-footer.component.ts ***!
  \*******************************************************************************/
/*! exports provided: IncomeListFooterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListFooterComponent", function() { return IncomeListFooterComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/total */ "./src/app/util/total.ts");

var IncomeListFooterComponent = /*@__PURE__*/ (function () {
    function IncomeListFooterComponent() {
    }
    IncomeListFooterComponent.prototype.ngOnInit = function () {
    };
    IncomeListFooterComponent.prototype.incomeTotal = function () {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.incomes, 'amount');
    };
    return IncomeListFooterComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list-header.component.ngfactory.js":
/*!*****************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list-header.component.ngfactory.js ***!
  \*****************************************************************************************/
/*! exports provided: RenderType_IncomeListHeaderComponent, View_IncomeListHeaderComponent_0, View_IncomeListHeaderComponent_Host_0, IncomeListHeaderComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_IncomeListHeaderComponent", function() { return RenderType_IncomeListHeaderComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListHeaderComponent_0", function() { return View_IncomeListHeaderComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListHeaderComponent_Host_0", function() { return View_IncomeListHeaderComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListHeaderComponentNgFactory", function() { return IncomeListHeaderComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _income_list_header_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./income-list-header.component */ "./src/app/budgets/budget-editor/incomes/income-list-header.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_income_list_header.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_income_list_header.component PURE_IMPORTS_END */


var styles_IncomeListHeaderComponent = [];
var RenderType_IncomeListHeaderComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_IncomeListHeaderComponent, data: {} });

function View_IncomeListHeaderComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 15, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, null, 1, "th", [["style", "width:25%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Name"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, null, 1, "th", [["class", "text-right"], ["style", "width:15%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Amount"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 1, "th", [["style", "width:15%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Bank Account"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 1, "th", [["style", "width:40%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Comment"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, null, 0, "th", [["style", "width:5%;"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], null, null); }
function View_IncomeListHeaderComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-income-list-header", ""]], null, null, null, View_IncomeListHeaderComponent_0, RenderType_IncomeListHeaderComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _income_list_header_component__WEBPACK_IMPORTED_MODULE_1__["IncomeListHeaderComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var IncomeListHeaderComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-income-list-header]", _income_list_header_component__WEBPACK_IMPORTED_MODULE_1__["IncomeListHeaderComponent"], View_IncomeListHeaderComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list-header.component.ts":
/*!*******************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list-header.component.ts ***!
  \*******************************************************************************/
/*! exports provided: IncomeListHeaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListHeaderComponent", function() { return IncomeListHeaderComponent; });
var IncomeListHeaderComponent = /*@__PURE__*/ (function () {
    function IncomeListHeaderComponent() {
    }
    IncomeListHeaderComponent.prototype.ngOnInit = function () {
    };
    return IncomeListHeaderComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list-row.component.ngfactory.js":
/*!**************************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list-row.component.ngfactory.js ***!
  \**************************************************************************************/
/*! exports provided: RenderType_IncomeListRowComponent, View_IncomeListRowComponent_0, View_IncomeListRowComponent_Host_0, IncomeListRowComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_IncomeListRowComponent", function() { return RenderType_IncomeListRowComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListRowComponent_0", function() { return View_IncomeListRowComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListRowComponent_Host_0", function() { return View_IncomeListRowComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListRowComponentNgFactory", function() { return IncomeListRowComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../shared/form/text-field/text-field.component.ngfactory */ "./src/app/shared/form/text-field/text-field.component.ngfactory.js");
/* harmony import */ var _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/form/text-field/text-field.component */ "./src/app/shared/form/text-field/text-field.component.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component.ngfactory */ "./src/app/shared/form/money-field/money-field.component.ngfactory.js");
/* harmony import */ var _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../shared/form/money-field/money-field.component */ "./src/app/shared/form/money-field/money-field.component.ts");
/* harmony import */ var _shared_form_list_field_list_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../shared/form/list-field/list-field.component.ngfactory */ "./src/app/shared/form/list-field/list-field.component.ngfactory.js");
/* harmony import */ var _shared_form_list_field_list_field_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../shared/form/list-field/list-field.component */ "./src/app/shared/form/list-field/list-field.component.ts");
/* harmony import */ var _shared_delete_button_delete_button_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../shared/delete-button/delete-button.component.ngfactory */ "./src/app/shared/delete-button/delete-button.component.ngfactory.js");
/* harmony import */ var _shared_delete_button_delete_button_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../shared/delete-button/delete-button.component */ "./src/app/shared/delete-button/delete-button.component.ts");
/* harmony import */ var _income_list_row_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./income-list-row.component */ "./src/app/budgets/budget-editor/incomes/income-list-row.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_form_text_field_text_field.component.ngfactory,_.._.._shared_form_text_field_text_field.component,_angular_forms,_.._.._shared_form_money_field_money_field.component.ngfactory,_.._.._shared_form_money_field_money_field.component,_.._.._shared_form_list_field_list_field.component.ngfactory,_.._.._shared_form_list_field_list_field.component,_.._.._shared_delete_button_delete_button.component.ngfactory,_.._.._shared_delete_button_delete_button.component,_income_list_row.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._shared_form_text_field_text_field.component.ngfactory,_.._.._shared_form_text_field_text_field.component,_angular_forms,_.._.._shared_form_money_field_money_field.component.ngfactory,_.._.._shared_form_money_field_money_field.component,_.._.._shared_form_list_field_list_field.component.ngfactory,_.._.._shared_form_list_field_list_field.component,_.._.._shared_delete_button_delete_button.component.ngfactory,_.._.._shared_delete_button_delete_button.component,_income_list_row.component PURE_IMPORTS_END */











var styles_IncomeListRowComponent = [];
var RenderType_IncomeListRowComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_IncomeListRowComponent, data: {} });

function View_IncomeListRowComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 8, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, null, 5, "ec-text-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.income.name = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_TextFieldComponent_0"], _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_TextFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](4, 4308992, null, 0, _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"], [], { editMode: [0, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 8, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 5, "ec-money-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.income.amount = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](14, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"], [], { editMode: [0, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_5__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](21, 0, null, null, 9, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](23, 0, null, null, 6, "ec-list-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.income.bank_account_id = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_list_field_list_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["View_ListFieldComponent_0"], _shared_form_list_field_list_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["RenderType_ListFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](24, 114688, null, 0, _shared_form_list_field_list_field_component__WEBPACK_IMPORTED_MODULE_7__["ListFieldComponent"], [], { items: [0, "items"], editMode: [1, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_list_field_list_field_component__WEBPACK_IMPORTED_MODULE_7__["ListFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](28, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](32, 0, null, null, 8, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](34, 0, null, null, 5, "ec-text-field", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngModelChange"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("ngModelChange" === en)) {
                var pd_0 = ((_co.income.comment = $event) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_TextFieldComponent_0"], _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_TextFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](35, 4308992, null, 0, _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"], [], { editMode: [0, "editMode"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_2__["TextFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](37, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], [[8, null], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NG_VALUE_ACCESSOR"]]], { model: [0, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](39, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](42, 0, null, null, 4, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](44, 0, null, null, 1, "ec-delete-button", [], null, null, null, _shared_delete_button_delete_button_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["View_DeleteButtonComponent_0"], _shared_delete_button_delete_button_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["RenderType_DeleteButtonComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](45, 114688, null, 0, _shared_delete_button_delete_button_component__WEBPACK_IMPORTED_MODULE_9__["DeleteButtonComponent"], [], { item: [0, "item"], editMode: [1, "editMode"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_7 = _co.editMode; _ck(_v, 4, 0, currVal_7); var currVal_8 = _co.income.name; _ck(_v, 6, 0, currVal_8); var currVal_16 = _co.editMode; _ck(_v, 14, 0, currVal_16); var currVal_17 = _co.income.amount; _ck(_v, 16, 0, currVal_17); var currVal_25 = _co.bankAccounts; var currVal_26 = _co.editMode; _ck(_v, 24, 0, currVal_25, currVal_26); var currVal_27 = _co.income.bank_account_id; _ck(_v, 26, 0, currVal_27); var currVal_35 = _co.editMode; _ck(_v, 35, 0, currVal_35); var currVal_36 = _co.income.comment; _ck(_v, 37, 0, currVal_36); var currVal_37 = _co.income; var currVal_38 = _co.editMode; _ck(_v, 45, 0, currVal_37, currVal_38); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassUntouched; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassTouched; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassPristine; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassDirty; var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassValid; var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassInvalid; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8).ngClassPending; _ck(_v, 3, 0, currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6); var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassUntouched; var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassTouched; var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassPristine; var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassDirty; var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassValid; var currVal_14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassInvalid; var currVal_15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 18).ngClassPending; _ck(_v, 13, 0, currVal_9, currVal_10, currVal_11, currVal_12, currVal_13, currVal_14, currVal_15); var currVal_18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassUntouched; var currVal_19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassTouched; var currVal_20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassPristine; var currVal_21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassDirty; var currVal_22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassValid; var currVal_23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassInvalid; var currVal_24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 28).ngClassPending; _ck(_v, 23, 0, currVal_18, currVal_19, currVal_20, currVal_21, currVal_22, currVal_23, currVal_24); var currVal_28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassUntouched; var currVal_29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassTouched; var currVal_30 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassPristine; var currVal_31 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassDirty; var currVal_32 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassValid; var currVal_33 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassInvalid; var currVal_34 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 39).ngClassPending; _ck(_v, 34, 0, currVal_28, currVal_29, currVal_30, currVal_31, currVal_32, currVal_33, currVal_34); });
}
function View_IncomeListRowComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-income-list-row", ""]], null, null, null, View_IncomeListRowComponent_0, RenderType_IncomeListRowComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _income_list_row_component__WEBPACK_IMPORTED_MODULE_10__["IncomeListRowComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var IncomeListRowComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-income-list-row]", _income_list_row_component__WEBPACK_IMPORTED_MODULE_10__["IncomeListRowComponent"], View_IncomeListRowComponent_Host_0, { income: "income", editMode: "editMode", bankAccounts: "bankAccounts" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list-row.component.ts":
/*!****************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list-row.component.ts ***!
  \****************************************************************************/
/*! exports provided: IncomeListRowComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListRowComponent", function() { return IncomeListRowComponent; });
var IncomeListRowComponent = /*@__PURE__*/ (function () {
    function IncomeListRowComponent() {
        this.income = {};
        this.bankAccounts = [];
    }
    IncomeListRowComponent.prototype.ngOnInit = function () {
    };
    return IncomeListRowComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list.component.ngfactory.js":
/*!**********************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list.component.ngfactory.js ***!
  \**********************************************************************************/
/*! exports provided: RenderType_IncomeListComponent, View_IncomeListComponent_0, View_IncomeListComponent_Host_0, IncomeListComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_IncomeListComponent", function() { return RenderType_IncomeListComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListComponent_0", function() { return View_IncomeListComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_IncomeListComponent_Host_0", function() { return View_IncomeListComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListComponentNgFactory", function() { return IncomeListComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _income_list_row_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./income-list-row.component.ngfactory */ "./src/app/budgets/budget-editor/incomes/income-list-row.component.ngfactory.js");
/* harmony import */ var _shared_highlight_deleted_directive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/highlight-deleted.directive */ "./src/app/shared/highlight-deleted.directive.ts");
/* harmony import */ var _income_list_row_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./income-list-row.component */ "./src/app/budgets/budget-editor/incomes/income-list-row.component.ts");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _income_list_header_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./income-list-header.component.ngfactory */ "./src/app/budgets/budget-editor/incomes/income-list-header.component.ngfactory.js");
/* harmony import */ var _income_list_header_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./income-list-header.component */ "./src/app/budgets/budget-editor/incomes/income-list-header.component.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _income_list_footer_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./income-list-footer.component.ngfactory */ "./src/app/budgets/budget-editor/incomes/income-list-footer.component.ngfactory.js");
/* harmony import */ var _income_list_footer_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./income-list-footer.component */ "./src/app/budgets/budget-editor/incomes/income-list-footer.component.ts");
/* harmony import */ var _income_list_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./income-list.component */ "./src/app/budgets/budget-editor/incomes/income-list.component.ts");
/* harmony import */ var _bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../bank-accounts/bank-account.service */ "./src/app/bank-accounts/bank-account.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_income_list_row.component.ngfactory,_.._.._shared_highlight_deleted.directive,_income_list_row.component,_.._.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_income_list_header.component.ngfactory,_income_list_header.component,_angular_common,_income_list_footer.component.ngfactory,_income_list_footer.component,_income_list.component,_.._.._bank_accounts_bank_account.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_income_list_row.component.ngfactory,_.._.._shared_highlight_deleted.directive,_income_list_row.component,_.._.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_income_list_header.component.ngfactory,_income_list_header.component,_angular_common,_income_list_footer.component.ngfactory,_income_list_footer.component,_income_list.component,_.._.._bank_accounts_bank_account.service PURE_IMPORTS_END */















var styles_IncomeListComponent = [".category-button[_ngcontent-%COMP%] {\n      margin: 5px;\n    }"];
var RenderType_IncomeListComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_IncomeListComponent, data: {} });

function View_IncomeListComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 3, "tr", [["ec-income-list-row", ""]], [[2, "deleted", null], [2, "unpaid", null], [2, "deactivated", null]], null, null, _income_list_row_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_IncomeListRowComponent_0"], _income_list_row_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_IncomeListRowComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 16384, null, 0, _shared_highlight_deleted_directive__WEBPACK_IMPORTED_MODULE_2__["HighlightDeletedDirective"], [], { item: [0, "item"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 114688, null, 0, _income_list_row_component__WEBPACK_IMPORTED_MODULE_3__["IncomeListRowComponent"], [], { income: [0, "income"], editMode: [1, "editMode"], bankAccounts: [2, "bankAccounts"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "]))], function (_ck, _v) { var _co = _v.component; var currVal_3 = _v.context.$implicit; _ck(_v, 1, 0, currVal_3); var currVal_4 = _v.context.$implicit; var currVal_5 = _co.editMode; var currVal_6 = _co.bankAccounts; _ck(_v, 2, 0, currVal_4, currVal_5, currVal_6); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).isDeleted; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).isUnpaid; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).isDeactivated; _ck(_v, 0, 0, currVal_0, currVal_1, currVal_2); }); }
function View_IncomeListComponent_2(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 5, "div", [["class", "category-button"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 2, "button", [["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.addNewIncome() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_7__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n                Add Income\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "]))], function (_ck, _v) { var currVal_1 = "primary"; _ck(_v, 3, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).disabled || null); _ck(_v, 2, 0, currVal_0); });
}
function View_IncomeListComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 1, "h1", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Incomes"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 24, "table", [["class", "table"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, null, 2, "thead", [["ec-income-list-header", ""]], null, null, null, _income_list_header_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["View_IncomeListHeaderComponent_0"], _income_list_header_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["RenderType_IncomeListHeaderComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](7, 114688, null, 0, _income_list_header_component__WEBPACK_IMPORTED_MODULE_9__["IncomeListHeaderComponent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, null, null, 13, "tbody", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_IncomeListComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_10__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, null, 7, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](17, 0, null, null, 4, "td", [["colspan", "5"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_IncomeListComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](20, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_10__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](25, 0, null, null, 2, "tfoot", [["ec-income-list-footer", ""]], null, null, null, _income_list_footer_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__["View_IncomeListFooterComponent_0"], _income_list_footer_component_ngfactory__WEBPACK_IMPORTED_MODULE_11__["RenderType_IncomeListFooterComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 114688, null, 0, _income_list_footer_component__WEBPACK_IMPORTED_MODULE_12__["IncomeListFooterComponent"], [], { incomes: [0, "incomes"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; _ck(_v, 7, 0); var currVal_0 = _co.budget.incomes; _ck(_v, 13, 0, currVal_0); var currVal_1 = _co.editMode; _ck(_v, 20, 0, currVal_1); var currVal_2 = _co.budget.incomes; _ck(_v, 26, 0, currVal_2); }, null); }
function View_IncomeListComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-income-list", [], null, null, null, View_IncomeListComponent_0, RenderType_IncomeListComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _income_list_component__WEBPACK_IMPORTED_MODULE_13__["IncomeListComponent"], [_bank_accounts_bank_account_service__WEBPACK_IMPORTED_MODULE_14__["BankAccountService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var IncomeListComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-income-list", _income_list_component__WEBPACK_IMPORTED_MODULE_13__["IncomeListComponent"], View_IncomeListComponent_Host_0, { budget: "budget", editMode: "editMode" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget-editor/incomes/income-list.component.ts":
/*!************************************************************************!*\
  !*** ./src/app/budgets/budget-editor/incomes/income-list.component.ts ***!
  \************************************************************************/
/*! exports provided: IncomeListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IncomeListComponent", function() { return IncomeListComponent; });
var IncomeListComponent = /*@__PURE__*/ (function () {
    function IncomeListComponent(bankAccountService) {
        this.bankAccountService = bankAccountService;
        this.budget = { incomes: [], allocations: [] };
        this.bankAccounts = [];
    }
    IncomeListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.bankAccountService.getBankAccounts()
            .subscribe(function (bankAccounts) { return _this.bankAccounts = bankAccounts; });
    };
    IncomeListComponent.prototype.addNewIncome = function () {
        var newIncome = {
            id: 0,
            name: '',
            amount: 0,
            budget_id: this.budget.id,
            bank_account_id: 0
        };
        this.budget.incomes.push(newIncome);
    };
    return IncomeListComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget-list/budget-list.component.ngfactory.js":
/*!************************************************************************!*\
  !*** ./src/app/budgets/budget-list/budget-list.component.ngfactory.js ***!
  \************************************************************************/
/*! exports provided: RenderType_BudgetListComponent, View_BudgetListComponent_0, View_BudgetListComponent_Host_0, BudgetListComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_BudgetListComponent", function() { return RenderType_BudgetListComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetListComponent_0", function() { return View_BudgetListComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetListComponent_Host_0", function() { return View_BudgetListComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetListComponentNgFactory", function() { return BudgetListComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/list/typings/index.ngfactory */ "./node_modules/@angular/material/list/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/list */ "./node_modules/@angular/material/esm5/list.es5.js");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/divider/typings/index.ngfactory */ "./node_modules/@angular/material/divider/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/divider */ "./node_modules/@angular/material/esm5/divider.es5.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _budget_list_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./budget-list.component */ "./src/app/budgets/budget-list/budget-list.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_.._.._.._node_modules__angular_material_list_typings_index.ngfactory,_angular_material_list,_angular_material_core,_angular_flex_layout,_angular_common,_.._.._.._node_modules__angular_material_divider_typings_index.ngfactory,_angular_material_divider,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_budget_list.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_.._.._.._node_modules__angular_material_list_typings_index.ngfactory,_angular_material_list,_angular_material_core,_angular_flex_layout,_angular_common,_.._.._.._node_modules__angular_material_divider_typings_index.ngfactory,_angular_material_divider,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_budget_list.component PURE_IMPORTS_END */















var styles_BudgetListComponent = [];
var RenderType_BudgetListComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_BudgetListComponent, data: {} });

function View_BudgetListComponent_2(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "button", [["color", "accent"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.copy.emit(_v.parent.context.$implicit) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Copy"]))], function (_ck, _v) { var currVal_1 = "accent"; _ck(_v, 1, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).disabled || null); _ck(_v, 0, 0, currVal_0); });
}
function View_BudgetListComponent_3(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "button", [["color", "warn"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.close.emit(_v.parent.context.$implicit) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Close"]))], function (_ck, _v) { var currVal_1 = "warn"; _ck(_v, 1, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).disabled || null); _ck(_v, 0, 0, currVal_0); });
}
function View_BudgetListComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 30, null, null, null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 24, "mat-list-item", [["class", "mat-list-item"]], [[2, "mat-list-item-avatar", null], [2, "mat-list-item-with-avatar", null]], [[null, "focus"], [null, "blur"]], function (_v, en, $event) {
            var ad = true;
            if (("focus" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3)._handleFocus() !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3)._handleBlur() !== false);
                ad = (pd_1 && ad);
            }
            return ad;
        }, _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatListItem_0"], _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatListItem"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 1097728, null, 2, _angular_material_list__WEBPACK_IMPORTED_MODULE_6__["MatListItem"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_material_list__WEBPACK_IMPORTED_MODULE_6__["MatNavList"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 1, { _lines: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _avatar: 0 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, 1, 2, "h1", [["class", "mat-line"], ["matLine", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 16384, [[1, 4]], 0, _angular_material_core__WEBPACK_IMPORTED_MODULE_7__["MatLine"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](9, null, [" ", " "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, 1, 14, "div", [["class", "mat-line"], ["fxFlexLayout", "row"], ["fxLayoutAlign", "end"], ["fxLayoutGap", "10px"], ["matLine", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](12, 1785856, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["LayoutGapDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [8, null], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["ɵb"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["StyleUtils"]], { gap: [0, "gap"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["LayoutAlignDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [8, null], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_8__["StyleUtils"]], { align: [0, "align"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](14, 16384, [[1, 4]], 0, _angular_material_core__WEBPACK_IMPORTED_MODULE_7__["MatLine"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](16, 0, null, null, 2, "button", [["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.select.emit(_v.context.$implicit) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](17, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["View"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_BudgetListComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](21, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_BudgetListComponent_3)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](24, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](28, 0, null, null, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_10__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_10__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](29, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_11__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "]))], function (_ck, _v) { var _co = _v.component; var currVal_3 = "10px"; _ck(_v, 12, 0, currVal_3); var currVal_4 = "end"; _ck(_v, 13, 0, currVal_4); var currVal_6 = "primary"; _ck(_v, 17, 0, currVal_6); var currVal_7 = _co.canCopy(_v.context.$implicit); _ck(_v, 21, 0, currVal_7); var currVal_8 = _co.canClose(_v.context.$implicit); _ck(_v, 24, 0, currVal_8); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3)._avatar; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3)._avatar; _ck(_v, 2, 0, currVal_0, currVal_1); var currVal_2 = _v.context.$implicit.name; _ck(_v, 9, 0, currVal_2); var currVal_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 17).disabled || null); _ck(_v, 16, 0, currVal_5); var currVal_9 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29).vertical ? "vertical" : "horizontal"); var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29).vertical; var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29).inset; _ck(_v, 28, 0, currVal_9, currVal_10, currVal_11); });
}
function View_BudgetListComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 13, "mat-card", [["class", "mat-card"]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCard"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, 0, 9, "mat-card-content", [["class", "mat-card-content"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCardContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 5, "mat-list", [["class", "mat-list"]], null, null, null, _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatList_0"], _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatList"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 49152, null, 0, _angular_material_list__WEBPACK_IMPORTED_MODULE_6__["MatList"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, 0, 1, null, View_BudgetListComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.budgets; _ck(_v, 11, 0, currVal_0); }, null); }
function View_BudgetListComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-budget-list", [], null, null, null, View_BudgetListComponent_0, RenderType_BudgetListComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _budget_list_component__WEBPACK_IMPORTED_MODULE_14__["BudgetListComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var BudgetListComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-budget-list", _budget_list_component__WEBPACK_IMPORTED_MODULE_14__["BudgetListComponent"], View_BudgetListComponent_Host_0, { budgets: "budgets" }, { select: "select", close: "close", copy: "copy" }, []);




/***/ }),

/***/ "./src/app/budgets/budget-list/budget-list.component.ts":
/*!**************************************************************!*\
  !*** ./src/app/budgets/budget-list/budget-list.component.ts ***!
  \**************************************************************/
/*! exports provided: BudgetListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetListComponent", function() { return BudgetListComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");

var BudgetListComponent = /*@__PURE__*/ (function () {
    function BudgetListComponent() {
        this.select = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.close = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.copy = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    BudgetListComponent.prototype.ngOnInit = function () {
    };
    BudgetListComponent.prototype.canCopy = function (budget) {
        var firstBudget = this.budgets[0];
        return firstBudget && firstBudget.id === budget.id;
    };
    BudgetListComponent.prototype.canClose = function (budget) {
        return budget.status === 'open';
    };
    return BudgetListComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budget.service.ts":
/*!*******************************************!*\
  !*** ./src/app/budgets/budget.service.ts ***!
  \*******************************************/
/*! exports provided: BudgetService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetService", function() { return BudgetService; });
var BudgetService = /*@__PURE__*/ (function () {
    function BudgetService(apiGateway) {
        this.apiGateway = apiGateway;
    }
    BudgetService.prototype.getBudgets = function () {
        return this.apiGateway.get("/budgets");
    };
    BudgetService.prototype.getBudgetsWithTransactions = function () {
        return this.getBudgets().map(function (budgets) {
            var openBudgets = budgets.filter(function (b) { return b.status === 'open'; });
            var closedBudgets = budgets.filter(function (b) { return b.status === 'closed'; });
            var currentBudget = openBudgets[openBudgets.length - 1];
            // if we have an open budget, add it to the list
            if (currentBudget) {
                closedBudgets.unshift(currentBudget);
            }
            return closedBudgets;
        });
    };
    BudgetService.prototype.getFutureBudgets = function () {
        return this.apiGateway.get("/budgets/future");
    };
    BudgetService.prototype.getAllocations = function (budgetId) {
        return this.apiGateway.get("/allocations", {
            budget_id: budgetId
        });
    };
    BudgetService.prototype.getAllocationCategories = function () {
        return this.apiGateway.get("/allocation_categories");
    };
    BudgetService.prototype.getBudget = function (budgetId) {
        return this.apiGateway.get("/budgets/" + budgetId);
    };
    BudgetService.prototype.getCurrentBudgetId = function () {
        return this.apiGateway.get('/budgets/current').map(function (data) { return data.budget_id; });
        // .switchMap(budgetId => this.getBudget(budgetId));
    };
    BudgetService.prototype.createBudget = function (budget) {
        return this.apiGateway.post('/budgets', budget);
    };
    BudgetService.prototype.saveBudget = function (budget) {
        return this.apiGateway.put("/budgets/" + budget.id, budget);
    };
    BudgetService.prototype.copyBudget = function (budget) {
        return this.apiGateway.put("/budgets/" + budget.id + "/copy");
    };
    BudgetService.prototype.closeBudget = function (budget) {
        return this.apiGateway.put("/budgets/" + budget.id + "/close");
    };
    BudgetService.prototype.reopenLastBudget = function () {
        return this.apiGateway.post('/budgets/reopen_last_budget');
    };
    return BudgetService;
}());




/***/ }),

/***/ "./src/app/budgets/budget/budget.component.ngfactory.js":
/*!**************************************************************!*\
  !*** ./src/app/budgets/budget/budget.component.ngfactory.js ***!
  \**************************************************************/
/*! exports provided: RenderType_BudgetComponent, View_BudgetComponent_0, View_BudgetComponent_Host_0, BudgetComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_BudgetComponent", function() { return RenderType_BudgetComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetComponent_0", function() { return View_BudgetComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetComponent_Host_0", function() { return View_BudgetComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetComponentNgFactory", function() { return BudgetComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _budget_editor_budget_editor_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../budget-editor/budget-editor.component.ngfactory */ "./src/app/budgets/budget-editor/budget-editor.component.ngfactory.js");
/* harmony import */ var _budget_editor_budget_editor_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../budget-editor/budget-editor.component */ "./src/app/budgets/budget-editor/budget-editor.component.ts");
/* harmony import */ var _shared_edit_actions_edit_actions_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../shared/edit-actions/edit-actions.component.ngfactory */ "./src/app/shared/edit-actions/edit-actions.component.ngfactory.js");
/* harmony import */ var _shared_edit_actions_edit_actions_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../shared/edit-actions/edit-actions.component */ "./src/app/shared/edit-actions/edit-actions.component.ts");
/* harmony import */ var _budget_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./budget.component */ "./src/app/budgets/budget/budget.component.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _budget_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../budget.service */ "./src/app/budgets/budget.service.ts");
/* harmony import */ var _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../shared/main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../message-display/message.service */ "./src/app/message-display/message.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_angular_flex_layout,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_budget_editor_budget_editor.component.ngfactory,_budget_editor_budget_editor.component,_.._shared_edit_actions_edit_actions.component.ngfactory,_.._shared_edit_actions_edit_actions.component,_budget.component,_angular_router,_budget.service,_.._shared_main_toolbar_main_toolbar.service,_.._message_display_message.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_angular_flex_layout,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_budget_editor_budget_editor.component.ngfactory,_budget_editor_budget_editor.component,_.._shared_edit_actions_edit_actions.component.ngfactory,_.._shared_edit_actions_edit_actions.component,_budget.component,_angular_router,_budget.service,_.._shared_main_toolbar_main_toolbar.service,_.._message_display_message.service PURE_IMPORTS_END */

















var styles_BudgetComponent = [];
var RenderType_BudgetComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_BudgetComponent, data: {} });

function View_BudgetComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 27, "mat-card", [["class", "main mat-card"]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCard"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, 0, 11, "mat-card-actions", [["align", "end"], ["class", "mat-card-actions"], ["fxLayoutGap", "10px"]], [[2, "mat-card-actions-align-end", null]], null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 1785856, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_3__["LayoutGapDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_3__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [8, null], _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgZone"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_3__["ɵb"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_3__["StyleUtils"]], { gap: [0, "gap"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardActions"], [], { align: [0, "align"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, null, 2, "button", [["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.goToBudgetList() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](9, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_7__["FocusMonitor"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\u00AB Back to Budget List"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 2, "button", [["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.goToTransactions() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_7__["FocusMonitor"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["View Transactions"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](17, 0, null, 0, 6, "mat-card-content", [["class", "mat-card-content"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 2, "ec-budget-editor", [], null, null, null, _budget_editor_budget_editor_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["View_BudgetEditorComponent_0"], _budget_editor_budget_editor_component_ngfactory__WEBPACK_IMPORTED_MODULE_8__["RenderType_BudgetEditorComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](21, 114688, null, 0, _budget_editor_budget_editor_component__WEBPACK_IMPORTED_MODULE_9__["BudgetEditorComponent"], [], { budget: [0, "budget"], editMode: [1, "editMode"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](25, 0, null, 0, 2, "ec-edit-actions", [], null, [[null, "editModeChange"], [null, "save"], [null, "cancel"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("editModeChange" === en)) {
                var pd_0 = ((_co.editMode = $event) !== false);
                ad = (pd_0 && ad);
            }
            if (("save" === en)) {
                var pd_1 = (_co.saveBudget() !== false);
                ad = (pd_1 && ad);
            }
            if (("cancel" === en)) {
                var pd_2 = (_co.cancel() !== false);
                ad = (pd_2 && ad);
            }
            return ad;
        }, _shared_edit_actions_edit_actions_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["View_EditActionsComponent_0"], _shared_edit_actions_edit_actions_component_ngfactory__WEBPACK_IMPORTED_MODULE_10__["RenderType_EditActionsComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 114688, null, 0, _shared_edit_actions_edit_actions_component__WEBPACK_IMPORTED_MODULE_11__["EditActionsComponent"], [], { editMode: [0, "editMode"] }, { editModeChange: "editModeChange", save: "save", cancel: "cancel" }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = "10px"; _ck(_v, 5, 0, currVal_1); var currVal_2 = "end"; _ck(_v, 6, 0, currVal_2); var currVal_5 = _co.budget; var currVal_6 = _co.editMode; _ck(_v, 21, 0, currVal_5, currVal_6); var currVal_7 = _co.editMode; _ck(_v, 26, 0, currVal_7); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 6).align === "end"); _ck(_v, 4, 0, currVal_0); var currVal_3 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 9).disabled || null); _ck(_v, 8, 0, currVal_3); var currVal_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 13).disabled || null); _ck(_v, 12, 0, currVal_4); });
}
function View_BudgetComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-budget", [], null, null, null, View_BudgetComponent_0, RenderType_BudgetComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 245760, null, 0, _budget_component__WEBPACK_IMPORTED_MODULE_12__["BudgetComponent"], [_angular_router__WEBPACK_IMPORTED_MODULE_13__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_13__["ActivatedRoute"], _angular_router__WEBPACK_IMPORTED_MODULE_13__["ActivatedRoute"], _budget_service__WEBPACK_IMPORTED_MODULE_14__["BudgetService"], _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_15__["MainToolbarService"], _message_display_message_service__WEBPACK_IMPORTED_MODULE_16__["MessageService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var BudgetComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-budget", _budget_component__WEBPACK_IMPORTED_MODULE_12__["BudgetComponent"], View_BudgetComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/budgets/budget/budget.component.ts":
/*!****************************************************!*\
  !*** ./src/app/budgets/budget/budget.component.ts ***!
  \****************************************************/
/*! exports provided: BudgetComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetComponent", function() { return BudgetComponent; });
/* harmony import */ var rxjs_Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs/Subject */ "./node_modules/rxjs/_esm5/Subject.js");

var BudgetComponent = /*@__PURE__*/ (function () {
    function BudgetComponent(router, route, activatedRoute, budgetService, toolbar, messageService) {
        this.router = router;
        this.route = route;
        this.activatedRoute = activatedRoute;
        this.budgetService = budgetService;
        this.toolbar = toolbar;
        this.messageService = messageService;
        this.budget = {};
        this.componentDestroyed$ = new rxjs_Subject__WEBPACK_IMPORTED_MODULE_0__["Subject"]();
        this.editMode = false;
    }
    BudgetComponent.prototype.ngOnInit = function () {
        var _this = this;
        var idParam$ = this.activatedRoute.paramMap
            .takeUntil(this.componentDestroyed$)
            .map(function (paramMap) { return paramMap.get("id"); });
        // check for the 'current' route
        idParam$
            .filter(function (id) { return id === 'current'; })
            .switchMap(function () { return _this.budgetService.getCurrentBudgetId(); })
            .subscribe(function (budgetId) {
            _this.router.navigateByUrl("/budgets/" + budgetId);
        });
        // for all other routes, load the budget
        this.loadBudgetForId(idParam$);
    };
    BudgetComponent.prototype.loadBudgetForId = function (idParam$) {
        var _this = this;
        idParam$
            .filter(function (id) { return id !== 'current'; })
            .map(function (idString) { return Number(idString); })
            .switchMap(function (budgetId) { return _this.budgetService.getBudget(budgetId); })
            .subscribe(function (budget) {
            _this.budget = budget;
            _this.updateHeading();
        });
    };
    BudgetComponent.prototype.updateHeading = function () {
        this.toolbar.setHeading("Edit Budget: " + this.budget.name);
    };
    BudgetComponent.prototype.refresh = function () {
        var _this = this;
        this.budgetService
            .getBudget(this.budget.id)
            .subscribe(function (budget) { return (_this.budget = budget); });
    };
    BudgetComponent.prototype.ngOnDestroy = function () {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    };
    BudgetComponent.prototype.goToBudgetList = function () {
        this.router.navigate([".."], { relativeTo: this.route });
    };
    BudgetComponent.prototype.goToTransactions = function () {
        this.router.navigate(["..", "transactions", { budget_id: this.budget.id }], { relativeTo: this.route.parent.parent });
    };
    BudgetComponent.prototype.saveBudget = function () {
        var _this = this;
        this.budgetService
            .saveBudget(this.budget)
            .subscribe(function (budget) {
            _this.budget = budget;
            _this.messageService.setMessage("Budget saved.");
            _this.editMode = false;
        });
    };
    BudgetComponent.prototype.cancel = function () {
        this.messageService.setMessage("Editing canceled");
        this.editMode = false;
        this.refresh();
    };
    return BudgetComponent;
}());




/***/ }),

/***/ "./src/app/budgets/budgets-routing.module.ts":
/*!***************************************************!*\
  !*** ./src/app/budgets/budgets-routing.module.ts ***!
  \***************************************************/
/*! exports provided: BudgetsRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetsRoutingModule", function() { return BudgetsRoutingModule; });
/* harmony import */ var _core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/auth/auth-guard.service */ "./src/app/core/auth/auth-guard.service.ts");
/* harmony import */ var _budget_budget_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./budget/budget.component */ "./src/app/budgets/budget/budget.component.ts");
/* harmony import */ var _budgets_budgets_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./budgets/budgets.component */ "./src/app/budgets/budgets/budgets.component.ts");
/* harmony import */ var _future_budgets_future_budgets_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./future-budgets/future-budgets.component */ "./src/app/budgets/future-budgets/future-budgets.component.ts");




var routes = [
    {
        path: '',
        canActivate: [_core_auth_auth_guard_service__WEBPACK_IMPORTED_MODULE_0__["AuthGuard"]],
        children: [
            { path: 'future', component: _future_budgets_future_budgets_component__WEBPACK_IMPORTED_MODULE_3__["FutureBudgetsComponent"] },
            { path: ':id', component: _budget_budget_component__WEBPACK_IMPORTED_MODULE_1__["BudgetComponent"] },
            { path: '', component: _budgets_budgets_component__WEBPACK_IMPORTED_MODULE_2__["BudgetsComponent"] },
        ]
    }
];
var BudgetsRoutingModule = /*@__PURE__*/ (function () {
    function BudgetsRoutingModule() {
    }
    return BudgetsRoutingModule;
}());




/***/ }),

/***/ "./src/app/budgets/budgets.module.ts":
/*!*******************************************!*\
  !*** ./src/app/budgets/budgets.module.ts ***!
  \*******************************************/
/*! exports provided: BudgetsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetsModule", function() { return BudgetsModule; });
var BudgetsModule = /*@__PURE__*/ (function () {
    function BudgetsModule() {
    }
    return BudgetsModule;
}());




/***/ }),

/***/ "./src/app/budgets/budgets/budgets.component.ngfactory.js":
/*!****************************************************************!*\
  !*** ./src/app/budgets/budgets/budgets.component.ngfactory.js ***!
  \****************************************************************/
/*! exports provided: RenderType_BudgetsComponent, View_BudgetsComponent_0, View_BudgetsComponent_Host_0, BudgetsComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_BudgetsComponent", function() { return RenderType_BudgetsComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetsComponent_0", function() { return View_BudgetsComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_BudgetsComponent_Host_0", function() { return View_BudgetsComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetsComponentNgFactory", function() { return BudgetsComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _budget_list_budget_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../budget-list/budget-list.component.ngfactory */ "./src/app/budgets/budget-list/budget-list.component.ngfactory.js");
/* harmony import */ var _budget_list_budget_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../budget-list/budget-list.component */ "./src/app/budgets/budget-list/budget-list.component.ts");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _budgets_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./budgets.component */ "./src/app/budgets/budgets/budgets.component.ts");
/* harmony import */ var _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../shared/main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/* harmony import */ var _budget_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../budget.service */ "./src/app/budgets/budget.service.ts");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../message-display/message.service */ "./src/app/message-display/message.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _shared_confirmation_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../shared/confirmation.service */ "./src/app/shared/confirmation.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_budget_list_budget_list.component.ngfactory,_budget_list_budget_list.component,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_budgets.component,_.._shared_main_toolbar_main_toolbar.service,_budget.service,_.._message_display_message.service,_angular_router,_.._shared_confirmation.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_budget_list_budget_list.component.ngfactory,_budget_list_budget_list.component,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_budgets.component,_.._shared_main_toolbar_main_toolbar.service,_budget.service,_.._message_display_message.service,_angular_router,_.._shared_confirmation.service PURE_IMPORTS_END */















var styles_BudgetsComponent = [];
var RenderType_BudgetsComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_BudgetsComponent, data: {} });

function View_BudgetsComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 25, "mat-card", [["class", "main mat-card"]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCard"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, 0, 2, "mat-card-title", [["class", "mat-card-title"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardTitle"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Budgets"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, 0, 5, "mat-card-content", [["class", "mat-card-content"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](9, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 1, "ec-budget-list", [], null, [[null, "select"], [null, "close"], [null, "copy"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("select" === en)) {
                var pd_0 = (_co.goToBudget($event) !== false);
                ad = (pd_0 && ad);
            }
            if (("close" === en)) {
                var pd_1 = (_co.closeBudget($event) !== false);
                ad = (pd_1 && ad);
            }
            if (("copy" === en)) {
                var pd_2 = (_co.copyBudget($event) !== false);
                ad = (pd_2 && ad);
            }
            return ad;
        }, _budget_list_budget_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_BudgetListComponent_0"], _budget_list_budget_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_BudgetListComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](12, 114688, null, 0, _budget_list_budget_list_component__WEBPACK_IMPORTED_MODULE_4__["BudgetListComponent"], [], { budgets: [0, "budgets"] }, { select: "select", close: "close", copy: "copy" }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, 0, 10, "mat-card-actions", [["class", "mat-card-actions"]], [[2, "mat-card-actions-align-end", null]], null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardActions"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](18, 0, null, null, 2, "button", [["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.addNewBudget() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](19, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_7__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_8__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Add New Budget"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](22, 0, null, null, 2, "button", [["color", "warn"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.reopenLastBudget() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](23, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_7__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_8__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Reopen Last Budget"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.budgets; _ck(_v, 12, 0, currVal_0); var currVal_3 = "primary"; _ck(_v, 19, 0, currVal_3); var currVal_5 = "warn"; _ck(_v, 23, 0, currVal_5); }, function (_ck, _v) { var currVal_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).align === "end"); _ck(_v, 15, 0, currVal_1); var currVal_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 19).disabled || null); _ck(_v, 18, 0, currVal_2); var currVal_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 23).disabled || null); _ck(_v, 22, 0, currVal_4); });
}
function View_BudgetsComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-budgets", [], null, null, null, View_BudgetsComponent_0, RenderType_BudgetsComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _budgets_component__WEBPACK_IMPORTED_MODULE_9__["BudgetsComponent"], [_shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_10__["MainToolbarService"], _budget_service__WEBPACK_IMPORTED_MODULE_11__["BudgetService"], _message_display_message_service__WEBPACK_IMPORTED_MODULE_12__["MessageService"], _angular_router__WEBPACK_IMPORTED_MODULE_13__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_13__["ActivatedRoute"], _shared_confirmation_service__WEBPACK_IMPORTED_MODULE_14__["ConfirmationService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var BudgetsComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-budgets", _budgets_component__WEBPACK_IMPORTED_MODULE_9__["BudgetsComponent"], View_BudgetsComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/budgets/budgets/budgets.component.ts":
/*!******************************************************!*\
  !*** ./src/app/budgets/budgets/budgets.component.ts ***!
  \******************************************************/
/*! exports provided: BudgetsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BudgetsComponent", function() { return BudgetsComponent; });
var BudgetsComponent = /*@__PURE__*/ (function () {
    function BudgetsComponent(toolbar, budgetService, messageService, router, route, confirmation) {
        this.toolbar = toolbar;
        this.budgetService = budgetService;
        this.messageService = messageService;
        this.router = router;
        this.route = route;
        this.confirmation = confirmation;
    }
    BudgetsComponent.prototype.ngOnInit = function () {
        this.toolbar.setHeading('Budgets');
        this.refresh();
    };
    BudgetsComponent.prototype.refresh = function () {
        var _this = this;
        this.budgetService.getBudgets().subscribe(function (budgets) { return _this.budgets = budgets; });
    };
    BudgetsComponent.prototype.addNewBudget = function () {
        //TODO: to implement
        this.messageService.setMessage("Adding not yet implemented - copy previous budget for now");
    };
    BudgetsComponent.prototype.reopenLastBudget = function () {
        var _this = this;
        this.confirmation.ask({
            title: 'Reopen Last Budget',
            question: 'Are you sure you want to open the last closed budget?',
            emitNegativeAnswers: false
        })
            .subscribe(function () {
            _this.messageService.setMessage("Reopening last budget...");
            _this.budgetService.reopenLastBudget().subscribe(function () {
                _this.messageService.setMessage("Last Budget re-opened.");
                _this.refresh();
            });
        });
    };
    BudgetsComponent.prototype.goToBudget = function (budget) {
        this.router.navigate([budget.id], { relativeTo: this.route });
    };
    BudgetsComponent.prototype.closeBudget = function (budget) {
        var _this = this;
        this.confirmation.ask({
            title: 'Close Budget Period?',
            question: 'Are you ready to close off this budget?',
            emitNegativeAnswers: false
        }).subscribe(function () {
            _this.messageService.setMessage("Closing....");
            _this.budgetService.closeBudget(budget).subscribe(function () {
                _this.messageService.setMessage("Budget closed.");
                _this.refresh();
            }, function () {
                _this.messageService.setErrorMessage("Budget NOT closed.");
            });
        });
    };
    BudgetsComponent.prototype.copyBudget = function (budget) {
        var _this = this;
        this.confirmation.ask({
            title: 'Copy Budget?',
            question: 'Are you sure you want to COPY this budget?',
            emitNegativeAnswers: false
        }).subscribe(function () {
            _this.messageService.setMessage("Copying...");
            _this.budgetService.copyBudget(budget).subscribe(function () {
                _this.messageService.setMessage("Budget copied.");
                _this.refresh();
            }, function () {
                _this.messageService.setErrorMessage("Budget NOT copied.");
            });
        });
    };
    return BudgetsComponent;
}());




/***/ }),

/***/ "./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ngfactory.js":
/*!**************************************************************************************************!*\
  !*** ./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ngfactory.js ***!
  \**************************************************************************************************/
/*! exports provided: RenderType_FutureAllocationListComponent, View_FutureAllocationListComponent_0, View_FutureAllocationListComponent_Host_0, FutureAllocationListComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_FutureAllocationListComponent", function() { return RenderType_FutureAllocationListComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_FutureAllocationListComponent_0", function() { return View_FutureAllocationListComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_FutureAllocationListComponent_Host_0", function() { return View_FutureAllocationListComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureAllocationListComponentNgFactory", function() { return FutureAllocationListComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _shared_money_pipe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/money.pipe */ "./src/app/shared/money.pipe.ts");
/* harmony import */ var _future_allocation_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./future-allocation-list.component */ "./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ts");
/* harmony import */ var _budget_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../budget.service */ "./src/app/budgets/budget.service.ts");
/* harmony import */ var _future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../future-budgets-data-formatter.service */ "./src/app/budgets/future-budgets/future-budgets-data-formatter.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_router,_angular_common,_.._.._shared_money.pipe,_future_allocation_list.component,_.._budget.service,_future_budgets_data_formatter.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_router,_angular_common,_.._.._shared_money.pipe,_future_allocation_list.component,_.._budget.service,_future_budgets_data_formatter.service PURE_IMPORTS_END */







var styles_FutureAllocationListComponent = [".heading[_ngcontent-%COMP%] {\n      font-weight: bold;\n      font-size: 16px;\n      border-top: 3px solid blue;\n      border-bottom: 2px solid blue;\n    }"];
var RenderType_FutureAllocationListComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_FutureAllocationListComponent, data: {} });

function View_FutureAllocationListComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 6, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 3, "a", [], [[1, "target", 0], [8, "href", 4]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            if (("click" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).onClick($event.button, $event.ctrlKey, $event.metaKey, $event.shiftKey) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 671744, null, 0, _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterLinkWithHref"], [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"], _angular_common__WEBPACK_IMPORTED_MODULE_2__["LocationStrategy"]], { routerLink: [0, "routerLink"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpad"](4, 2), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](5, null, [" ", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "]))], function (_ck, _v) { var currVal_2 = _ck(_v, 4, 0, "..", _v.context.$implicit.id); _ck(_v, 3, 0, currVal_2); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).target; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).href; _ck(_v, 2, 0, currVal_0, currVal_1); var currVal_3 = _v.context.$implicit.name; _ck(_v, 5, 0, currVal_3); });
}
function View_FutureAllocationListComponent_3(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](1, null, ["\n            ", "\n          "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](2, 1)], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 1, 0, _ck(_v, 2, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent.parent, 0), _co.totalFor(_v.parent.context.$implicit, _v.context.$implicit.name))); _ck(_v, 1, 0, currVal_0); }); }
function View_FutureAllocationListComponent_5(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](1, null, ["\n            ", "\n          "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](2, 1)], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 1, 0, _ck(_v, 2, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent.parent.parent, 0), _co.getAmountForAllocationAndBudget(_v.parent.parent.context.$implicit, _v.parent.context.$implicit, _v.context.$implicit))); _ck(_v, 1, 0, currVal_0); }); }
function View_FutureAllocationListComponent_4(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 7, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 1, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](3, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureAllocationListComponent_5)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.budgets; var currVal_2 = _co.trackById; _ck(_v, 6, 0, currVal_1, currVal_2); }, function (_ck, _v) { var currVal_0 = _v.context.$implicit; _ck(_v, 3, 0, currVal_0); }); }
function View_FutureAllocationListComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 13, null, null, null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 7, "tr", [["class", "heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 1, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](5, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureAllocationListComponent_3)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureAllocationListComponent_4)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](12, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.budgets; var currVal_2 = _co.trackById; _ck(_v, 8, 0, currVal_1, currVal_2); var currVal_3 = _co.allocationNames(_v.context.$implicit); _ck(_v, 12, 0, currVal_3); }, function (_ck, _v) { var currVal_0 = _v.context.$implicit.name; _ck(_v, 5, 0, currVal_0); }); }
function View_FutureAllocationListComponent_6(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "th", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](1, null, ["\n          ", "\n        "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](2, 1)], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 1, 0, _ck(_v, 2, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent, 0), _co.totalForBudget(_v.context.$implicit.name))); _ck(_v, 1, 0, currVal_0); }); }
function View_FutureAllocationListComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _shared_money_pipe__WEBPACK_IMPORTED_MODULE_3__["MoneyPipe"], []), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 4, "tr", [["class", "section-heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 1, "td", [], [[1, "colspan", 0]], null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Allocations"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, null, 7, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Allocation"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureAllocationListComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](14, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureAllocationListComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 7, "tr", [["class", "total"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](22, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Total (not real)"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureAllocationListComponent_6)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.budgets; var currVal_2 = _co.trackById; _ck(_v, 14, 0, currVal_1, currVal_2); var currVal_3 = _co.allocationCategories; var currVal_4 = _co.trackById; _ck(_v, 18, 0, currVal_3, currVal_4); var currVal_5 = _co.budgets; _ck(_v, 26, 0, currVal_5); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.nbrOfColumns(); _ck(_v, 4, 0, currVal_0); }); }
function View_FutureAllocationListComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-future-allocation-list", ""]], null, null, null, View_FutureAllocationListComponent_0, RenderType_FutureAllocationListComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _future_allocation_list_component__WEBPACK_IMPORTED_MODULE_4__["FutureAllocationListComponent"], [_budget_service__WEBPACK_IMPORTED_MODULE_5__["BudgetService"], _future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_6__["FutureBudgetsDataFormatterService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var FutureAllocationListComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-future-allocation-list]", _future_allocation_list_component__WEBPACK_IMPORTED_MODULE_4__["FutureAllocationListComponent"], View_FutureAllocationListComponent_Host_0, { budgets: "budgets" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ts":
/*!****************************************************************************************!*\
  !*** ./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ts ***!
  \****************************************************************************************/
/*! exports provided: FutureAllocationListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureAllocationListComponent", function() { return FutureAllocationListComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/total */ "./src/app/util/total.ts");

var FutureAllocationListComponent = /*@__PURE__*/ (function () {
    function FutureAllocationListComponent(budgetService, formatter) {
        this.budgetService = budgetService;
        this.formatter = formatter;
        this._budgets = [];
        this._allocationCategories = [];
        this.displayData = {};
    }
    Object.defineProperty(FutureAllocationListComponent.prototype, "budgets", {
        get: function () {
            return this._budgets;
        },
        set: function (newBudgetList) {
            this._budgets = newBudgetList;
            this.updateDisplayData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FutureAllocationListComponent.prototype, "allocationCategories", {
        get: function () {
            return this._allocationCategories;
        },
        set: function (newCategories) {
            this._allocationCategories = newCategories;
            // this.updateDisplayData();
        },
        enumerable: true,
        configurable: true
    });
    FutureAllocationListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.budgetService
            .getAllocationCategories()
            .subscribe(function (categories) { return _this.allocationCategories = categories; });
    };
    FutureAllocationListComponent.prototype.updateDisplayData = function () {
        this.displayData = this.formatter.formatAllocationsForDisplay(this.budgets);
    };
    FutureAllocationListComponent.prototype.nbrOfColumns = function () {
        return this.budgets.length + 1;
    };
    FutureAllocationListComponent.prototype.allocationNames = function (category) {
        var data = this.displayData[category.id];
        if (!data) {
            return [];
        }
        return Object.keys(data);
    };
    FutureAllocationListComponent.prototype.getAmountForAllocationAndBudget = function (category, allocationName, budget) {
        var dataForCategory = this.displayData[category.id];
        if (!dataForCategory) {
            return 0;
        }
        var dataForAllocation = dataForCategory[allocationName];
        if (!dataForAllocation) {
            return 0;
        }
        return dataForAllocation[budget.name] || 0;
    };
    FutureAllocationListComponent.prototype.totalFor = function (category, budgetName) {
        var categoryData = this.displayData[category.id] || {};
        var allocations = Object.keys(categoryData).map(function (allocation) { return categoryData[allocation] || {}; });
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(allocations, budgetName);
    };
    FutureAllocationListComponent.prototype.totalForBudget = function (budgetName) {
        return 1000;
        // let incomes = Object.keys(this.displayData).map(income => this.displayData[income]);
        // return total(incomes, budgetName);
    };
    FutureAllocationListComponent.prototype.trackById = function (index, budget) {
        return budget.id;
    };
    return FutureAllocationListComponent;
}());




/***/ }),

/***/ "./src/app/budgets/future-budgets/future-budgets-data-formatter.service.ts":
/*!*********************************************************************************!*\
  !*** ./src/app/budgets/future-budgets/future-budgets-data-formatter.service.ts ***!
  \*********************************************************************************/
/*! exports provided: FutureBudgetsDataFormatterService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureBudgetsDataFormatterService", function() { return FutureBudgetsDataFormatterService; });
var FutureBudgetsDataFormatterService = /*@__PURE__*/ (function () {
    function FutureBudgetsDataFormatterService() {
    }
    FutureBudgetsDataFormatterService.prototype.formatIncomesForDisplay = function (budgets) {
        var results = {};
        budgets.forEach(function (budget) {
            budget.incomes.forEach(function (income) {
                results[income.name] = results[income.name] || {};
                results[income.name][budget.name] = income.amount;
            });
        });
        return results;
    };
    FutureBudgetsDataFormatterService.prototype.formatAllocationsForDisplay = function (budgets) {
        var results = {};
        budgets.forEach(function (budget) {
            budget.allocations.forEach(function (allocation) {
                var catId = allocation.allocation_category_id;
                results[catId] = results[catId] || {};
                results[catId][allocation.name] = results[catId][allocation.name] || {};
                results[catId][allocation.name][budget.name] = allocation.amount;
            });
        });
        return results;
    };
    return FutureBudgetsDataFormatterService;
}());




/***/ }),

/***/ "./src/app/budgets/future-budgets/future-budgets.component.ngfactory.js":
/*!******************************************************************************!*\
  !*** ./src/app/budgets/future-budgets/future-budgets.component.ngfactory.js ***!
  \******************************************************************************/
/*! exports provided: RenderType_FutureBudgetsComponent, View_FutureBudgetsComponent_0, View_FutureBudgetsComponent_Host_0, FutureBudgetsComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_FutureBudgetsComponent", function() { return RenderType_FutureBudgetsComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_FutureBudgetsComponent_0", function() { return View_FutureBudgetsComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_FutureBudgetsComponent_Host_0", function() { return View_FutureBudgetsComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureBudgetsComponentNgFactory", function() { return FutureBudgetsComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _incomes_future_income_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./incomes/future-income-list.component.ngfactory */ "./src/app/budgets/future-budgets/incomes/future-income-list.component.ngfactory.js");
/* harmony import */ var _incomes_future_income_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./incomes/future-income-list.component */ "./src/app/budgets/future-budgets/incomes/future-income-list.component.ts");
/* harmony import */ var _future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./future-budgets-data-formatter.service */ "./src/app/budgets/future-budgets/future-budgets-data-formatter.service.ts");
/* harmony import */ var _allocations_future_allocation_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./allocations/future-allocation-list.component.ngfactory */ "./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ngfactory.js");
/* harmony import */ var _allocations_future_allocation_list_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./allocations/future-allocation-list.component */ "./src/app/budgets/future-budgets/allocations/future-allocation-list.component.ts");
/* harmony import */ var _budget_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../budget.service */ "./src/app/budgets/budget.service.ts");
/* harmony import */ var _future_budgets_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./future-budgets.component */ "./src/app/budgets/future-budgets/future-budgets.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_incomes_future_income_list.component.ngfactory,_incomes_future_income_list.component,_future_budgets_data_formatter.service,_allocations_future_allocation_list.component.ngfactory,_allocations_future_allocation_list.component,_budget.service,_future_budgets.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_incomes_future_income_list.component.ngfactory,_incomes_future_income_list.component,_future_budgets_data_formatter.service,_allocations_future_allocation_list.component.ngfactory,_allocations_future_allocation_list.component,_budget.service,_future_budgets.component PURE_IMPORTS_END */










var styles_FutureBudgetsComponent = [];
var RenderType_FutureBudgetsComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_FutureBudgetsComponent, data: {} });

function View_FutureBudgetsComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 20, "div", [["class", "main"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, null, 17, "mat-card", [["class", "mat-card"]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](4, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCard"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, 0, 13, "mat-card-content", [["class", "mat-card-content"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](7, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_2__["MatCardContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 9, "table", [["class", "table"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 2, "tbody", [["ec-future-income-list", ""]], null, null, null, _incomes_future_income_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_FutureIncomeListComponent_0"], _incomes_future_income_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_FutureIncomeListComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](12, 114688, null, 0, _incomes_future_income_list_component__WEBPACK_IMPORTED_MODULE_4__["FutureIncomeListComponent"], [_future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_5__["FutureBudgetsDataFormatterService"]], { budgets: [0, "budgets"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, null, 2, "tbody", [["ec-future-allocation-list", ""]], null, null, null, _allocations_future_allocation_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["View_FutureAllocationListComponent_0"], _allocations_future_allocation_list_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["RenderType_FutureAllocationListComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 114688, null, 0, _allocations_future_allocation_list_component__WEBPACK_IMPORTED_MODULE_7__["FutureAllocationListComponent"], [_budget_service__WEBPACK_IMPORTED_MODULE_8__["BudgetService"], _future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_5__["FutureBudgetsDataFormatterService"]], { budgets: [0, "budgets"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.budgets; _ck(_v, 12, 0, currVal_0); var currVal_1 = _co.budgets; _ck(_v, 16, 0, currVal_1); }, null); }
function View_FutureBudgetsComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-future-budgets", [], null, null, null, View_FutureBudgetsComponent_0, RenderType_FutureBudgetsComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _future_budgets_component__WEBPACK_IMPORTED_MODULE_9__["FutureBudgetsComponent"], [_budget_service__WEBPACK_IMPORTED_MODULE_8__["BudgetService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var FutureBudgetsComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-future-budgets", _future_budgets_component__WEBPACK_IMPORTED_MODULE_9__["FutureBudgetsComponent"], View_FutureBudgetsComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/budgets/future-budgets/future-budgets.component.ts":
/*!********************************************************************!*\
  !*** ./src/app/budgets/future-budgets/future-budgets.component.ts ***!
  \********************************************************************/
/*! exports provided: FutureBudgetsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureBudgetsComponent", function() { return FutureBudgetsComponent; });
var FutureBudgetsComponent = /*@__PURE__*/ (function () {
    function FutureBudgetsComponent(budgetService) {
        this.budgetService = budgetService;
        this.budgets = [];
    }
    FutureBudgetsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.budgetService.getFutureBudgets().subscribe(function (budgets) { return _this.budgets = budgets; });
    };
    return FutureBudgetsComponent;
}());




/***/ }),

/***/ "./src/app/budgets/future-budgets/future-budgets.module.ts":
/*!*****************************************************************!*\
  !*** ./src/app/budgets/future-budgets/future-budgets.module.ts ***!
  \*****************************************************************/
/*! exports provided: FutureBudgetsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureBudgetsModule", function() { return FutureBudgetsModule; });
var FutureBudgetsModule = /*@__PURE__*/ (function () {
    function FutureBudgetsModule() {
    }
    return FutureBudgetsModule;
}());




/***/ }),

/***/ "./src/app/budgets/future-budgets/incomes/future-income-list.component.ngfactory.js":
/*!******************************************************************************************!*\
  !*** ./src/app/budgets/future-budgets/incomes/future-income-list.component.ngfactory.js ***!
  \******************************************************************************************/
/*! exports provided: RenderType_FutureIncomeListComponent, View_FutureIncomeListComponent_0, View_FutureIncomeListComponent_Host_0, FutureIncomeListComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_FutureIncomeListComponent", function() { return RenderType_FutureIncomeListComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_FutureIncomeListComponent_0", function() { return View_FutureIncomeListComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_FutureIncomeListComponent_Host_0", function() { return View_FutureIncomeListComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureIncomeListComponentNgFactory", function() { return FutureIncomeListComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _shared_money_pipe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/money.pipe */ "./src/app/shared/money.pipe.ts");
/* harmony import */ var _future_income_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./future-income-list.component */ "./src/app/budgets/future-budgets/incomes/future-income-list.component.ts");
/* harmony import */ var _future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../future-budgets-data-formatter.service */ "./src/app/budgets/future-budgets/future-budgets-data-formatter.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_router,_angular_common,_.._.._shared_money.pipe,_future_income_list.component,_future_budgets_data_formatter.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_router,_angular_common,_.._.._shared_money.pipe,_future_income_list.component,_future_budgets_data_formatter.service PURE_IMPORTS_END */






var styles_FutureIncomeListComponent = [];
var RenderType_FutureIncomeListComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_FutureIncomeListComponent, data: {} });

function View_FutureIncomeListComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 6, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 3, "a", [], [[1, "target", 0], [8, "href", 4]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            if (("click" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).onClick($event.button, $event.ctrlKey, $event.metaKey, $event.shiftKey) !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 671744, null, 0, _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterLinkWithHref"], [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"], _angular_common__WEBPACK_IMPORTED_MODULE_2__["LocationStrategy"]], { routerLink: [0, "routerLink"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpad"](4, 2), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](5, null, [" ", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "]))], function (_ck, _v) { var currVal_2 = _ck(_v, 4, 0, "..", _v.context.$implicit.id); _ck(_v, 3, 0, currVal_2); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).target; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).href; _ck(_v, 2, 0, currVal_0, currVal_1); var currVal_3 = _v.context.$implicit.name; _ck(_v, 5, 0, currVal_3); });
}
function View_FutureIncomeListComponent_3(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](1, null, ["\n          ", "\n        "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](2, 1)], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 1, 0, _ck(_v, 2, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent.parent, 0), _co.displayData[_v.parent.context.$implicit][_v.context.$implicit.name])); _ck(_v, 1, 0, currVal_0); }); }
function View_FutureIncomeListComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 7, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 1, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](3, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureIncomeListComponent_3)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.budgets; var currVal_2 = _co.trackById; _ck(_v, 6, 0, currVal_1, currVal_2); }, function (_ck, _v) { var currVal_0 = _v.context.$implicit; _ck(_v, 3, 0, currVal_0); }); }
function View_FutureIncomeListComponent_4(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "th", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](1, null, ["\n           ", "\n        "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](2, 1)], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 1, 0, _ck(_v, 2, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent, 0), _co.totalFor(_v.context.$implicit.name))); _ck(_v, 1, 0, currVal_0); }); }
function View_FutureIncomeListComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _shared_money_pipe__WEBPACK_IMPORTED_MODULE_3__["MoneyPipe"], []), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 4, "tr", [["class", "section-heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 1, "td", [], [[1, "colspan", 0]], null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          Incomes\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, null, 7, "tr", [["class", "heading"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Income"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureIncomeListComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](14, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureIncomeListComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 7, "tr", [["class", "total"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](22, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Total"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_FutureIncomeListComponent_4)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.budgets; var currVal_2 = _co.trackById; _ck(_v, 14, 0, currVal_1, currVal_2); var currVal_3 = _co.incomeNames; _ck(_v, 18, 0, currVal_3); var currVal_4 = _co.budgets; _ck(_v, 26, 0, currVal_4); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.nbrOfColumns(); _ck(_v, 4, 0, currVal_0); }); }
function View_FutureIncomeListComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["ec-future-income-list", ""]], null, null, null, View_FutureIncomeListComponent_0, RenderType_FutureIncomeListComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _future_income_list_component__WEBPACK_IMPORTED_MODULE_4__["FutureIncomeListComponent"], [_future_budgets_data_formatter_service__WEBPACK_IMPORTED_MODULE_5__["FutureBudgetsDataFormatterService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var FutureIncomeListComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("[ec-future-income-list]", _future_income_list_component__WEBPACK_IMPORTED_MODULE_4__["FutureIncomeListComponent"], View_FutureIncomeListComponent_Host_0, { budgets: "budgets" }, {}, []);




/***/ }),

/***/ "./src/app/budgets/future-budgets/incomes/future-income-list.component.ts":
/*!********************************************************************************!*\
  !*** ./src/app/budgets/future-budgets/incomes/future-income-list.component.ts ***!
  \********************************************************************************/
/*! exports provided: FutureIncomeListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FutureIncomeListComponent", function() { return FutureIncomeListComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/total */ "./src/app/util/total.ts");

var FutureIncomeListComponent = /*@__PURE__*/ (function () {
    function FutureIncomeListComponent(formatter) {
        this.formatter = formatter;
        this._budgets = [];
        this.displayData = {};
        this.incomeNames = [];
    }
    Object.defineProperty(FutureIncomeListComponent.prototype, "budgets", {
        get: function () {
            return this._budgets;
        },
        set: function (newBudgetList) {
            this._budgets = newBudgetList;
            this.updateDisplayData();
        },
        enumerable: true,
        configurable: true
    });
    FutureIncomeListComponent.prototype.ngOnInit = function () {
    };
    FutureIncomeListComponent.prototype.nbrOfColumns = function () {
        return this.budgets.length + 1;
    };
    FutureIncomeListComponent.prototype.updateDisplayData = function () {
        this.displayData = this.formatter.formatIncomesForDisplay(this.budgets);
        this.incomeNames = Object.keys(this.displayData);
    };
    FutureIncomeListComponent.prototype.totalFor = function (budgetName) {
        var _this = this;
        var incomes = Object.keys(this.displayData).map(function (income) { return _this.displayData[income]; });
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(incomes, budgetName);
    };
    FutureIncomeListComponent.prototype.trackById = function (index, budget) {
        return budget.id;
    };
    return FutureIncomeListComponent;
}());




/***/ }),

/***/ "./src/app/core/auth/auth-credentials.ts":
/*!***********************************************!*\
  !*** ./src/app/core/auth/auth-credentials.ts ***!
  \***********************************************/
/*! exports provided: AuthCredentials */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthCredentials", function() { return AuthCredentials; });
/* harmony import */ var _angular_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/http */ "./node_modules/@angular/http/esm5/http.js");

var AuthCredentials = /*@__PURE__*/ (function () {
    function AuthCredentials(authData) {
        this['access-token'] = authData['access-token'];
        this['client'] = authData['client'];
        this['expiry'] = authData['expiry'];
        this['token-type'] = authData['token-type'];
        this['uid'] = authData['uid'];
    }
    AuthCredentials.fromLocalStorage = function () {
        return new AuthCredentials({
            'access-token': localStorage.getItem('access-token'),
            'client': localStorage.getItem('client'),
            'expiry': localStorage.getItem('expiry'),
            'token-type': localStorage.getItem('token-type'),
            'uid': localStorage.getItem('uid'),
        });
    };
    AuthCredentials.prototype.hasAccessToken = function () {
        return !!this['access-token'];
    };
    AuthCredentials.prototype.toJSON = function () {
        return {
            'access-token': this['access-token'] || null,
            'client': this['client'] || null,
            'expiry': this['expiry'] || null,
            'token-type': this['token-type'] || null,
            'uid': this['uid'] || null
        };
    };
    AuthCredentials.prototype.toHeaders = function () {
        return new _angular_http__WEBPACK_IMPORTED_MODULE_0__["Headers"](this.toJSON());
    };
    AuthCredentials.prototype.saveToLocalStorage = function () {
        localStorage.setItem('access-token', this['access-token']);
        localStorage.setItem('client', this['client']);
        localStorage.setItem('expiry', this['expiry']);
        localStorage.setItem('token-type', this['token-type']);
        localStorage.setItem('uid', this['uid']);
    };
    return AuthCredentials;
}());




/***/ }),

/***/ "./src/app/core/auth/auth-guard.service.ts":
/*!*************************************************!*\
  !*** ./src/app/core/auth/auth-guard.service.ts ***!
  \*************************************************/
/*! exports provided: AuthGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthGuard", function() { return AuthGuard; });
var AuthGuard = /*@__PURE__*/ (function () {
    function AuthGuard(messageService, authService, router) {
        this.messageService = messageService;
        this.authService = authService;
        this.router = router;
    }
    AuthGuard.prototype.canActivate = function (route, state) {
        var _this = this;
        this.messageService.clear();
        return this.authService.isLoggedIn().then(function (isLoggedIn) {
            if (isLoggedIn) {
                return isLoggedIn;
            }
        }).catch(function (error) {
            _this.messageService.setErrorMessage('Not logged in');
            _this.router.navigate(['/login']);
            return error;
        });
    };
    return AuthGuard;
}());




/***/ }),

/***/ "./src/app/core/auth/auth.module.ts":
/*!******************************************!*\
  !*** ./src/app/core/auth/auth.module.ts ***!
  \******************************************/
/*! exports provided: AuthModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthModule", function() { return AuthModule; });
var AuthModule = /*@__PURE__*/ (function () {
    function AuthModule() {
    }
    return AuthModule;
}());




/***/ }),

/***/ "./src/app/core/auth/auth.service.ts":
/*!*******************************************!*\
  !*** ./src/app/core/auth/auth.service.ts ***!
  \*******************************************/
/*! exports provided: AuthService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthService", function() { return AuthService; });
/* harmony import */ var rxjs_Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs/Observable */ "./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var _auth_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./auth-credentials */ "./src/app/core/auth/auth-credentials.ts");


var AuthService = /*@__PURE__*/ (function () {
    function AuthService(apiGateway) {
        this.apiGateway = apiGateway;
        this.loggedIn = false;
    }
    AuthService.prototype.logIn = function (email, password) {
        var _this = this;
        return this.apiGateway
            .postWithoutAuthentication('/auth/sign_in', { email: email, password: password })
            .do(function (userCredentials) {
            _this.loggedIn = true;
            _this.saveCredentials(userCredentials);
        })
            .catch(function (error) {
            // On any error, clear the credentials and rethrow the error
            _this.clearCredentials();
            return rxjs_Observable__WEBPACK_IMPORTED_MODULE_0__["Observable"].throw(error);
        })
            .toPromise();
    };
    AuthService.prototype.logOut = function () {
        this.clearCredentials();
        return Promise.resolve(true);
    };
    /**
     *
     * @returns Promise<boolean> that resolves to true or false depending on logged in status
     */
    AuthService.prototype.isLoggedIn = function () {
        var _this = this;
        if (this.loggedIn) {
            return Promise.resolve(true);
        }
        var authCredentials = _auth_credentials__WEBPACK_IMPORTED_MODULE_1__["AuthCredentials"].fromLocalStorage();
        if (!authCredentials.hasAccessToken()) {
            this.loggedIn = false;
            return Promise.resolve(false);
        }
        return this.apiGateway.get('/auth/validate_token')
            .map(function (result) { return result.success; })
            .do(function () { return _this.loggedIn = true; })
            .catch(function () {
            _this.loggedIn = false;
            return rxjs_Observable__WEBPACK_IMPORTED_MODULE_0__["Observable"].throw(false);
        })
            .toPromise();
    };
    AuthService.prototype.saveCredentials = function (userCredentials) {
        localStorage.setItem('access-token', userCredentials['access-token']);
        localStorage.setItem('client', userCredentials['client']);
        localStorage.setItem('expiry', userCredentials['expiry']);
        localStorage.setItem('token-type', userCredentials['token-type']);
        localStorage.setItem('uid', userCredentials['uid']);
    };
    AuthService.prototype.clearCredentials = function () {
        localStorage.removeItem('access-token');
        localStorage.removeItem('client');
        localStorage.removeItem('expiry');
        localStorage.removeItem('token-type');
        localStorage.removeItem('uid');
    };
    return AuthService;
}());




/***/ }),

/***/ "./src/app/core/core.module.ts":
/*!*************************************!*\
  !*** ./src/app/core/core.module.ts ***!
  \*************************************/
/*! exports provided: CoreModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CoreModule", function() { return CoreModule; });
var CoreModule = /*@__PURE__*/ (function () {
    function CoreModule() {
    }
    return CoreModule;
}());




/***/ }),

/***/ "./src/app/home/home.component.ngfactory.js":
/*!**************************************************!*\
  !*** ./src/app/home/home.component.ngfactory.js ***!
  \**************************************************/
/*! exports provided: RenderType_HomeComponent, View_HomeComponent_0, View_HomeComponent_Host_0, HomeComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_HomeComponent", function() { return RenderType_HomeComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_HomeComponent_0", function() { return View_HomeComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_HomeComponent_Host_0", function() { return View_HomeComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponentNgFactory", function() { return HomeComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _home_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./home.component */ "./src/app/home/home.component.ts");
/* harmony import */ var _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_home.component,_shared_main_toolbar_main_toolbar.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_home.component,_shared_main_toolbar_main_toolbar.service PURE_IMPORTS_END */



var styles_HomeComponent = [];
var RenderType_HomeComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_HomeComponent, data: {} });

function View_HomeComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 1, "h1", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Recent Updates and Fixes"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 7, "ul", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](6, 0, null, null, 1, "li", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Implement the Future Budgets view"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 1, "li", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Prevent adding transactions to future budgets"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 1, "h3", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Still outstanding"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](16, 0, null, null, 12, "ul", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](18, 0, null, null, 3, "li", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        Fix issue where the transaction summary shows the wrong amount after saving. "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 0, "br", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        The current workaround is to click 'Refresh' - this properly updates the transaction summary\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](23, 0, null, null, 1, "li", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        The Future Budgets view does not have an accurate total of allocations. Only a dummy value is supplied currently.\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](26, 0, null, null, 1, "li", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        Move the selection of the import format to part of the configuration of the account.\n        By doing this, selecting an account will select the appropriate import format properly.\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], null, null); }
function View_HomeComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-home", [], null, null, null, View_HomeComponent_0, RenderType_HomeComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _home_component__WEBPACK_IMPORTED_MODULE_1__["HomeComponent"], [_shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_2__["MainToolbarService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var HomeComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-home", _home_component__WEBPACK_IMPORTED_MODULE_1__["HomeComponent"], View_HomeComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/home/home.component.ts":
/*!****************************************!*\
  !*** ./src/app/home/home.component.ts ***!
  \****************************************/
/*! exports provided: HomeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponent", function() { return HomeComponent; });
var HomeComponent = /*@__PURE__*/ (function () {
    function HomeComponent(mainToolbarService) {
        this.mainToolbarService = mainToolbarService;
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.mainToolbarService.showToolbar();
    };
    return HomeComponent;
}());




/***/ }),

/***/ "./src/app/login/login.component.ngfactory.js":
/*!****************************************************!*\
  !*** ./src/app/login/login.component.ngfactory.js ***!
  \****************************************************/
/*! exports provided: RenderType_LoginComponent, View_LoginComponent_0, View_LoginComponent_Host_0, LoginComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_LoginComponent", function() { return RenderType_LoginComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_LoginComponent_0", function() { return View_LoginComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_LoginComponent_Host_0", function() { return View_LoginComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponentNgFactory", function() { return LoginComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../node_modules/@angular/material/icon/typings/index.ngfactory */ "./node_modules/@angular/material/icon/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/esm5/icon.es5.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../node_modules/@angular/material/form-field/typings/index.ngfactory */ "./node_modules/@angular/material/form-field/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _login_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./login.component */ "./src/app/login/login.component.ts");
/* harmony import */ var _shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../shared/main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/* harmony import */ var _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../core/auth/auth.service */ "./src/app/core/auth/auth.service.ts");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../message-display/message.service */ "./src/app/message-display/message.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_forms,_.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_.._.._node_modules__angular_material_icon_typings_index.ngfactory,_angular_material_icon,_angular_flex_layout,_.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_material_input,_angular_cdk_platform,_.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_a11y,_login.component,_shared_main_toolbar_main_toolbar.service,_core_auth_auth.service,_message_display_message.service,_angular_router PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_forms,_.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_.._.._node_modules__angular_material_icon_typings_index.ngfactory,_angular_material_icon,_angular_flex_layout,_.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_material_input,_angular_cdk_platform,_.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_a11y,_login.component,_shared_main_toolbar_main_toolbar.service,_core_auth_auth.service,_message_display_message.service,_angular_router PURE_IMPORTS_END */




















var styles_LoginComponent = ["mat-card[_ngcontent-%COMP%] {\n        width: 300px;\n        margin: auto;\n        margin-top: 15px;\n        box-shadow: 10px 10px 10px #888888;\n    }\n    mat-card-actions[_ngcontent-%COMP%] {\n        margin: 0;\n    }\n    mat-toolbar[_ngcontent-%COMP%]{\n        margin-bottom: 15px;\n    }"];
var RenderType_LoginComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_LoginComponent, data: {} });

function View_LoginComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 73, "form", [["novalidate", ""]], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "ngSubmit"], [null, "submit"], [null, "reset"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("submit" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).onSubmit($event) !== false);
                ad = (pd_0 && ad);
            }
            if (("reset" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 3).onReset() !== false);
                ad = (pd_1 && ad);
            }
            if (("ngSubmit" === en)) {
                var pd_2 = (_co.login() !== false);
                ad = (pd_2 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵbf"], [], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 4210688, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgForm"], [[8, null], [8, null]], null, { ngSubmit: "ngSubmit" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ControlContainer"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgForm"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["ControlContainer"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 66, "mat-card", [["class", "mat-card"]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_2__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_2__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_3__["MatCard"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, null, 0, 5, "mat-card-title", [["class", "mat-card-title"], ["color", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_3__["MatCardTitle"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 2, "mat-icon", [["class", "mat-icon"], ["role", "img"]], null, null, null, _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["View_MatIcon_0"], _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_4__["RenderType_MatIcon"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 638976, null, 0, _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__["MatIcon"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__["MatIconRegistry"], [8, null]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["lock "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, [" EveryCent - Log In"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](17, 0, null, 0, 43, "mat-card-content", [["class", "mat-card-content"], ["fxLayout", "column"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](18, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["StyleUtils"]], { layout: [0, "layout"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](19, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_3__["MatCardContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](21, 0, null, null, 18, "mat-input-container", [["class", "mat-input-container mat-form-field"]], [[2, "mat-input-invalid", null], [2, "mat-form-field-invalid", null], [2, "mat-form-field-can-float", null], [2, "mat-form-field-should-float", null], [2, "mat-form-field-hide-placeholder", null], [2, "mat-form-field-disabled", null], [2, "mat-focused", null], [2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], null, null, _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_MatFormField_0"], _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_MatFormField"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](22, 7389184, null, 7, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormField"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"], [2, _angular_material_core__WEBPACK_IMPORTED_MODULE_9__["MAT_LABEL_GLOBAL_OPTIONS"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 1, { _control: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _placeholderChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 3, { _labelChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 4, { _errorChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 5, { _hintChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 6, { _prefixChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 7, { _suffixChildren: 1 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](31, 0, null, 1, 7, "input", [["class", "email mat-input-element mat-form-field-autofill-control"], ["matInput", ""], ["name", "email"], ["placeholder", "Email"], ["type", "text"]], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null], [2, "mat-input-server", null], [1, "id", 0], [8, "placeholder", 0], [8, "disabled", 0], [8, "required", 0], [8, "readOnly", 0], [1, "aria-describedby", 0], [1, "aria-invalid", 0], [1, "aria-required", 0]], [[null, "ngModelChange"], [null, "input"], [null, "blur"], [null, "compositionstart"], [null, "compositionend"], [null, "focus"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("input" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 32)._handleInput($event.target.value) !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 32).onTouched() !== false);
                ad = (pd_1 && ad);
            }
            if (("compositionstart" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 32)._compositionStart() !== false);
                ad = (pd_2 && ad);
            }
            if (("compositionend" === en)) {
                var pd_3 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 32)._compositionEnd($event.target.value) !== false);
                ad = (pd_3 && ad);
            }
            if (("blur" === en)) {
                var pd_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37)._focusChanged(false) !== false);
                ad = (pd_4 && ad);
            }
            if (("focus" === en)) {
                var pd_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37)._focusChanged(true) !== false);
                ad = (pd_5 && ad);
            }
            if (("input" === en)) {
                var pd_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37)._onInput() !== false);
                ad = (pd_6 && ad);
            }
            if (("ngModelChange" === en)) {
                var pd_7 = ((_co.email = $event) !== false);
                ad = (pd_7 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](32, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["COMPOSITION_BUFFER_MODE"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](34, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgModel"], [[2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ControlContainer"]], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"]]], { name: [0, "name"], model: [1, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](36, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](37, 933888, null, 0, _angular_material_input__WEBPACK_IMPORTED_MODULE_10__["MatInput"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_11__["Platform"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgForm"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"]], _angular_material_core__WEBPACK_IMPORTED_MODULE_9__["ErrorStateMatcher"], [8, null]], { placeholder: [0, "placeholder"], type: [1, "type"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, [[1, 4]], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormFieldControl"], null, [_angular_material_input__WEBPACK_IMPORTED_MODULE_10__["MatInput"]]), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](41, 0, null, null, 18, "mat-input-container", [["class", "mat-input-container mat-form-field"]], [[2, "mat-input-invalid", null], [2, "mat-form-field-invalid", null], [2, "mat-form-field-can-float", null], [2, "mat-form-field-should-float", null], [2, "mat-form-field-hide-placeholder", null], [2, "mat-form-field-disabled", null], [2, "mat-focused", null], [2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], null, null, _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_MatFormField_0"], _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_MatFormField"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](42, 7389184, null, 7, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormField"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"], [2, _angular_material_core__WEBPACK_IMPORTED_MODULE_9__["MAT_LABEL_GLOBAL_OPTIONS"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 8, { _control: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 9, { _placeholderChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 10, { _labelChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 11, { _errorChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 12, { _hintChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 13, { _prefixChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 14, { _suffixChildren: 1 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](51, 0, null, 1, 7, "input", [["class", "password mat-input-element mat-form-field-autofill-control"], ["matInput", ""], ["name", "password"], ["placeholder", "Password"], ["type", "password"]], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null], [2, "mat-input-server", null], [1, "id", 0], [8, "placeholder", 0], [8, "disabled", 0], [8, "required", 0], [8, "readOnly", 0], [1, "aria-describedby", 0], [1, "aria-invalid", 0], [1, "aria-required", 0]], [[null, "ngModelChange"], [null, "input"], [null, "blur"], [null, "compositionstart"], [null, "compositionend"], [null, "focus"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("input" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 52)._handleInput($event.target.value) !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 52).onTouched() !== false);
                ad = (pd_1 && ad);
            }
            if (("compositionstart" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 52)._compositionStart() !== false);
                ad = (pd_2 && ad);
            }
            if (("compositionend" === en)) {
                var pd_3 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 52)._compositionEnd($event.target.value) !== false);
                ad = (pd_3 && ad);
            }
            if (("blur" === en)) {
                var pd_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57)._focusChanged(false) !== false);
                ad = (pd_4 && ad);
            }
            if (("focus" === en)) {
                var pd_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57)._focusChanged(true) !== false);
                ad = (pd_5 && ad);
            }
            if (("input" === en)) {
                var pd_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57)._onInput() !== false);
                ad = (pd_6 && ad);
            }
            if (("ngModelChange" === en)) {
                var pd_7 = ((_co.password = $event) !== false);
                ad = (pd_7 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](52, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["COMPOSITION_BUFFER_MODE"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](54, 671744, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgModel"], [[2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ControlContainer"]], [8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"]]], { name: [0, "name"], model: [1, "model"] }, { update: "ngModelChange" }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgModel"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](56, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](57, 933888, null, 0, _angular_material_input__WEBPACK_IMPORTED_MODULE_10__["MatInput"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_11__["Platform"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgForm"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"]], _angular_material_core__WEBPACK_IMPORTED_MODULE_9__["ErrorStateMatcher"], [8, null]], { placeholder: [0, "placeholder"], type: [1, "type"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, [[8, 4]], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormFieldControl"], null, [_angular_material_input__WEBPACK_IMPORTED_MODULE_10__["MatInput"]]), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](62, 0, null, 0, 10, "mat-card-actions", [["class", "mat-card-actions"]], [[2, "mat-card-actions-align-end", null]], null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](63, 16384, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_3__["MatCardActions"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](65, 0, null, null, 2, "button", [["class", "login"], ["color", "primary"], ["mat-raised-button", ""], ["type", "submit"]], [[8, "disabled", 0]], null, null, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](66, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_13__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_11__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_14__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Log In"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](69, 0, null, null, 2, "button", [["color", ""], ["mat-raised-button", ""], ["type", "reset"]], [[8, "disabled", 0]], null, null, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_12__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](70, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_13__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_11__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_14__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Cancel"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; _ck(_v, 13, 0); var currVal_7 = "column"; _ck(_v, 18, 0, currVal_7); var currVal_38 = "email"; var currVal_39 = _co.email; _ck(_v, 34, 0, currVal_38, currVal_39); var currVal_40 = "Email"; var currVal_41 = "text"; _ck(_v, 37, 0, currVal_40, currVal_41); var currVal_72 = "password"; var currVal_73 = _co.password; _ck(_v, 54, 0, currVal_72, currVal_73); var currVal_74 = "Password"; var currVal_75 = "password"; _ck(_v, 57, 0, currVal_74, currVal_75); var currVal_78 = "primary"; _ck(_v, 66, 0, currVal_78); var currVal_80 = ""; _ck(_v, 70, 0, currVal_80); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassUntouched; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassTouched; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassPristine; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassDirty; var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassValid; var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassInvalid; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassPending; _ck(_v, 1, 0, currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6); var currVal_8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._control.errorState; var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._control.errorState; var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._canLabelFloat; var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldLabelFloat(); var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._hideControlPlaceholder(); var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._control.disabled; var currVal_14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._control.focused; var currVal_15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("untouched"); var currVal_16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("touched"); var currVal_17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("pristine"); var currVal_18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("dirty"); var currVal_19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("valid"); var currVal_20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("invalid"); var currVal_21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 22)._shouldForward("pending"); _ck(_v, 21, 1, [currVal_8, currVal_9, currVal_10, currVal_11, currVal_12, currVal_13, currVal_14, currVal_15, currVal_16, currVal_17, currVal_18, currVal_19, currVal_20, currVal_21]); var currVal_22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassUntouched; var currVal_23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassTouched; var currVal_24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassPristine; var currVal_25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassDirty; var currVal_26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassValid; var currVal_27 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassInvalid; var currVal_28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 36).ngClassPending; var currVal_29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37)._isServer; var currVal_30 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).id; var currVal_31 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).placeholder; var currVal_32 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).disabled; var currVal_33 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).required; var currVal_34 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).readonly; var currVal_35 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37)._ariaDescribedby || null); var currVal_36 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).errorState; var currVal_37 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 37).required.toString(); _ck(_v, 31, 1, [currVal_22, currVal_23, currVal_24, currVal_25, currVal_26, currVal_27, currVal_28, currVal_29, currVal_30, currVal_31, currVal_32, currVal_33, currVal_34, currVal_35, currVal_36, currVal_37]); var currVal_42 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._control.errorState; var currVal_43 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._control.errorState; var currVal_44 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._canLabelFloat; var currVal_45 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldLabelFloat(); var currVal_46 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._hideControlPlaceholder(); var currVal_47 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._control.disabled; var currVal_48 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._control.focused; var currVal_49 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("untouched"); var currVal_50 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("touched"); var currVal_51 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("pristine"); var currVal_52 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("dirty"); var currVal_53 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("valid"); var currVal_54 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("invalid"); var currVal_55 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 42)._shouldForward("pending"); _ck(_v, 41, 1, [currVal_42, currVal_43, currVal_44, currVal_45, currVal_46, currVal_47, currVal_48, currVal_49, currVal_50, currVal_51, currVal_52, currVal_53, currVal_54, currVal_55]); var currVal_56 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassUntouched; var currVal_57 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassTouched; var currVal_58 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassPristine; var currVal_59 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassDirty; var currVal_60 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassValid; var currVal_61 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassInvalid; var currVal_62 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).ngClassPending; var currVal_63 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57)._isServer; var currVal_64 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).id; var currVal_65 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).placeholder; var currVal_66 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).disabled; var currVal_67 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).required; var currVal_68 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).readonly; var currVal_69 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57)._ariaDescribedby || null); var currVal_70 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).errorState; var currVal_71 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 57).required.toString(); _ck(_v, 51, 1, [currVal_56, currVal_57, currVal_58, currVal_59, currVal_60, currVal_61, currVal_62, currVal_63, currVal_64, currVal_65, currVal_66, currVal_67, currVal_68, currVal_69, currVal_70, currVal_71]); var currVal_76 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 63).align === "end"); _ck(_v, 62, 0, currVal_76); var currVal_77 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 66).disabled || null); _ck(_v, 65, 0, currVal_77); var currVal_79 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 70).disabled || null); _ck(_v, 69, 0, currVal_79); });
}
function View_LoginComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-login", [], null, null, null, View_LoginComponent_0, RenderType_LoginComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _login_component__WEBPACK_IMPORTED_MODULE_15__["LoginComponent"], [_shared_main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_16__["MainToolbarService"], _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_17__["AuthService"], _message_display_message_service__WEBPACK_IMPORTED_MODULE_18__["MessageService"], _angular_router__WEBPACK_IMPORTED_MODULE_19__["Router"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var LoginComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-login", _login_component__WEBPACK_IMPORTED_MODULE_15__["LoginComponent"], View_LoginComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/login/login.component.ts":
/*!******************************************!*\
  !*** ./src/app/login/login.component.ts ***!
  \******************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
var LoginComponent = /*@__PURE__*/ (function () {
    function LoginComponent(mainToolbarService, authService, messageService, router) {
        this.mainToolbarService = mainToolbarService;
        this.authService = authService;
        this.messageService = messageService;
        this.router = router;
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.mainToolbarService.hideToolbar();
    };
    LoginComponent.prototype.login = function () {
        var _this = this;
        this.messageService.clear();
        return this.authService
            .logIn(this.email, this.password)
            .then(function (result) { return _this.router.navigateByUrl('/'); })
            .catch(function (error) { return _this.messageService.setErrorMessage(error); });
    };
    return LoginComponent;
}());




/***/ }),

/***/ "./src/app/message-display/message.service.ts":
/*!****************************************************!*\
  !*** ./src/app/message-display/message.service.ts ***!
  \****************************************************/
/*! exports provided: MessageType, MessageService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageType", function() { return MessageType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageService", function() { return MessageService; });
var MessageType = /*@__PURE__*/ (function (MessageType) {
    MessageType[MessageType["NONE"] = 0] = "NONE";
    MessageType[MessageType["INFO"] = 1] = "INFO";
    MessageType[MessageType["SUCCESS"] = 2] = "SUCCESS";
    MessageType[MessageType["ERROR"] = 3] = "ERROR";
    return MessageType;
})({});
var MessageService = /*@__PURE__*/ (function () {
    function MessageService(snackbar) {
        this.snackbar = snackbar;
        this._messageText = '';
        this._messageType = MessageType.NONE;
    }
    MessageService.prototype.getMessage = function () {
        return this._messageText;
    };
    MessageService.prototype.getMessageType = function () {
        return this._messageType;
    };
    MessageService.prototype.setMessage = function (newMessage, timeout) {
        var _this = this;
        this._messageText = newMessage;
        this._messageType = MessageType.INFO;
        if (!timeout) {
            timeout = 3000;
        }
        setTimeout(function () {
            _this.clear();
        }, timeout);
        this.snackbar.open(newMessage, null, { duration: 3000 });
    };
    MessageService.prototype.setErrorMessage = function (newMessage) {
        this._messageText = newMessage;
        this._messageType = MessageType.ERROR;
        this.snackbar.open(newMessage, null, { duration: 3000 });
    };
    MessageService.prototype.clear = function () {
        this._messageText = '';
        this._messageType = MessageType.NONE;
    };
    MessageService.prototype.isError = function () {
        return this.getMessageType() === MessageType.ERROR;
    };
    MessageService.prototype.isInfo = function () {
        return this.getMessageType() === MessageType.INFO;
    };
    return MessageService;
}());




/***/ }),

/***/ "./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ngfactory.js":
/*!**************************************************************************************************************!*\
  !*** ./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ngfactory.js ***!
  \**************************************************************************************************************/
/*! exports provided: RenderType_CompactTransactionListComponent, View_CompactTransactionListComponent_0, View_CompactTransactionListComponent_Host_0, CompactTransactionListComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_CompactTransactionListComponent", function() { return RenderType_CompactTransactionListComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_CompactTransactionListComponent_0", function() { return View_CompactTransactionListComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_CompactTransactionListComponent_Host_0", function() { return View_CompactTransactionListComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CompactTransactionListComponentNgFactory", function() { return CompactTransactionListComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _shared_form_date_field_date_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shared/form/date-field/date-field.component.ngfactory */ "./src/app/shared/form/date-field/date-field.component.ngfactory.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _shared_form_date_field_date_field_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/form/date-field/date-field.component */ "./src/app/shared/form/date-field/date-field.component.ts");
/* harmony import */ var _transactions_transaction_date_validator_directive__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../transactions/transaction-date-validator.directive */ "./src/app/transactions/transaction-date-validator.directive.ts");
/* harmony import */ var _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../shared/form/text-field/text-field.component.ngfactory */ "./src/app/shared/form/text-field/text-field.component.ngfactory.js");
/* harmony import */ var _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../shared/form/text-field/text-field.component */ "./src/app/shared/form/text-field/text-field.component.ts");
/* harmony import */ var _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../shared/form/money-field/money-field.component.ngfactory */ "./src/app/shared/form/money-field/money-field.component.ngfactory.js");
/* harmony import */ var _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../shared/form/money-field/money-field.component */ "./src/app/shared/form/money-field/money-field.component.ts");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm5/dialog.es5.js");
/* harmony import */ var _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/card/typings/index.ngfactory */ "./node_modules/@angular/material/card/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _compact_transaction_list_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./compact-transaction-list.component */ "./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._shared_form_date_field_date_field.component.ngfactory,_angular_forms,_.._shared_form_date_field_date_field.component,_.._transactions_transaction_date_validator.directive,_.._shared_form_text_field_text_field.component.ngfactory,_.._shared_form_text_field_text_field.component,_.._shared_form_money_field_money_field.component.ngfactory,_.._shared_form_money_field_money_field.component,_angular_material_dialog,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_angular_common,_angular_flex_layout,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_compact_transaction_list.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._shared_form_date_field_date_field.component.ngfactory,_angular_forms,_.._shared_form_date_field_date_field.component,_.._transactions_transaction_date_validator.directive,_.._shared_form_text_field_text_field.component.ngfactory,_.._shared_form_text_field_text_field.component,_.._shared_form_money_field_money_field.component.ngfactory,_.._shared_form_money_field_money_field.component,_angular_material_dialog,_.._.._.._node_modules__angular_material_card_typings_index.ngfactory,_angular_material_card,_angular_common,_angular_flex_layout,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_compact_transaction_list.component PURE_IMPORTS_END */



















var styles_CompactTransactionListComponent = [".total[_ngcontent-%COMP%] {\n      size: 18px;\n      font-weight: bold;\n      border-top: 2px solid black;\n    }"];
var RenderType_CompactTransactionListComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_CompactTransactionListComponent, data: {} });

function View_CompactTransactionListComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 16, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 3, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, null, 2, "ec-date-field", [], null, null, null, _shared_form_date_field_date_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_DateFieldComponent_0"], _shared_form_date_field_date_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_DateFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_date_field_date_field_component__WEBPACK_IMPORTED_MODULE_3__["DateFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 114688, null, 0, _shared_form_date_field_date_field_component__WEBPACK_IMPORTED_MODULE_3__["DateFieldComponent"], [[2, _transactions_transaction_date_validator_directive__WEBPACK_IMPORTED_MODULE_4__["TransactionDateValidatorDirective"]]], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 3, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, null, 2, "ec-text-field", [], null, null, null, _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_TextFieldComponent_0"], _shared_form_text_field_text_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_TextFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_6__["TextFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](10, 4308992, null, 0, _shared_form_text_field_text_field_component__WEBPACK_IMPORTED_MODULE_6__["TextFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 3, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_8__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](15, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_8__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "]))], function (_ck, _v) { var currVal_0 = _v.context.$implicit.transaction_date; _ck(_v, 5, 0, currVal_0); var currVal_1 = _v.context.$implicit.description; _ck(_v, 10, 0, currVal_1); var currVal_2 = _v.context.$implicit.net_amount; _ck(_v, 15, 0, currVal_2); }, null); }
function View_CompactTransactionListComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 2, "h1", [["class", "mat-dialog-title"], ["mat-dialog-title", ""]], [[8, "id", 0]], null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 81920, null, 0, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__["MatDialogTitle"], [[2, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__["MatDialogRef"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__["MatDialog"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](3, null, ["Transactions for ", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](5, 0, null, null, 43, "mat-card", [["class", "mat-card mat-dialog-content"], ["mat-dialog-content", ""]], null, null, null, _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_10__["View_MatCard_0"], _node_modules_angular_material_card_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_10__["RenderType_MatCard"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 49152, null, 0, _angular_material_card__WEBPACK_IMPORTED_MODULE_11__["MatCard"], [], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](7, 16384, null, 0, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__["MatDialogContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, 0, 38, "table", [["class", "table"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](11, 0, null, null, 13, "thead", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](13, 0, null, null, 10, "tr", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Date"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](18, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Description"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n                "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](21, 0, null, null, 1, "th", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Amount"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](26, 0, null, null, 4, "tbody", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_CompactTransactionListComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](29, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_12__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](32, 0, null, null, 14, "tbody", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](34, 0, null, null, 11, "tr", [["class", "total"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](36, 0, null, null, 0, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](38, 0, null, null, 1, "td", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Total"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n              "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](41, 0, null, null, 3, "td", [["class", "right"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](42, 0, null, null, 2, "ec-money-field", [], null, null, null, _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_MoneyFieldComponent_0"], _shared_form_money_field_money_field_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_MoneyFieldComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_8__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](44, 114688, null, 0, _shared_form_money_field_money_field_component__WEBPACK_IMPORTED_MODULE_8__["MoneyFieldComponent"], [], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](50, 0, null, null, 8, "div", [["class", "mat-dialog-actions"], ["fxLayout", "row"], ["fxLayoutAlign", "end"], ["mat-dialog-actions", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](51, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["LayoutDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["StyleUtils"]], { layout: [0, "layout"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](52, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["LayoutAlignDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_13__["StyleUtils"]], { align: [0, "align"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](53, 16384, null, 0, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__["MatDialogActions"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](55, 0, null, null, 2, "button", [["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.close() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_14__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_14__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](56, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_15__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_16__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_17__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Close"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; _ck(_v, 2, 0); var currVal_2 = _co.transactions; _ck(_v, 29, 0, currVal_2); var currVal_3 = _co.transactionTotal(); _ck(_v, 44, 0, currVal_3); var currVal_4 = "row"; _ck(_v, 51, 0, currVal_4); var currVal_5 = "end"; _ck(_v, 52, 0, currVal_5); var currVal_7 = "primary"; _ck(_v, 56, 0, currVal_7); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 2).id; _ck(_v, 1, 0, currVal_0); var currVal_1 = _co.itemName; _ck(_v, 3, 0, currVal_1); var currVal_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 56).disabled || null); _ck(_v, 55, 0, currVal_6); });
}
function View_CompactTransactionListComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-compact-transaction-list", [], null, null, null, View_CompactTransactionListComponent_0, RenderType_CompactTransactionListComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _compact_transaction_list_component__WEBPACK_IMPORTED_MODULE_18__["CompactTransactionListComponent"], [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_9__["MatDialogRef"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var CompactTransactionListComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-compact-transaction-list", _compact_transaction_list_component__WEBPACK_IMPORTED_MODULE_18__["CompactTransactionListComponent"], View_CompactTransactionListComponent_Host_0, { transactions: "transactions", itemName: "itemName" }, {}, []);




/***/ }),

/***/ "./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ts":
/*!****************************************************************************************************!*\
  !*** ./src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ts ***!
  \****************************************************************************************************/
/*! exports provided: CompactTransactionListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CompactTransactionListComponent", function() { return CompactTransactionListComponent; });
/* harmony import */ var _util_total__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/total */ "./src/app/util/total.ts");

var CompactTransactionListComponent = /*@__PURE__*/ (function () {
    function CompactTransactionListComponent(dialogRef) {
        this.dialogRef = dialogRef;
    }
    CompactTransactionListComponent.prototype.ngOnInit = function () {
    };
    CompactTransactionListComponent.prototype.close = function () {
        this.dialogRef.close();
    };
    CompactTransactionListComponent.prototype.transactionTotal = function () {
        return Object(_util_total__WEBPACK_IMPORTED_MODULE_0__["total"])(this.transactions, 'net_amount');
    };
    return CompactTransactionListComponent;
}());




/***/ }),

/***/ "./src/app/shared-transactions/shared-transaction.service.ts":
/*!*******************************************************************!*\
  !*** ./src/app/shared-transactions/shared-transaction.service.ts ***!
  \*******************************************************************/
/*! exports provided: SharedTransactionService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SharedTransactionService", function() { return SharedTransactionService; });
var SharedTransactionService = /*@__PURE__*/ (function () {
    function SharedTransactionService(apiGateway) {
        this.apiGateway = apiGateway;
    }
    SharedTransactionService.prototype.transactionsForAllocation = function (allocation_id) {
        return this.apiGateway
            .get('/transactions/by_allocation', { allocation_id: allocation_id });
    };
    SharedTransactionService.prototype.getTransactionsForSinkFundAllocation = function (sink_fund_allocation_id) {
        return this.apiGateway
            .get('/transactions/by_sink_fund_allocation', { sink_fund_allocation_id: sink_fund_allocation_id });
    };
    return SharedTransactionService;
}());




/***/ }),

/***/ "./src/app/shared-transactions/shared-transactions.module.ts":
/*!*******************************************************************!*\
  !*** ./src/app/shared-transactions/shared-transactions.module.ts ***!
  \*******************************************************************/
/*! exports provided: SharedTransactionsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SharedTransactionsModule", function() { return SharedTransactionsModule; });
var SharedTransactionsModule = /*@__PURE__*/ (function () {
    function SharedTransactionsModule() {
    }
    return SharedTransactionsModule;
}());




/***/ }),

/***/ "./src/app/shared/confirmation.service.ts":
/*!************************************************!*\
  !*** ./src/app/shared/confirmation.service.ts ***!
  \************************************************/
/*! exports provided: ConfirmationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfirmationService", function() { return ConfirmationService; });
/* harmony import */ var _confirmation_confirmation_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./confirmation/confirmation.component */ "./src/app/shared/confirmation/confirmation.component.ts");

var ConfirmationService = /*@__PURE__*/ (function () {
    function ConfirmationService(dialog) {
        this.dialog = dialog;
        this.defaultConfig = {
            title: 'Are you sure?',
            question: 'Are you sure?',
            emitNegativeAnswers: true
        };
    }
    ConfirmationService.prototype.ask = function (confirmationConfig) {
        var config = Object.assign({}, this.defaultConfig, confirmationConfig);
        var dialogRef = this.dialog.open(_confirmation_confirmation_component__WEBPACK_IMPORTED_MODULE_0__["ConfirmationComponent"]);
        dialogRef.componentInstance.title = config.title;
        dialogRef.componentInstance.question = config.question;
        if (config.emitNegativeAnswers) {
            return dialogRef.afterClosed();
        }
        else {
            return dialogRef.afterClosed().filter(function (response) { return response; });
        }
    };
    return ConfirmationService;
}());




/***/ }),

/***/ "./src/app/shared/confirmation/confirmation.component.ngfactory.js":
/*!*************************************************************************!*\
  !*** ./src/app/shared/confirmation/confirmation.component.ngfactory.js ***!
  \*************************************************************************/
/*! exports provided: RenderType_ConfirmationComponent, View_ConfirmationComponent_0, View_ConfirmationComponent_Host_0, ConfirmationComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_ConfirmationComponent", function() { return RenderType_ConfirmationComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_ConfirmationComponent_0", function() { return View_ConfirmationComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_ConfirmationComponent_Host_0", function() { return View_ConfirmationComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfirmationComponentNgFactory", function() { return ConfirmationComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm5/dialog.es5.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _confirmation_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./confirmation.component */ "./src/app/shared/confirmation/confirmation.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_material_dialog,_angular_flex_layout,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_confirmation.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_material_dialog,_angular_flex_layout,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_confirmation.component PURE_IMPORTS_END */








var styles_ConfirmationComponent = [];
var RenderType_ConfirmationComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 2, styles: styles_ConfirmationComponent, data: {} });

function View_ConfirmationComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 2, "h1", [["class", "mat-dialog-title"], ["mat-dialog-title", ""]], [[8, "id", 0]], null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 81920, null, 0, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogTitle"], [[2, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"]], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialog"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](3, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](5, 0, null, null, 2, "div", [["class", "mat-dialog-content"], ["mat-dialog-content", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 16384, null, 0, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogContent"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](7, null, ["\n      ", "\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](9, 0, null, null, 15, "div", [["class", "mat-dialog-actions"], ["mat-dialog-actions", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](10, 16384, null, 0, _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogActions"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, null, 11, "div", [["class", "actions"], ["fxLayout", "row"], ["fxLayoutAlign", "space-around"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["LayoutDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["StyleUtils"]], { layout: [0, "layout"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](14, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["LayoutAlignDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_2__["StyleUtils"]], { align: [0, "align"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](16, 0, null, null, 2, "button", [["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.yes() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](17, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_5__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_6__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["Yes"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 2, "button", [["color", "warn"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.no() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](21, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_5__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_6__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["No"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { _ck(_v, 2, 0); var currVal_3 = "row"; _ck(_v, 13, 0, currVal_3); var currVal_4 = "space-around"; _ck(_v, 14, 0, currVal_4); var currVal_6 = "primary"; _ck(_v, 17, 0, currVal_6); var currVal_8 = "warn"; _ck(_v, 21, 0, currVal_8); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 2).id; _ck(_v, 1, 0, currVal_0); var currVal_1 = _co.title; _ck(_v, 3, 0, currVal_1); var currVal_2 = _co.question; _ck(_v, 7, 0, currVal_2); var currVal_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 17).disabled || null); _ck(_v, 16, 0, currVal_5); var currVal_7 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 21).disabled || null); _ck(_v, 20, 0, currVal_7); });
}
function View_ConfirmationComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-confirmation", [], null, null, null, View_ConfirmationComponent_0, RenderType_ConfirmationComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _confirmation_component__WEBPACK_IMPORTED_MODULE_7__["ConfirmationComponent"], [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogRef"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var ConfirmationComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-confirmation", _confirmation_component__WEBPACK_IMPORTED_MODULE_7__["ConfirmationComponent"], View_ConfirmationComponent_Host_0, { title: "title", question: "question" }, {}, []);




/***/ }),

/***/ "./src/app/shared/confirmation/confirmation.component.ts":
/*!***************************************************************!*\
  !*** ./src/app/shared/confirmation/confirmation.component.ts ***!
  \***************************************************************/
/*! exports provided: ConfirmationComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfirmationComponent", function() { return ConfirmationComponent; });
var ConfirmationComponent = /*@__PURE__*/ (function () {
    function ConfirmationComponent(dialogRef) {
        this.dialogRef = dialogRef;
        this.title = 'Are you sure?';
        this.question = 'Are you sure?';
    }
    ConfirmationComponent.prototype.ngOnInit = function () {
    };
    ConfirmationComponent.prototype.yes = function () {
        this.dialogRef.close(true);
    };
    ConfirmationComponent.prototype.no = function () {
        this.dialogRef.close(false);
    };
    return ConfirmationComponent;
}());




/***/ }),

/***/ "./src/app/shared/deactivate-button/deactivate.service.ts":
/*!****************************************************************!*\
  !*** ./src/app/shared/deactivate-button/deactivate.service.ts ***!
  \****************************************************************/
/*! exports provided: DeactivateService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeactivateService", function() { return DeactivateService; });
var DeactivateService = /*@__PURE__*/ (function () {
    function DeactivateService() {
    }
    DeactivateService.prototype.isItemVisible = function (item, showDeactivated) {
        if (showDeactivated) {
            return true;
        }
        return item.unsaved || item.status === 'open';
    };
    return DeactivateService;
}());




/***/ }),

/***/ "./src/app/shared/delete-button/delete-button.component.ngfactory.js":
/*!***************************************************************************!*\
  !*** ./src/app/shared/delete-button/delete-button.component.ngfactory.js ***!
  \***************************************************************************/
/*! exports provided: RenderType_DeleteButtonComponent, View_DeleteButtonComponent_0, View_DeleteButtonComponent_Host_0, DeleteButtonComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_DeleteButtonComponent", function() { return RenderType_DeleteButtonComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_DeleteButtonComponent_0", function() { return View_DeleteButtonComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_DeleteButtonComponent_Host_0", function() { return View_DeleteButtonComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeleteButtonComponentNgFactory", function() { return DeleteButtonComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ec-icon/ec-icon.component.ngfactory */ "./src/app/shared/ec-icon/ec-icon.component.ngfactory.js");
/* harmony import */ var _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ec-icon/ec-icon.component */ "./src/app/shared/ec-icon/ec-icon.component.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _delete_button_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./delete-button.component */ "./src/app/shared/delete-button/delete-button.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_angular_common,_delete_button.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_angular_common,_delete_button.component PURE_IMPORTS_END */





var styles_DeleteButtonComponent = ["span[_ngcontent-%COMP%] {\n        cursor: pointer;\n    }"];
var RenderType_DeleteButtonComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_DeleteButtonComponent, data: {} });

function View_DeleteButtonComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 4, "span", [], null, [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.toggle() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](2, 0, null, null, 1, "ec-icon", [], null, null, null, _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_EcIconComponent_0"], _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_EcIconComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 114688, null, 0, _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_2__["EcIconComponent"], [], { icon: [0, "icon"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.icon; _ck(_v, 3, 0, currVal_0); }, null);
}
function View_DeleteButtonComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_DeleteButtonComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.editMode; _ck(_v, 2, 0, currVal_0); }, null); }
function View_DeleteButtonComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-delete-button", [], null, null, null, View_DeleteButtonComponent_0, RenderType_DeleteButtonComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _delete_button_component__WEBPACK_IMPORTED_MODULE_4__["DeleteButtonComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var DeleteButtonComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-delete-button", _delete_button_component__WEBPACK_IMPORTED_MODULE_4__["DeleteButtonComponent"], View_DeleteButtonComponent_Host_0, { item: "item", icon: "icon", editMode: "editMode" }, {}, []);




/***/ }),

/***/ "./src/app/shared/delete-button/delete-button.component.ts":
/*!*****************************************************************!*\
  !*** ./src/app/shared/delete-button/delete-button.component.ts ***!
  \*****************************************************************/
/*! exports provided: DeleteButtonComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeleteButtonComponent", function() { return DeleteButtonComponent; });
/* harmony import */ var _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ec-icon/icon.type */ "./src/app/shared/ec-icon/icon.type.ts");

var DeleteButtonComponent = /*@__PURE__*/ (function () {
    function DeleteButtonComponent() {
        this.editMode = false;
    }
    Object.defineProperty(DeleteButtonComponent.prototype, "icon", {
        get: function () {
            if (this.item && this.item.deleted) {
                return _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_0__["Icon"].UNDO_DELETE;
            }
            else {
                return _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_0__["Icon"].DELETE;
            }
        },
        enumerable: true,
        configurable: true
    });
    DeleteButtonComponent.prototype.ngOnInit = function () {
    };
    DeleteButtonComponent.prototype.toggle = function () {
        this.item.deleted = !this.item.deleted;
    };
    return DeleteButtonComponent;
}());




/***/ }),

/***/ "./src/app/shared/ec-icon/ec-icon.component.ngfactory.js":
/*!***************************************************************!*\
  !*** ./src/app/shared/ec-icon/ec-icon.component.ngfactory.js ***!
  \***************************************************************/
/*! exports provided: RenderType_EcIconComponent, View_EcIconComponent_0, View_EcIconComponent_Host_0, EcIconComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_EcIconComponent", function() { return RenderType_EcIconComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_EcIconComponent_0", function() { return View_EcIconComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_EcIconComponent_Host_0", function() { return View_EcIconComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EcIconComponentNgFactory", function() { return EcIconComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/icon/typings/index.ngfactory */ "./node_modules/@angular/material/icon/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/esm5/icon.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _ec_icon_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ec-icon.component */ "./src/app/shared/ec-icon/ec-icon.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_.._.._.._node_modules__angular_material_icon_typings_index.ngfactory,_angular_material_icon,_angular_common,_ec_icon.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_.._.._.._node_modules__angular_material_icon_typings_index.ngfactory,_angular_material_icon,_angular_common,_ec_icon.component PURE_IMPORTS_END */









var styles_EcIconComponent = ["mat-icon[_ngcontent-%COMP%] {\n        margin-right: 5px;\n    }"];
var RenderType_EcIconComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_EcIconComponent, data: {} });

function View_EcIconComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 6, "button", [["mat-icon-button", ""]], [[8, "disabled", 0]], null, null, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](3, 0, null, 0, 2, "mat-icon", [["class", "mat-icon"], ["role", "img"]], null, null, null, _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatIcon_0"], _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatIcon"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](4, 638976, null, 0, _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__["MatIcon"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__["MatIconRegistry"], [8, null]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](5, 0, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "]))], function (_ck, _v) { _ck(_v, 4, 0); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).disabled || null); _ck(_v, 0, 0, currVal_0); var currVal_1 = _co.icon; _ck(_v, 5, 0, currVal_1); }); }
function View_EcIconComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "mat-icon", [["class", "mat-icon"], ["role", "img"]], null, null, null, _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatIcon_0"], _node_modules_angular_material_icon_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatIcon"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 638976, null, 0, _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__["MatIcon"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__["MatIconRegistry"], [8, null]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, 0, ["", ""]))], function (_ck, _v) { _ck(_v, 1, 0); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.icon; _ck(_v, 2, 0, currVal_0); }); }
function View_EcIconComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_EcIconComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      \n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_EcIconComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = (_co.iconType == "button"); _ck(_v, 2, 0, currVal_0); var currVal_1 = (_co.iconType !== "button"); _ck(_v, 5, 0, currVal_1); }, null); }
function View_EcIconComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-icon", [], null, null, null, View_EcIconComponent_0, RenderType_EcIconComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _ec_icon_component__WEBPACK_IMPORTED_MODULE_8__["EcIconComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var EcIconComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-icon", _ec_icon_component__WEBPACK_IMPORTED_MODULE_8__["EcIconComponent"], View_EcIconComponent_Host_0, { icon: "icon", iconType: "iconType" }, {}, []);




/***/ }),

/***/ "./src/app/shared/ec-icon/ec-icon.component.ts":
/*!*****************************************************!*\
  !*** ./src/app/shared/ec-icon/ec-icon.component.ts ***!
  \*****************************************************/
/*! exports provided: EcIconComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EcIconComponent", function() { return EcIconComponent; });
var EcIconComponent = /*@__PURE__*/ (function () {
    function EcIconComponent() {
    }
    EcIconComponent.prototype.ngOnInit = function () {
    };
    return EcIconComponent;
}());




/***/ }),

/***/ "./src/app/shared/ec-icon/icon.type.ts":
/*!*********************************************!*\
  !*** ./src/app/shared/ec-icon/icon.type.ts ***!
  \*********************************************/
/*! exports provided: Icon */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Icon", function() { return Icon; });
var Icon = {
    HOME: "home",
    BUDGETS: "local_atm",
    BUDGETS_FUTURE: "timeline",
    BUDGETS_CURRENT: "new_releases",
    SINK_FUND: "card_membership",
    ACCOUNT_BALANCES: "account_balance",
    TRANSACTIONS: "euro_symbol",
    LOGOUT: "account_circle",
    MENU: "menu",
    SHOW_TRANSACTIONS: "monetization_on",
    DELETE: "delete_forever",
    UNDO_DELETE: "refresh",
    DEACTIVATE: "archive",
    ACTIVATE: "unarchive",
};



/***/ }),

/***/ "./src/app/shared/ec-material/ec-material.module.ts":
/*!**********************************************************!*\
  !*** ./src/app/shared/ec-material/ec-material.module.ts ***!
  \**********************************************************/
/*! exports provided: EcMaterialModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EcMaterialModule", function() { return EcMaterialModule; });
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_0__);

var EcMaterialModule = /*@__PURE__*/ (function () {
    function EcMaterialModule() {
    }
    return EcMaterialModule;
}());




/***/ }),

/***/ "./src/app/shared/edit-actions/edit-actions.component.ngfactory.js":
/*!*************************************************************************!*\
  !*** ./src/app/shared/edit-actions/edit-actions.component.ngfactory.js ***!
  \*************************************************************************/
/*! exports provided: RenderType_EditActionsComponent, View_EditActionsComponent_0, View_EditActionsComponent_Host_0, EditActionsComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_EditActionsComponent", function() { return RenderType_EditActionsComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_EditActionsComponent_0", function() { return View_EditActionsComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_EditActionsComponent_Host_0", function() { return View_EditActionsComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditActionsComponentNgFactory", function() { return EditActionsComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/button/typings/index.ngfactory */ "./node_modules/@angular/material/button/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/cdk/a11y */ "./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _edit_actions_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./edit-actions.component */ "./src/app/shared/edit-actions/edit-actions.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_angular_common,_angular_flex_layout,_edit_actions.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_button_typings_index.ngfactory,_angular_material_button,_angular_cdk_platform,_angular_cdk_a11y,_angular_common,_angular_flex_layout,_edit_actions.component PURE_IMPORTS_END */








var styles_EditActionsComponent = ["div.button-container[_ngcontent-%COMP%] {\n        margin-left: 15px;\n        margin-right: 15px;\n    }"];
var RenderType_EditActionsComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_EditActionsComponent, data: {} });

function View_EditActionsComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "button", [["class", "make-changes"], ["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.switchToEditMode() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n            Make Changes\n        "]))], function (_ck, _v) { var currVal_1 = "primary"; _ck(_v, 1, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).disabled || null); _ck(_v, 0, 0, currVal_0); });
}
function View_EditActionsComponent_2(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "button", [["class", "save"], ["color", "primary"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.save.emit() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n                Save Changes\n            "]))], function (_ck, _v) { var currVal_1 = "primary"; _ck(_v, 1, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).disabled || null); _ck(_v, 0, 0, currVal_0); });
}
function View_EditActionsComponent_3(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "button", [["class", "cancel"], ["color", "warn"], ["mat-raised-button", ""]], [[8, "disabled", 0]], [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.cancelEdit() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatButton_0"], _node_modules_angular_material_button_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatButton"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 180224, null, 0, _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_3__["Platform"], _angular_cdk_a11y__WEBPACK_IMPORTED_MODULE_4__["FocusMonitor"]], { color: [0, "color"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n                Cancel\n            "]))], function (_ck, _v) { var currVal_1 = "warn"; _ck(_v, 1, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).disabled || null); _ck(_v, 0, 0, currVal_0); });
}
function View_EditActionsComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 17, "div", [["class", "button-container"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_EditActionsComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](4, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n        "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵncd"](null, 0), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](8, 0, null, null, 9, "div", [["fxLayout", "row"], ["fxLayoutAlign", "end"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](9, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["StyleUtils"]], { layout: [0, "layout"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](10, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutAlignDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["MediaMonitor"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["LayoutDirective"]], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_6__["StyleUtils"]], { align: [0, "align"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_EditActionsComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_EditActionsComponent_3)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = !_co.editMode; _ck(_v, 4, 0, currVal_0); var currVal_1 = "row"; _ck(_v, 9, 0, currVal_1); var currVal_2 = "end"; _ck(_v, 10, 0, currVal_2); var currVal_3 = _co.editMode; _ck(_v, 13, 0, currVal_3); var currVal_4 = _co.editMode; _ck(_v, 16, 0, currVal_4); }, null); }
function View_EditActionsComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-edit-actions", [], null, null, null, View_EditActionsComponent_0, RenderType_EditActionsComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _edit_actions_component__WEBPACK_IMPORTED_MODULE_7__["EditActionsComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var EditActionsComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-edit-actions", _edit_actions_component__WEBPACK_IMPORTED_MODULE_7__["EditActionsComponent"], View_EditActionsComponent_Host_0, { editMode: "editMode" }, { editModeChange: "editModeChange", save: "save", cancel: "cancel" }, ["*"]);




/***/ }),

/***/ "./src/app/shared/edit-actions/edit-actions.component.ts":
/*!***************************************************************!*\
  !*** ./src/app/shared/edit-actions/edit-actions.component.ts ***!
  \***************************************************************/
/*! exports provided: EditActionsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditActionsComponent", function() { return EditActionsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");

var EditActionsComponent = /*@__PURE__*/ (function () {
    function EditActionsComponent() {
        this.editMode = false;
        this.editModeChange = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.save = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.cancel = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    EditActionsComponent.prototype.ngOnInit = function () {
    };
    EditActionsComponent.prototype.switchToEditMode = function () {
        this.editMode = true;
        this.editModeChange.emit(this.editMode);
    };
    EditActionsComponent.prototype.cancelEdit = function () {
        this.editMode = false;
        this.editModeChange.emit(this.editMode);
        this.cancel.emit();
    };
    return EditActionsComponent;
}());




/***/ }),

/***/ "./src/app/shared/form/date-field/date-field.component.ngfactory.js":
/*!**************************************************************************!*\
  !*** ./src/app/shared/form/date-field/date-field.component.ngfactory.js ***!
  \**************************************************************************/
/*! exports provided: RenderType_DateFieldComponent, View_DateFieldComponent_0, View_DateFieldComponent_Host_0, DateFieldComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_DateFieldComponent", function() { return RenderType_DateFieldComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_DateFieldComponent_0", function() { return View_DateFieldComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_DateFieldComponent_Host_0", function() { return View_DateFieldComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DateFieldComponentNgFactory", function() { return DateFieldComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../node_modules/@angular/material/form-field/typings/index.ngfactory */ "./node_modules/@angular/material/form-field/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _date_field_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./date-field.component */ "./src/app/shared/form/date-field/date-field.component.ts");
/* harmony import */ var _transactions_transaction_date_validator_directive__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../transactions/transaction-date-validator.directive */ "./src/app/transactions/transaction-date-validator.directive.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_forms,_angular_material_input,_angular_cdk_platform,_angular_common,_date_field.component,_.._.._transactions_transaction_date_validator.directive PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_forms,_angular_material_input,_angular_cdk_platform,_angular_common,_date_field.component,_.._.._transactions_transaction_date_validator.directive PURE_IMPORTS_END */










var styles_DateFieldComponent = [""];
var RenderType_DateFieldComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_DateFieldComponent, data: {} });

function View_DateFieldComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 22, "mat-form-field", [["class", "mat-input-container mat-form-field"]], [[2, "mat-input-invalid", null], [2, "mat-form-field-invalid", null], [2, "mat-form-field-can-float", null], [2, "mat-form-field-should-float", null], [2, "mat-form-field-hide-placeholder", null], [2, "mat-form-field-disabled", null], [2, "mat-focused", null], [2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], null, null, _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatFormField_0"], _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatFormField"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 7389184, null, 7, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormField"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"], [2, _angular_material_core__WEBPACK_IMPORTED_MODULE_3__["MAT_LABEL_GLOBAL_OPTIONS"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 1, { _control: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _placeholderChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 3, { _labelChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 4, { _errorChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 5, { _hintChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 6, { _prefixChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 7, { _suffixChildren: 1 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, [["input", 1]], 1, 7, "input", [["class", "value mat-input-element mat-form-field-autofill-control"], ["matInput", ""], ["type", "date"]], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null], [2, "mat-input-server", null], [1, "id", 0], [8, "placeholder", 0], [8, "disabled", 0], [8, "required", 0], [8, "readOnly", 0], [1, "aria-describedby", 0], [1, "aria-invalid", 0], [1, "aria-required", 0]], [[null, "input"], [null, "blur"], [null, "compositionstart"], [null, "compositionend"], [null, "focus"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("input" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._handleInput($event.target.value) !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11).onTouched() !== false);
                ad = (pd_1 && ad);
            }
            if (("compositionstart" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._compositionStart() !== false);
                ad = (pd_2 && ad);
            }
            if (("compositionend" === en)) {
                var pd_3 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._compositionEnd($event.target.value) !== false);
                ad = (pd_3 && ad);
            }
            if (("blur" === en)) {
                var pd_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._focusChanged(false) !== false);
                ad = (pd_4 && ad);
            }
            if (("focus" === en)) {
                var pd_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._focusChanged(true) !== false);
                ad = (pd_5 && ad);
            }
            if (("input" === en)) {
                var pd_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._onInput() !== false);
                ad = (pd_6 && ad);
            }
            if (("input" === en)) {
                var pd_7 = ((_co.value = _co.Date.parse(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10).value)) !== false);
                ad = (pd_7 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["COMPOSITION_BUFFER_MODE"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 540672, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControlDirective"], [[8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"]]], { form: [0, "form"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControlDirective"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](15, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 933888, null, 0, _angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__["Platform"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgForm"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormGroupDirective"]], _angular_material_core__WEBPACK_IMPORTED_MODULE_3__["ErrorStateMatcher"], [8, null]], { type: [0, "type"], value: [1, "value"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, [[1, 4]], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldControl"], null, [_angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"]]), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](19, 0, null, 5, 2, "mat-error", [["class", "mat-error"], ["role", "alert"]], [[1, "id", 0]], null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](20, 16384, [[4, 4]], 0, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatError"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Date is outside of budget range"])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n      "]))], function (_ck, _v) { var _co = _v.component; var currVal_30 = _co.control; _ck(_v, 13, 0, currVal_30); var currVal_31 = "date"; var currVal_32 = _co.value; _ck(_v, 16, 0, currVal_31, currVal_32); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.errorState; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.errorState; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._canLabelFloat; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldLabelFloat(); var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._hideControlPlaceholder(); var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.disabled; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.focused; var currVal_7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("untouched"); var currVal_8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("touched"); var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("pristine"); var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("dirty"); var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("valid"); var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("invalid"); var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("pending"); _ck(_v, 0, 1, [currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6, currVal_7, currVal_8, currVal_9, currVal_10, currVal_11, currVal_12, currVal_13]); var currVal_14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassUntouched; var currVal_15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassTouched; var currVal_16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassPristine; var currVal_17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassDirty; var currVal_18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassValid; var currVal_19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassInvalid; var currVal_20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassPending; var currVal_21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._isServer; var currVal_22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).id; var currVal_23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).placeholder; var currVal_24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).disabled; var currVal_25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).required; var currVal_26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).readonly; var currVal_27 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._ariaDescribedby || null); var currVal_28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).errorState; var currVal_29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).required.toString(); _ck(_v, 10, 1, [currVal_14, currVal_15, currVal_16, currVal_17, currVal_18, currVal_19, currVal_20, currVal_21, currVal_22, currVal_23, currVal_24, currVal_25, currVal_26, currVal_27, currVal_28, currVal_29]); var currVal_33 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 20).id; _ck(_v, 19, 0, currVal_33); });
}
function View_DateFieldComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 2, "span", [["class", "value"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, null, ["", ""])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](3, 2), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 2, 0, _ck(_v, 3, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent, 0), _co.value, "mediumDate")); _ck(_v, 2, 0, currVal_0); }); }
function View_DateFieldComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _angular_common__WEBPACK_IMPORTED_MODULE_7__["DatePipe"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["LOCALE_ID"]]), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_DateFieldComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"], ngIfElse: [1, "ngIfElse"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](0, [["textDisplay", 2]], null, 0, null, View_DateFieldComponent_2)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.editMode; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5); _ck(_v, 3, 0, currVal_0, currVal_1); }, null); }
function View_DateFieldComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "ec-date-field", [], null, null, null, View_DateFieldComponent_0, RenderType_DateFieldComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_date_field_component__WEBPACK_IMPORTED_MODULE_8__["DateFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 114688, null, 0, _date_field_component__WEBPACK_IMPORTED_MODULE_8__["DateFieldComponent"], [[2, _transactions_transaction_date_validator_directive__WEBPACK_IMPORTED_MODULE_9__["TransactionDateValidatorDirective"]]], null, null)], function (_ck, _v) { _ck(_v, 2, 0); }, null); }
var DateFieldComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-date-field", _date_field_component__WEBPACK_IMPORTED_MODULE_8__["DateFieldComponent"], View_DateFieldComponent_Host_0, { value: "value", editMode: "editMode", budget: "ecValidateWithinBudget", errorMessage: "errorMessage" }, {}, []);




/***/ }),

/***/ "./src/app/shared/form/date-field/date-field.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/shared/form/date-field/date-field.component.ts ***!
  \****************************************************************/
/*! exports provided: DateFieldComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DateFieldComponent", function() { return DateFieldComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");

var DateFieldComponent = /*@__PURE__*/ (function () {
    function DateFieldComponent(validator) {
        this.validator = validator;
        // TODO: this should NOT be needed
        this.budget = {};
        this.control = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"]();
        this.onChange = function (_) { };
        this.onTouch = function () { };
    }
    DateFieldComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.control.valueChanges.subscribe(function (v) {
            if (_this.validator) {
                var errors = _this.validator.validate(_this.control);
                _this.control.setErrors(errors);
            }
            _this.onChange(v);
        });
    };
    DateFieldComponent.prototype.writeValue = function (newValue) {
        this.value = newValue;
    };
    DateFieldComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    DateFieldComponent.prototype.registerOnTouched = function (fn) {
        this.onTouch = fn;
    };
    DateFieldComponent.prototype.setDisabledState = function (isDisabled) {
    };
    return DateFieldComponent;
}());




/***/ }),

/***/ "./src/app/shared/form/list-field/list-field.component.ngfactory.js":
/*!**************************************************************************!*\
  !*** ./src/app/shared/form/list-field/list-field.component.ngfactory.js ***!
  \**************************************************************************/
/*! exports provided: RenderType_ListFieldComponent, View_ListFieldComponent_0, View_ListFieldComponent_Host_0, ListFieldComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_ListFieldComponent", function() { return RenderType_ListFieldComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_ListFieldComponent_0", function() { return View_ListFieldComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_ListFieldComponent_Host_0", function() { return View_ListFieldComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListFieldComponentNgFactory", function() { return ListFieldComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _list_field_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./list-field.component */ "./src/app/shared/form/list-field/list-field.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_forms,_angular_common,_list_field.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_forms,_angular_common,_list_field.component PURE_IMPORTS_END */




var styles_ListFieldComponent = ["select[_ngcontent-%COMP%] {\n      width: 100%;\n    }"];
var RenderType_ListFieldComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_ListFieldComponent, data: {} });

function View_ListFieldComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 0, null, null, null, null, null, null, null))], null, null); }
function View_ListFieldComponent_5(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 3, "option", [], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 147456, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgSelectOption"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["SelectControlValueAccessor"]]], { value: [0, "value"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 147456, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵq"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], [8, null]], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](3, null, ["\n            ", "\n          "]))], function (_ck, _v) { var currVal_0 = _v.context.$implicit.id; _ck(_v, 1, 0, currVal_0); var currVal_1 = _v.context.$implicit.id; _ck(_v, 2, 0, currVal_1); }, function (_ck, _v) { var currVal_2 = _v.context.$implicit.name; _ck(_v, 3, 0, currVal_2); }); }
function View_ListFieldComponent_4(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 4, "optgroup", [], [[8, "label", 0]], null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_ListFieldComponent_5)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "]))], function (_ck, _v) { var currVal_1 = _v.context.$implicit.items; _ck(_v, 3, 0, currVal_1); }, function (_ck, _v) { var currVal_0 = _v.context.$implicit.name; _ck(_v, 0, 0, currVal_0); }); }
function View_ListFieldComponent_3(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_ListFieldComponent_4)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.groups; var currVal_1 = _co.trackById; _ck(_v, 2, 0, currVal_0, currVal_1); }, null); }
function View_ListFieldComponent_7(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 3, "option", [], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 147456, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgSelectOption"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["SelectControlValueAccessor"]]], { value: [0, "value"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 147456, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵq"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], [8, null]], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](3, null, ["\n          ", "\n        "]))], function (_ck, _v) { var currVal_0 = _v.context.$implicit.id; _ck(_v, 1, 0, currVal_0); var currVal_1 = _v.context.$implicit.id; _ck(_v, 2, 0, currVal_1); }, function (_ck, _v) { var currVal_2 = _v.context.$implicit.name; _ck(_v, 3, 0, currVal_2); }); }
function View_ListFieldComponent_6(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_ListFieldComponent_7)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"], ngForTrackBy: [1, "ngForTrackBy"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.items; var currVal_1 = _co.trackById; _ck(_v, 2, 0, currVal_0, currVal_1); }, null); }
function View_ListFieldComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 20, "select", [], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], [[null, "change"], [null, "blur"]], function (_v, en, $event) {
            var ad = true;
            if (("change" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).onChange($event.target.value) !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).onTouched() !== false);
                ad = (pd_1 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["SelectControlValueAccessor"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["SelectControlValueAccessor"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 540672, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlDirective"], [[8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"]]], { form: [0, "form"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlDirective"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControl"]], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 2, "option", [], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 147456, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgSelectOption"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["SelectControlValueAccessor"]]], { value: [0, "value"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](9, 147456, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵq"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], [8, null]], { value: [0, "value"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_ListFieldComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"], ngIfThen: [1, "ngIfThen"], ngIfElse: [2, "ngIfElse"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](0, [["groupedOptions", 2]], null, 0, null, View_ListFieldComponent_3)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](0, [["normalOptions", 2]], null, 0, null, View_ListFieldComponent_6)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "]))], function (_ck, _v) { var _co = _v.component; var currVal_7 = _co.control; _ck(_v, 3, 0, currVal_7); var currVal_8 = 0; _ck(_v, 8, 0, currVal_8); var currVal_9 = 0; _ck(_v, 9, 0, currVal_9); var currVal_10 = _co.groupBy; var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16); var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 19); _ck(_v, 13, 0, currVal_10, currVal_11, currVal_12); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassUntouched; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassTouched; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassPristine; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassDirty; var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassValid; var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassInvalid; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).ngClassPending; _ck(_v, 0, 0, currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6); });
}
function View_ListFieldComponent_8(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 1, "span", [], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.displayValue; _ck(_v, 2, 0, currVal_0); }); }
function View_ListFieldComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_ListFieldComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"], ngIfElse: [1, "ngIfElse"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](0, [["textDisplay", 2]], null, 0, null, View_ListFieldComponent_8)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.editMode; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8); _ck(_v, 6, 0, currVal_0, currVal_1); }, null); }
function View_ListFieldComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "ec-list-field", [], null, null, null, View_ListFieldComponent_0, RenderType_ListFieldComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_list_field_component__WEBPACK_IMPORTED_MODULE_3__["ListFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 114688, null, 0, _list_field_component__WEBPACK_IMPORTED_MODULE_3__["ListFieldComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 2, 0); }, null); }
var ListFieldComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-list-field", _list_field_component__WEBPACK_IMPORTED_MODULE_3__["ListFieldComponent"], View_ListFieldComponent_Host_0, { items: "items", groupBy: "groupBy", editMode: "editMode", value: "value" }, {}, []);




/***/ }),

/***/ "./src/app/shared/form/list-field/list-field.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/shared/form/list-field/list-field.component.ts ***!
  \****************************************************************/
/*! exports provided: ListFieldComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListFieldComponent", function() { return ListFieldComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);


var ListFieldComponent = /*@__PURE__*/ (function () {
    function ListFieldComponent() {
        this._items = [];
        this.editMode = false;
        this._selectedItem = {};
        this.control = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](0);
        this.onChange = function (_) { };
        this.onTouch = function (_) { };
    }
    Object.defineProperty(ListFieldComponent.prototype, "items", {
        get: function () {
            return this._items;
        },
        set: function (newItems) {
            this._items = newItems;
            this.updateGroupings();
            this.value = this.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListFieldComponent.prototype, "groupBy", {
        get: function () {
            return this._groupBy;
        },
        set: function (newGroupBy) {
            this._groupBy = newGroupBy;
            this.updateGroupings();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListFieldComponent.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (newValue) {
            var _this = this;
            this._value = newValue;
            this._selectedItem = this.items.find(function (item) { return item.id === _this._value; }) || { name: this._value };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListFieldComponent.prototype, "displayValue", {
        get: function () {
            return this._selectedItem.name;
        },
        enumerable: true,
        configurable: true
    });
    ListFieldComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.control.valueChanges.subscribe(function (v) {
            _this.onChange(v);
        });
    };
    ListFieldComponent.prototype.updateGroupings = function () {
        if (!this.groupBy || !this.items) {
            this.groups = [];
            return;
        }
        // [
        //   {
        //     id: 1,
        //     name: 'Group 10',
        //     items: [
        //       { id: 1, name: 'First'}
        //     ]
        //
        // }
        //
        // ]
        // // { id: 1, name: 'First', group_id: 1, group: {id: 1, name: 'Group 10'} },
        // { id: 2, name: 'Second', group_id: 1, group: {id: 1, name: 'Group 10'} },
        //
        // { id: 3, name: 'Twenty First', group_id: 20, group: {id: 20, name: 'Group Twenty'} },
        // { id: 4, name: 'Twenty Second', group_id: 20, group: {id: 20, name: 'Group Twenty'} },
        // { id: 5, name: 'Twenty Third', group_id: 20, group: {id: 20, name: 'Group Twenty'} },
        // <optgroup label="group.name" *ngFor="let group of groups; trackBy: trackById">
        // <option *ngFor="let item of group.items; trackById" [value]="item.id">
        //   {{item.name}}
        // </option>
        var groupByIdFieldName = this.groupBy + "_id";
        var groupByFieldName = this.groupBy || 'none'; /*? groupByIdFieldName */
        var itemsByGroupId = Object(lodash__WEBPACK_IMPORTED_MODULE_1__["groupBy"])(this.items, groupByIdFieldName); /*? itemsByGroupId */
        this.groups = Object.keys(itemsByGroupId).map(function (groupId) {
            var group = { id: groupId };
            var items = itemsByGroupId[groupId];
            group.name = items[0][groupByFieldName].name;
            group.items = items;
            return group;
        });
    };
    ListFieldComponent.prototype.trackById = function (index, item) {
        return item.id;
    };
    ListFieldComponent.prototype.writeValue = function (newValue) {
        this.value = newValue;
        this.control.setValue(this.value);
    };
    ListFieldComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    ListFieldComponent.prototype.registerOnTouched = function (fn) {
        this.onTouch = fn;
    };
    return ListFieldComponent;
}());




/***/ }),

/***/ "./src/app/shared/form/money-field/money-field.component.ngfactory.js":
/*!****************************************************************************!*\
  !*** ./src/app/shared/form/money-field/money-field.component.ngfactory.js ***!
  \****************************************************************************/
/*! exports provided: RenderType_MoneyFieldComponent, View_MoneyFieldComponent_0, View_MoneyFieldComponent_Host_0, MoneyFieldComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_MoneyFieldComponent", function() { return RenderType_MoneyFieldComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MoneyFieldComponent_0", function() { return View_MoneyFieldComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MoneyFieldComponent_Host_0", function() { return View_MoneyFieldComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MoneyFieldComponentNgFactory", function() { return MoneyFieldComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../node_modules/@angular/material/form-field/typings/index.ngfactory */ "./node_modules/@angular/material/form-field/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _money_pipe__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../money.pipe */ "./src/app/shared/money.pipe.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _money_field_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./money-field.component */ "./src/app/shared/form/money-field/money-field.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_forms,_angular_material_input,_angular_cdk_platform,_.._money.pipe,_angular_common,_money_field.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_forms,_angular_material_input,_angular_cdk_platform,_.._money.pipe,_angular_common,_money_field.component PURE_IMPORTS_END */










var styles_MoneyFieldComponent = [".negative[_ngcontent-%COMP%] {\n        color: darkred;\n        font-weight: bold;\n    }\n    input[_ngcontent-%COMP%] {\n        text-align: right;\n    }\n     .positive[_ngcontent-%COMP%] {\n        color: darkgreen;\n        font-weight: bold;\n    }\n    mat-form-field[_ngcontent-%COMP%] {\n        width: 100%;\n    }"];
var RenderType_MoneyFieldComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_MoneyFieldComponent, data: {} });

function View_MoneyFieldComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 18, "mat-form-field", [["class", "mat-input-container mat-form-field"]], [[2, "mat-input-invalid", null], [2, "mat-form-field-invalid", null], [2, "mat-form-field-can-float", null], [2, "mat-form-field-should-float", null], [2, "mat-form-field-hide-placeholder", null], [2, "mat-form-field-disabled", null], [2, "mat-focused", null], [2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], null, null, _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatFormField_0"], _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatFormField"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 7389184, null, 7, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormField"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"], [2, _angular_material_core__WEBPACK_IMPORTED_MODULE_3__["MAT_LABEL_GLOBAL_OPTIONS"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 1, { _control: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _placeholderChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 3, { _labelChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 4, { _errorChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 5, { _hintChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 6, { _prefixChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 7, { _suffixChildren: 1 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, [["input", 1]], 1, 7, "input", [["class", "value mat-input-element mat-form-field-autofill-control"], ["matInput", ""], ["type", "text"]], [[2, "negative", null], [2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null], [2, "mat-input-server", null], [1, "id", 0], [8, "placeholder", 0], [8, "disabled", 0], [8, "required", 0], [8, "readOnly", 0], [1, "aria-describedby", 0], [1, "aria-invalid", 0], [1, "aria-required", 0]], [[null, "input"], [null, "blur"], [null, "compositionstart"], [null, "compositionend"], [null, "focus"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("input" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._handleInput($event.target.value) !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11).onTouched() !== false);
                ad = (pd_1 && ad);
            }
            if (("compositionstart" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._compositionStart() !== false);
                ad = (pd_2 && ad);
            }
            if (("compositionend" === en)) {
                var pd_3 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._compositionEnd($event.target.value) !== false);
                ad = (pd_3 && ad);
            }
            if (("blur" === en)) {
                var pd_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._focusChanged(false) !== false);
                ad = (pd_4 && ad);
            }
            if (("focus" === en)) {
                var pd_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._focusChanged(true) !== false);
                ad = (pd_5 && ad);
            }
            if (("input" === en)) {
                var pd_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._onInput() !== false);
                ad = (pd_6 && ad);
            }
            if (("input" === en)) {
                var pd_7 = (_co.updateInnerValue(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10).value) !== false);
                ad = (pd_7 && ad);
            }
            if (("blur" === en)) {
                var pd_8 = (_co.formatTextValue() !== false);
                ad = (pd_8 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["COMPOSITION_BUFFER_MODE"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 540672, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControlDirective"], [[8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"]]], { form: [0, "form"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControlDirective"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](15, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 933888, null, 0, _angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__["Platform"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgForm"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormGroupDirective"]], _angular_material_core__WEBPACK_IMPORTED_MODULE_3__["ErrorStateMatcher"], [8, null]], { placeholder: [0, "placeholder"], type: [1, "type"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, [[1, 4]], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldControl"], null, [_angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"]]), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n      "]))], function (_ck, _v) { var _co = _v.component; var currVal_31 = _co.control; _ck(_v, 13, 0, currVal_31); var currVal_32 = _co.placeholder; var currVal_33 = "text"; _ck(_v, 16, 0, currVal_32, currVal_33); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.errorState; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.errorState; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._canLabelFloat; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldLabelFloat(); var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._hideControlPlaceholder(); var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.disabled; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.focused; var currVal_7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("untouched"); var currVal_8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("touched"); var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("pristine"); var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("dirty"); var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("valid"); var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("invalid"); var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("pending"); _ck(_v, 0, 1, [currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6, currVal_7, currVal_8, currVal_9, currVal_10, currVal_11, currVal_12, currVal_13]); var currVal_14 = _co.isNegative(); var currVal_15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassUntouched; var currVal_16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassTouched; var currVal_17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassPristine; var currVal_18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassDirty; var currVal_19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassValid; var currVal_20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassInvalid; var currVal_21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassPending; var currVal_22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._isServer; var currVal_23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).id; var currVal_24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).placeholder; var currVal_25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).disabled; var currVal_26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).required; var currVal_27 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).readonly; var currVal_28 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._ariaDescribedby || null); var currVal_29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).errorState; var currVal_30 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).required.toString(); _ck(_v, 10, 1, [currVal_14, currVal_15, currVal_16, currVal_17, currVal_18, currVal_19, currVal_20, currVal_21, currVal_22, currVal_23, currVal_24, currVal_25, currVal_26, currVal_27, currVal_28, currVal_29, currVal_30]); });
}
function View_MoneyFieldComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 2, "span", [["class", "value"]], [[2, "negative", null], [2, "positive", null]], null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, null, ["\n          ", "\n        "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵppd"](3, 1), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.isNegative(); var currVal_1 = _co.isPositive(); _ck(_v, 1, 0, currVal_0, currVal_1); var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵunv"](_v, 2, 0, _ck(_v, 3, 0, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v.parent, 0), _co.value)); _ck(_v, 2, 0, currVal_2); }); }
function View_MoneyFieldComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpid"](0, _money_pipe__WEBPACK_IMPORTED_MODULE_7__["MoneyPipe"], []), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_MoneyFieldComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](3, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_8__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"], ngIfElse: [1, "ngIfElse"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](0, [["textDisplay", 2]], null, 0, null, View_MoneyFieldComponent_2)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.editMode; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5); _ck(_v, 3, 0, currVal_0, currVal_1); }, null); }
function View_MoneyFieldComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "ec-money-field", [], null, null, null, View_MoneyFieldComponent_0, RenderType_MoneyFieldComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_money_field_component__WEBPACK_IMPORTED_MODULE_9__["MoneyFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 114688, null, 0, _money_field_component__WEBPACK_IMPORTED_MODULE_9__["MoneyFieldComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 2, 0); }, null); }
var MoneyFieldComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-money-field", _money_field_component__WEBPACK_IMPORTED_MODULE_9__["MoneyFieldComponent"], View_MoneyFieldComponent_Host_0, { editMode: "editMode", highlightPositive: "highlightPositive", placeholder: "placeholder", value: "value" }, {}, []);




/***/ }),

/***/ "./src/app/shared/form/money-field/money-field.component.ts":
/*!******************************************************************!*\
  !*** ./src/app/shared/form/money-field/money-field.component.ts ***!
  \******************************************************************/
/*! exports provided: MoneyFieldComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MoneyFieldComponent", function() { return MoneyFieldComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _util_dollars_to_cents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../util/dollars-to-cents */ "./src/app/util/dollars-to-cents.ts");
/* harmony import */ var _util_cents_to_dollars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../util/cents-to-dollars */ "./src/app/util/cents-to-dollars.ts");



var MoneyFieldComponent = /*@__PURE__*/ (function () {
    function MoneyFieldComponent() {
        this.valueInCents = 0;
        this.isDisabled = false;
        this.control = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](0);
        this.onChange = function (_) { };
        this.onTouch = function (_) { };
    }
    Object.defineProperty(MoneyFieldComponent.prototype, "value", {
        get: function () {
            return this.valueInCents;
        },
        set: function (newValueInCents) {
            this.valueInCents = newValueInCents;
            this.control.setValue(Object(_util_cents_to_dollars__WEBPACK_IMPORTED_MODULE_2__["centsToDollars"])(newValueInCents), { emitEvent: false });
        },
        enumerable: true,
        configurable: true
    });
    ;
    MoneyFieldComponent.prototype.ngOnInit = function () {
    };
    MoneyFieldComponent.prototype.isNegative = function () {
        return this.value < 0;
    };
    MoneyFieldComponent.prototype.isPositive = function () {
        return this.highlightPositive && !this.isNegative();
    };
    MoneyFieldComponent.prototype.updateInnerValue = function (dollarValueString) {
        this.valueInCents = Object(_util_dollars_to_cents__WEBPACK_IMPORTED_MODULE_1__["dollarsToCents"])(dollarValueString);
        this.onChange(this.valueInCents);
    };
    MoneyFieldComponent.prototype.formatTextValue = function () {
        this.value = this.value;
    };
    MoneyFieldComponent.prototype.writeValue = function (newValue) {
        this.value = newValue;
    };
    MoneyFieldComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    MoneyFieldComponent.prototype.registerOnTouched = function (fn) {
        this.onTouch = fn;
    };
    MoneyFieldComponent.prototype.setDisabledState = function (isDisabled) {
        this.isDisabled = isDisabled;
    };
    return MoneyFieldComponent;
}());




/***/ }),

/***/ "./src/app/shared/form/text-field/text-field.component.ngfactory.js":
/*!**************************************************************************!*\
  !*** ./src/app/shared/form/text-field/text-field.component.ngfactory.js ***!
  \**************************************************************************/
/*! exports provided: RenderType_TextFieldComponent, View_TextFieldComponent_0, View_TextFieldComponent_Host_0, TextFieldComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_TextFieldComponent", function() { return RenderType_TextFieldComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_TextFieldComponent_0", function() { return View_TextFieldComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_TextFieldComponent_Host_0", function() { return View_TextFieldComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextFieldComponentNgFactory", function() { return TextFieldComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../node_modules/@angular/material/form-field/typings/index.ngfactory */ "./node_modules/@angular/material/form-field/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/core */ "./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _text_field_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./text-field.component */ "./src/app/shared/form/text-field/text-field.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_forms,_angular_material_input,_angular_cdk_platform,_angular_common,_text_field.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._.._node_modules__angular_material_form_field_typings_index.ngfactory,_angular_material_form_field,_angular_material_core,_angular_forms,_angular_material_input,_angular_cdk_platform,_angular_common,_text_field.component PURE_IMPORTS_END */









var styles_TextFieldComponent = ["mat-form-field[_ngcontent-%COMP%] {\n          width: 100%;\n      }"];
var RenderType_TextFieldComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_TextFieldComponent, data: {} });

function View_TextFieldComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 18, "mat-form-field", [["class", "mat-input-container mat-form-field"]], [[2, "mat-input-invalid", null], [2, "mat-form-field-invalid", null], [2, "mat-form-field-can-float", null], [2, "mat-form-field-should-float", null], [2, "mat-form-field-hide-placeholder", null], [2, "mat-form-field-disabled", null], [2, "mat-focused", null], [2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null]], null, null, _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatFormField_0"], _node_modules_angular_material_form_field_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatFormField"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 7389184, null, 7, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormField"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"], [2, _angular_material_core__WEBPACK_IMPORTED_MODULE_3__["MAT_LABEL_GLOBAL_OPTIONS"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 1, { _control: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _placeholderChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 3, { _labelChild: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 4, { _errorChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 5, { _hintChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 6, { _prefixChildren: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 7, { _suffixChildren: 1 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](10, 0, [["input", 1]], 1, 7, "input", [["class", "value mat-input-element mat-form-field-autofill-control"], ["matInput", ""], ["type", "text"]], [[2, "ng-untouched", null], [2, "ng-touched", null], [2, "ng-pristine", null], [2, "ng-dirty", null], [2, "ng-valid", null], [2, "ng-invalid", null], [2, "ng-pending", null], [2, "mat-input-server", null], [1, "id", 0], [8, "placeholder", 0], [8, "disabled", 0], [8, "required", 0], [8, "readOnly", 0], [1, "aria-describedby", 0], [1, "aria-invalid", 0], [1, "aria-required", 0]], [[null, "input"], [null, "blur"], [null, "compositionstart"], [null, "compositionend"], [null, "focus"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("input" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._handleInput($event.target.value) !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11).onTouched() !== false);
                ad = (pd_1 && ad);
            }
            if (("compositionstart" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._compositionStart() !== false);
                ad = (pd_2 && ad);
            }
            if (("compositionend" === en)) {
                var pd_3 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 11)._compositionEnd($event.target.value) !== false);
                ad = (pd_3 && ad);
            }
            if (("blur" === en)) {
                var pd_4 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._focusChanged(false) !== false);
                ad = (pd_4 && ad);
            }
            if (("focus" === en)) {
                var pd_5 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._focusChanged(true) !== false);
                ad = (pd_5 && ad);
            }
            if (("input" === en)) {
                var pd_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._onInput() !== false);
                ad = (pd_6 && ad);
            }
            if (("input" === en)) {
                var pd_7 = (_co.updateValue(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10).value) !== false);
                ad = (pd_7 && ad);
            }
            return ad;
        }, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](11, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["COMPOSITION_BUFFER_MODE"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](1024, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["DefaultValueAccessor"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 540672, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControlDirective"], [[8, null], [8, null], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"]]], { form: [0, "form"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"], null, [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControlDirective"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](15, 16384, null, 0, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControlStatus"], [_angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 933888, null, 0, _angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_6__["Platform"], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgControl"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NgForm"]], [2, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormGroupDirective"]], _angular_material_core__WEBPACK_IMPORTED_MODULE_3__["ErrorStateMatcher"], [8, null]], { type: [0, "type"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](2048, [[1, 4]], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldControl"], null, [_angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInput"]]), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 1, ["\n    "]))], function (_ck, _v) { var _co = _v.component; var currVal_30 = _co.control; _ck(_v, 13, 0, currVal_30); var currVal_31 = "text"; _ck(_v, 16, 0, currVal_31); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.errorState; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.errorState; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._canLabelFloat; var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldLabelFloat(); var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._hideControlPlaceholder(); var currVal_5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.disabled; var currVal_6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._control.focused; var currVal_7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("untouched"); var currVal_8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("touched"); var currVal_9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("pristine"); var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("dirty"); var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("valid"); var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("invalid"); var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._shouldForward("pending"); _ck(_v, 0, 1, [currVal_0, currVal_1, currVal_2, currVal_3, currVal_4, currVal_5, currVal_6, currVal_7, currVal_8, currVal_9, currVal_10, currVal_11, currVal_12, currVal_13]); var currVal_14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassUntouched; var currVal_15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassTouched; var currVal_16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassPristine; var currVal_17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassDirty; var currVal_18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassValid; var currVal_19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassInvalid; var currVal_20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 15).ngClassPending; var currVal_21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._isServer; var currVal_22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).id; var currVal_23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).placeholder; var currVal_24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).disabled; var currVal_25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).required; var currVal_26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).readonly; var currVal_27 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16)._ariaDescribedby || null); var currVal_28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).errorState; var currVal_29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 16).required.toString(); _ck(_v, 10, 1, [currVal_14, currVal_15, currVal_16, currVal_17, currVal_18, currVal_19, currVal_20, currVal_21, currVal_22, currVal_23, currVal_24, currVal_25, currVal_26, currVal_27, currVal_28, currVal_29]); });
}
function View_TextFieldComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 1, "span", [["class", "value"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, null, ["", ""])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.value; _ck(_v, 2, 0, currVal_0); }); }
function View_TextFieldComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_TextFieldComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"], ngIfElse: [1, "ngIfElse"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](0, [["textDisplay", 2]], null, 0, null, View_TextFieldComponent_2)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.editMode; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 4); _ck(_v, 2, 0, currVal_0, currVal_1); }, null); }
function View_TextFieldComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "ec-text-field", [], null, null, null, View_TextFieldComponent_0, RenderType_TextFieldComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵprd"](5120, null, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["NG_VALUE_ACCESSOR"], function (p0_0) { return [p0_0]; }, [_text_field_component__WEBPACK_IMPORTED_MODULE_8__["TextFieldComponent"]]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 4308992, null, 0, _text_field_component__WEBPACK_IMPORTED_MODULE_8__["TextFieldComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 2, 0); }, null); }
var TextFieldComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-text-field", _text_field_component__WEBPACK_IMPORTED_MODULE_8__["TextFieldComponent"], View_TextFieldComponent_Host_0, { value: "value", editMode: "editMode" }, {}, []);




/***/ }),

/***/ "./src/app/shared/form/text-field/text-field.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/shared/form/text-field/text-field.component.ts ***!
  \****************************************************************/
/*! exports provided: TextFieldComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextFieldComponent", function() { return TextFieldComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/esm5/forms.js");

var TextFieldComponent = /*@__PURE__*/ (function () {
    function TextFieldComponent() {
        this.control = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"]('');
        this.onChange = function (_) { };
        this.onTouch = function () { };
    }
    TextFieldComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.control.valueChanges.subscribe(function (v) {
            _this.onChange(v);
        });
    };
    TextFieldComponent.prototype.ngAfterViewInit = function () {
    };
    TextFieldComponent.prototype.updateValue = function (newValue) {
        this.value = newValue;
    };
    TextFieldComponent.prototype.writeValue = function (newValue) {
        this.value = newValue;
        this.control.setValue(this.value);
    };
    TextFieldComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    TextFieldComponent.prototype.registerOnTouched = function (fn) {
        this.onTouch = fn;
    };
    return TextFieldComponent;
}());




/***/ }),

/***/ "./src/app/shared/highlight-deleted.directive.ts":
/*!*******************************************************!*\
  !*** ./src/app/shared/highlight-deleted.directive.ts ***!
  \*******************************************************/
/*! exports provided: HighlightDeletedDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HighlightDeletedDirective", function() { return HighlightDeletedDirective; });
var HighlightDeletedDirective = /*@__PURE__*/ (function () {
    function HighlightDeletedDirective() {
    }
    Object.defineProperty(HighlightDeletedDirective.prototype, "isDeleted", {
        get: function () {
            return this.item.deleted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HighlightDeletedDirective.prototype, "isUnpaid", {
        get: function () {
            if (this.item.status === undefined) {
                return false;
            }
            // explicitly skip open items -
            // this is used in sink funds to show open sink fund allocations
            if (this.item.status === 'open' || this.item.status === 'closed') {
                return false;
            }
            return this.item.status !== 'paid';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HighlightDeletedDirective.prototype, "isDeactivated", {
        get: function () {
            return this.item.deactivated;
        },
        enumerable: true,
        configurable: true
    });
    return HighlightDeletedDirective;
}());




/***/ }),

/***/ "./src/app/shared/loading-indicator/loading-indicator.component.ngfactory.js":
/*!***********************************************************************************!*\
  !*** ./src/app/shared/loading-indicator/loading-indicator.component.ngfactory.js ***!
  \***********************************************************************************/
/*! exports provided: RenderType_LoadingIndicatorComponent, View_LoadingIndicatorComponent_0, View_LoadingIndicatorComponent_Host_0, LoadingIndicatorComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_LoadingIndicatorComponent", function() { return RenderType_LoadingIndicatorComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_LoadingIndicatorComponent_0", function() { return View_LoadingIndicatorComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_LoadingIndicatorComponent_Host_0", function() { return View_LoadingIndicatorComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoadingIndicatorComponentNgFactory", function() { return LoadingIndicatorComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_progress_bar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/progress-bar/typings/index.ngfactory */ "./node_modules/@angular/material/progress-bar/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/progress-bar */ "./node_modules/@angular/material/esm5/progress-bar.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _loading_indicator_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./loading-indicator.component */ "./src/app/shared/loading-indicator/loading-indicator.component.ts");
/* harmony import */ var _loading_indicator_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./loading-indicator.service */ "./src/app/shared/loading-indicator/loading-indicator.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_progress_bar_typings_index.ngfactory,_angular_material_progress_bar,_angular_common,_loading_indicator.component,_loading_indicator.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_progress_bar_typings_index.ngfactory,_angular_material_progress_bar,_angular_common,_loading_indicator.component,_loading_indicator.service PURE_IMPORTS_END */






var styles_LoadingIndicatorComponent = ["mat-progress-bar[_ngcontent-%COMP%]{\n        position: relative;\n    }"];
var RenderType_LoadingIndicatorComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_LoadingIndicatorComponent, data: {} });

function View_LoadingIndicatorComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "mat-progress-bar", [["aria-valuemax", "100"], ["aria-valuemin", "0"], ["class", "loader mat-progress-bar"], ["color", "warn"], ["mode", "indeterminate"], ["role", "progressbar"]], [[1, "aria-valuenow", 0], [1, "mode", 0]], null, null, _node_modules_angular_material_progress_bar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatProgressBar_0"], _node_modules_angular_material_progress_bar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatProgressBar"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 49152, null, 0, _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_2__["MatProgressBar"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]], { color: [0, "color"], mode: [1, "mode"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "]))], function (_ck, _v) { var currVal_2 = "warn"; var currVal_3 = "indeterminate"; _ck(_v, 1, 0, currVal_2, currVal_3); }, function (_ck, _v) { var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).value; var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1).mode; _ck(_v, 0, 0, currVal_0, currVal_1); }); }
function View_LoadingIndicatorComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_LoadingIndicatorComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.loadingIndicator.isVisible(); _ck(_v, 2, 0, currVal_0); }, null); }
function View_LoadingIndicatorComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-loading-indicator", [], null, null, null, View_LoadingIndicatorComponent_0, RenderType_LoadingIndicatorComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _loading_indicator_component__WEBPACK_IMPORTED_MODULE_4__["LoadingIndicatorComponent"], [_loading_indicator_service__WEBPACK_IMPORTED_MODULE_5__["LoadingIndicator"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var LoadingIndicatorComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-loading-indicator", _loading_indicator_component__WEBPACK_IMPORTED_MODULE_4__["LoadingIndicatorComponent"], View_LoadingIndicatorComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/shared/loading-indicator/loading-indicator.component.ts":
/*!*************************************************************************!*\
  !*** ./src/app/shared/loading-indicator/loading-indicator.component.ts ***!
  \*************************************************************************/
/*! exports provided: LoadingIndicatorComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoadingIndicatorComponent", function() { return LoadingIndicatorComponent; });
var LoadingIndicatorComponent = /*@__PURE__*/ (function () {
    function LoadingIndicatorComponent(loadingIndicator) {
        this.loadingIndicator = loadingIndicator;
    }
    LoadingIndicatorComponent.prototype.ngOnInit = function () {
    };
    return LoadingIndicatorComponent;
}());




/***/ }),

/***/ "./src/app/shared/loading-indicator/loading-indicator.service.ts":
/*!***********************************************************************!*\
  !*** ./src/app/shared/loading-indicator/loading-indicator.service.ts ***!
  \***********************************************************************/
/*! exports provided: LoadingIndicator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoadingIndicator", function() { return LoadingIndicator; });
var LoadingIndicator = /*@__PURE__*/ (function () {
    function LoadingIndicator() {
        this._isVisible = false;
    }
    LoadingIndicator.prototype.isVisible = function () {
        return this._isVisible;
    };
    LoadingIndicator.prototype.show = function () {
        this._isVisible = true;
    };
    LoadingIndicator.prototype.hide = function () {
        this._isVisible = false;
    };
    return LoadingIndicator;
}());




/***/ }),

/***/ "./src/app/shared/main-toolbar/main-toolbar.component.ngfactory.js":
/*!*************************************************************************!*\
  !*** ./src/app/shared/main-toolbar/main-toolbar.component.ngfactory.js ***!
  \*************************************************************************/
/*! exports provided: RenderType_MainToolbarComponent, View_MainToolbarComponent_0, View_MainToolbarComponent_Host_0, MainToolbarComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_MainToolbarComponent", function() { return RenderType_MainToolbarComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MainToolbarComponent_0", function() { return View_MainToolbarComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MainToolbarComponent_Host_0", function() { return View_MainToolbarComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MainToolbarComponentNgFactory", function() { return MainToolbarComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/flex-layout */ "./node_modules/@angular/flex-layout/esm5/flex-layout.es5.js");
/* harmony import */ var _node_modules_angular_material_toolbar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/toolbar/typings/index.ngfactory */ "./node_modules/@angular/material/toolbar/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/toolbar */ "./node_modules/@angular/material/esm5/toolbar.es5.js");
/* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ec-icon/ec-icon.component.ngfactory */ "./src/app/shared/ec-icon/ec-icon.component.ngfactory.js");
/* harmony import */ var _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../ec-icon/ec-icon.component */ "./src/app/shared/ec-icon/ec-icon.component.ts");
/* harmony import */ var _main_toolbar_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./main-toolbar.component */ "./src/app/shared/main-toolbar/main-toolbar.component.ts");
/* harmony import */ var _main_toolbar_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_flex_layout,_.._.._.._node_modules__angular_material_toolbar_typings_index.ngfactory,_angular_material_toolbar,_angular_cdk_platform,_angular_common,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_main_toolbar.component,_main_toolbar.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_flex_layout,_.._.._.._node_modules__angular_material_toolbar_typings_index.ngfactory,_angular_material_toolbar,_angular_cdk_platform,_angular_common,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_main_toolbar.component,_main_toolbar.service PURE_IMPORTS_END */










var styles_MainToolbarComponent = [".heading[_ngcontent-%COMP%] {\n    }"];
var RenderType_MainToolbarComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_MainToolbarComponent, data: {} });

function View_MainToolbarComponent_2(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "span", [["class", "heading"], ["fxHide.xs", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["ShowHideDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["MediaMonitor"], [8, null], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["StyleUtils"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["PLATFORM_ID"], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["SERVER_TOKEN"]]], { hideXs: [0, "hideXs"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, null, ["\n                -- ", "\n            "]))], function (_ck, _v) { var currVal_0 = ""; _ck(_v, 1, 0, currVal_0); }, function (_ck, _v) { var _co = _v.component; var currVal_1 = _co.getMainHeading(); _ck(_v, 2, 0, currVal_1); }); }
function View_MainToolbarComponent_1(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 19, "mat-toolbar", [["class", "menu-bar mat-toolbar"], ["color", "primary"]], [[2, "mat-toolbar-multiple-rows", null], [2, "mat-toolbar-single-row", null]], null, null, _node_modules_angular_material_toolbar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_2__["View_MatToolbar_0"], _node_modules_angular_material_toolbar_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_2__["RenderType_MatToolbar"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 4243456, null, 1, _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_3__["MatToolbar"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_4__["Platform"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["DOCUMENT"]], { color: [0, "color"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 1, { _toolbarRows: 1 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, 1, 9, "mat-toolbar-row", [["class", "mat-toolbar-row"]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, [[1, 4]], 0, _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_3__["MatToolbarRow"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, null, 2, "ec-icon", [["class", "open-menu-button"], ["iconType", "button"]], null, [[null, "click"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("click" === en)) {
                var pd_0 = (_co.openMenu.emit() !== false);
                ad = (pd_0 && ad);
            }
            return ad;
        }, _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["View_EcIconComponent_0"], _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["RenderType_EcIconComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 114688, null, 0, _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_7__["EcIconComponent"], [], { icon: [0, "icon"], iconType: [1, "iconType"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n\n          EveryCent V3\n\n            "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_MainToolbarComponent_2)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](12, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, 1, 3, "mat-toolbar-row", [["class", "mat-toolbar-row"], ["fxHide.gt-xs", ""]], null, null, null, null, null)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](16, 737280, null, 0, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["ShowHideDirective"], [_angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["MediaMonitor"], [8, null], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["StyleUtils"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["PLATFORM_ID"], [2, _angular_flex_layout__WEBPACK_IMPORTED_MODULE_1__["SERVER_TOKEN"]]], { hideGtXs: [0, "hideGtXs"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](17, 16384, [[1, 4]], 0, _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_3__["MatToolbarRow"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](18, null, ["\n           ", "\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n    "]))], function (_ck, _v) { var _co = _v.component; var currVal_2 = "primary"; _ck(_v, 1, 0, currVal_2); var currVal_3 = _co.Icon.MENU; var currVal_4 = "button"; _ck(_v, 8, 0, currVal_3, currVal_4); var currVal_5 = _co.getMainHeading(); _ck(_v, 12, 0, currVal_5); var currVal_6 = ""; _ck(_v, 16, 0, currVal_6); }, function (_ck, _v) { var _co = _v.component; var currVal_0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._toolbarRows.length; var currVal_1 = !_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 1)._toolbarRows.length; _ck(_v, 0, 0, currVal_0, currVal_1); var currVal_7 = _co.getMainHeading(); _ck(_v, 18, 0, currVal_7); });
}
function View_MainToolbarComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_MainToolbarComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.toolbarService.isToolbarVisible(); _ck(_v, 2, 0, currVal_0); }, null); }
function View_MainToolbarComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-main-toolbar", [], null, null, null, View_MainToolbarComponent_0, RenderType_MainToolbarComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _main_toolbar_component__WEBPACK_IMPORTED_MODULE_8__["MainToolbarComponent"], [_main_toolbar_service__WEBPACK_IMPORTED_MODULE_9__["MainToolbarService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var MainToolbarComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-main-toolbar", _main_toolbar_component__WEBPACK_IMPORTED_MODULE_8__["MainToolbarComponent"], View_MainToolbarComponent_Host_0, {}, { openMenu: "openMenu" }, []);




/***/ }),

/***/ "./src/app/shared/main-toolbar/main-toolbar.component.ts":
/*!***************************************************************!*\
  !*** ./src/app/shared/main-toolbar/main-toolbar.component.ts ***!
  \***************************************************************/
/*! exports provided: MainToolbarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MainToolbarComponent", function() { return MainToolbarComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ec-icon/icon.type */ "./src/app/shared/ec-icon/icon.type.ts");


var MainToolbarComponent = /*@__PURE__*/ (function () {
    function MainToolbarComponent(toolbarService) {
        this.toolbarService = toolbarService;
        this.openMenu = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.Icon = _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_1__["Icon"];
    }
    MainToolbarComponent.prototype.ngOnInit = function () {
        this.toolbarService.setHeading('Welcome to EveryCent');
    };
    MainToolbarComponent.prototype.getMainHeading = function () {
        return this.toolbarService.getHeading();
    };
    return MainToolbarComponent;
}());




/***/ }),

/***/ "./src/app/shared/main-toolbar/main-toolbar.service.ts":
/*!*************************************************************!*\
  !*** ./src/app/shared/main-toolbar/main-toolbar.service.ts ***!
  \*************************************************************/
/*! exports provided: MainToolbarService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MainToolbarService", function() { return MainToolbarService; });
var MainToolbarService = /*@__PURE__*/ (function () {
    function MainToolbarService() {
        this._showToolbar = true;
    }
    MainToolbarService.prototype.isToolbarVisible = function () {
        return this._showToolbar;
    };
    MainToolbarService.prototype.hideToolbar = function () {
        this._showToolbar = false;
    };
    MainToolbarService.prototype.showToolbar = function () {
        this._showToolbar = true;
    };
    MainToolbarService.prototype.setHeading = function (newHeading) {
        this._heading = newHeading;
    };
    MainToolbarService.prototype.getHeading = function () {
        return this._heading;
    };
    return MainToolbarService;
}());




/***/ }),

/***/ "./src/app/shared/menu/menu-item.component.ngfactory.js":
/*!**************************************************************!*\
  !*** ./src/app/shared/menu/menu-item.component.ngfactory.js ***!
  \**************************************************************/
/*! exports provided: RenderType_MenuItemComponent, View_MenuItemComponent_0, View_MenuItemComponent_Host_0, MenuItemComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_MenuItemComponent", function() { return RenderType_MenuItemComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MenuItemComponent_0", function() { return View_MenuItemComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MenuItemComponent_Host_0", function() { return View_MenuItemComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenuItemComponentNgFactory", function() { return MenuItemComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/divider/typings/index.ngfactory */ "./node_modules/@angular/material/divider/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/divider */ "./node_modules/@angular/material/esm5/divider.es5.js");
/* harmony import */ var _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/list/typings/index.ngfactory */ "./node_modules/@angular/material/list/typings/index.ngfactory.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/list */ "./node_modules/@angular/material/esm5/list.es5.js");
/* harmony import */ var _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ec-icon/ec-icon.component.ngfactory */ "./src/app/shared/ec-icon/ec-icon.component.ngfactory.js");
/* harmony import */ var _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../ec-icon/ec-icon.component */ "./src/app/shared/ec-icon/ec-icon.component.ts");
/* harmony import */ var _menu_item_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./menu-item.component */ "./src/app/shared/menu/menu-item.component.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_divider_typings_index.ngfactory,_angular_material_divider,_.._.._.._node_modules__angular_material_list_typings_index.ngfactory,_angular_router,_angular_material_list,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_menu_item.component PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_.._.._.._node_modules__angular_material_divider_typings_index.ngfactory,_angular_material_divider,_.._.._.._node_modules__angular_material_list_typings_index.ngfactory,_angular_router,_angular_material_list,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_menu_item.component PURE_IMPORTS_END */









var styles_MenuItemComponent = ["mat-list-item.active[_ngcontent-%COMP%] {\n          color: blue;\n      }\n      mat-list-item[_ngcontent-%COMP%] {\n          cursor: pointer;\n      }"];
var RenderType_MenuItemComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_MenuItemComponent, data: {} });

function View_MenuItemComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_2__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, null, 14, "mat-list-item", [["class", "mat-list-item"], ["routerLinkActive", "active"]], [[2, "mat-list-item-avatar", null], [2, "mat-list-item-with-avatar", null]], [[null, "click"], [null, "focus"], [null, "blur"]], function (_v, en, $event) {
            var ad = true;
            if (("click" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).onClick() !== false);
                ad = (pd_0 && ad);
            }
            if (("focus" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10)._handleFocus() !== false);
                ad = (pd_1 && ad);
            }
            if (("blur" === en)) {
                var pd_2 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10)._handleBlur() !== false);
                ad = (pd_2 && ad);
            }
            return ad;
        }, _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_MatListItem_0"], _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_MatListItem"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 16384, [[1, 4]], 0, _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterLink"], [_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"], [8, null], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]], { routerLink: [0, "routerLink"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](6, 1720320, null, 2, _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterLinkActive"], [_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer2"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]], { routerLinkActiveOptions: [0, "routerLinkActiveOptions"], routerLinkActive: [1, "routerLinkActive"] }, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 1, { links: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 2, { linksWithHrefs: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵpod"](9, { exact: 0 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](10, 1097728, null, 2, _angular_material_list__WEBPACK_IMPORTED_MODULE_5__["MatListItem"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_material_list__WEBPACK_IMPORTED_MODULE_5__["MatNavList"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 3, { _lines: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 4, { _avatar: 0 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n          "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](14, 0, null, 2, 1, "ec-icon", [], null, null, null, _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["View_EcIconComponent_0"], _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_6__["RenderType_EcIconComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](15, 114688, null, 0, _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_7__["EcIconComponent"], [], { icon: [0, "icon"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n          "])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵncd"](2, 0), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](20, 0, null, null, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](21, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_2__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_5 = _co.route; _ck(_v, 5, 0, currVal_5); var currVal_6 = _ck(_v, 9, 0, _co.exactRoute); var currVal_7 = "active"; _ck(_v, 6, 0, currVal_6, currVal_7); var currVal_8 = _co.icon; _ck(_v, 15, 0, currVal_8); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 2).vertical ? "vertical" : "horizontal"); var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 2).vertical; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 2).inset; _ck(_v, 1, 0, currVal_0, currVal_1, currVal_2); var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10)._avatar; var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 10)._avatar; _ck(_v, 4, 0, currVal_3, currVal_4); var currVal_9 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 21).vertical ? "vertical" : "horizontal"); var currVal_10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 21).vertical; var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 21).inset; _ck(_v, 20, 0, currVal_9, currVal_10, currVal_11); });
}
function View_MenuItemComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-menu-item", [], null, null, null, View_MenuItemComponent_0, RenderType_MenuItemComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _menu_item_component__WEBPACK_IMPORTED_MODULE_8__["MenuItemComponent"], [], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var MenuItemComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-menu-item", _menu_item_component__WEBPACK_IMPORTED_MODULE_8__["MenuItemComponent"], View_MenuItemComponent_Host_0, { icon: "icon", route: "route", exactRoute: "exactRoute" }, {}, ["*"]);




/***/ }),

/***/ "./src/app/shared/menu/menu-item.component.ts":
/*!****************************************************!*\
  !*** ./src/app/shared/menu/menu-item.component.ts ***!
  \****************************************************/
/*! exports provided: MenuItemComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenuItemComponent", function() { return MenuItemComponent; });
var MenuItemComponent = /*@__PURE__*/ (function () {
    function MenuItemComponent() {
        this.icon = '';
        this.route = '';
        this.exactRoute = false;
    }
    MenuItemComponent.prototype.ngOnInit = function () {
    };
    MenuItemComponent.prototype.linkActiveOptions = function () {
        return {
            exact: this.route === '/'
        };
    };
    MenuItemComponent.prototype.routerLinkOptions = function () {
        return {
            exact: this.exactRoute
        };
    };
    return MenuItemComponent;
}());




/***/ }),

/***/ "./src/app/shared/menu/menu.component.ngfactory.js":
/*!*********************************************************!*\
  !*** ./src/app/shared/menu/menu.component.ngfactory.js ***!
  \*********************************************************/
/*! exports provided: RenderType_MenuComponent, View_MenuComponent_0, View_MenuComponent_Host_0, MenuComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_MenuComponent", function() { return RenderType_MenuComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MenuComponent_0", function() { return View_MenuComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MenuComponent_Host_0", function() { return View_MenuComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenuComponentNgFactory", function() { return MenuComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _menu_item_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./menu-item.component.ngfactory */ "./src/app/shared/menu/menu-item.component.ngfactory.js");
/* harmony import */ var _menu_item_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./menu-item.component */ "./src/app/shared/menu/menu-item.component.ts");
/* harmony import */ var _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/list/typings/index.ngfactory */ "./node_modules/@angular/material/list/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/list */ "./node_modules/@angular/material/esm5/list.es5.js");
/* harmony import */ var _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../node_modules/@angular/material/divider/typings/index.ngfactory */ "./node_modules/@angular/material/divider/typings/index.ngfactory.js");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/divider */ "./node_modules/@angular/material/esm5/divider.es5.js");
/* harmony import */ var _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../ec-icon/ec-icon.component.ngfactory */ "./src/app/shared/ec-icon/ec-icon.component.ngfactory.js");
/* harmony import */ var _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../ec-icon/ec-icon.component */ "./src/app/shared/ec-icon/ec-icon.component.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _menu_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./menu.component */ "./src/app/shared/menu/menu.component.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../core/auth/auth.service */ "./src/app/core/auth/auth.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_menu_item.component.ngfactory,_menu_item.component,_.._.._.._node_modules__angular_material_list_typings_index.ngfactory,_angular_material_list,_.._.._.._node_modules__angular_material_divider_typings_index.ngfactory,_angular_material_divider,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_angular_common,_menu.component,_angular_router,_.._core_auth_auth.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_menu_item.component.ngfactory,_menu_item.component,_.._.._.._node_modules__angular_material_list_typings_index.ngfactory,_angular_material_list,_.._.._.._node_modules__angular_material_divider_typings_index.ngfactory,_angular_material_divider,_ec_icon_ec_icon.component.ngfactory,_ec_icon_ec_icon.component,_angular_common,_menu.component,_angular_router,_.._core_auth_auth.service PURE_IMPORTS_END */













var styles_MenuComponent = [""];
var RenderType_MenuComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_MenuComponent, data: {} });

function View_MenuComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 2, "ec-menu-item", [], null, null, null, _menu_item_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["View_MenuItemComponent_0"], _menu_item_component_ngfactory__WEBPACK_IMPORTED_MODULE_1__["RenderType_MenuItemComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _menu_item_component__WEBPACK_IMPORTED_MODULE_2__["MenuItemComponent"], [], { icon: [0, "icon"], route: [1, "route"], exactRoute: [2, "exactRoute"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](2, 0, ["\n        ", "\n      "]))], function (_ck, _v) { var currVal_0 = _v.context.$implicit.icon; var currVal_1 = _v.context.$implicit.route; var currVal_2 = (_v.context.$implicit.exact === true); _ck(_v, 1, 0, currVal_0, currVal_1, currVal_2); }, function (_ck, _v) { var currVal_3 = _v.context.$implicit.displayName; _ck(_v, 2, 0, currVal_3); }); }
function View_MenuComponent_0(_l) {
    return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](1, 0, null, null, 38, "mat-list", [["class", "mat-list"]], null, null, null, _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_MatList_0"], _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_MatList"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 49152, null, 0, _angular_material_list__WEBPACK_IMPORTED_MODULE_4__["MatList"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](4, 0, null, 0, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](5, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_6__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](7, 0, null, 0, 10, "mat-list-item", [["class", "mat-list-item"]], [[2, "mat-list-item-avatar", null], [2, "mat-list-item-with-avatar", null]], [[null, "focus"], [null, "blur"]], function (_v, en, $event) {
            var ad = true;
            if (("focus" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8)._handleFocus() !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8)._handleBlur() !== false);
                ad = (pd_1 && ad);
            }
            return ad;
        }, _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_MatListItem_0"], _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_MatListItem"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](8, 1097728, null, 2, _angular_material_list__WEBPACK_IMPORTED_MODULE_4__["MatListItem"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_material_list__WEBPACK_IMPORTED_MODULE_4__["MatNavList"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 1, { _lines: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 2, { _avatar: 0 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](12, 0, null, 2, 1, "ec-icon", [], null, null, null, _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_EcIconComponent_0"], _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_EcIconComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](13, 114688, null, 0, _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_8__["EcIconComponent"], [], { icon: [0, "icon"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](15, 0, null, 2, 1, "a", [["href", "/"]], null, null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["Go to Old Version "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](19, 0, null, 0, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](20, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_6__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, 0, 1, null, View_MenuComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](23, 802816, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgForOf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["IterableDiffers"]], { ngForOf: [0, "ngForOf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](25, 0, null, 0, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](26, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_6__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](28, 0, null, 0, 7, "mat-list-item", [["class", "mat-list-item"]], [[2, "mat-list-item-avatar", null], [2, "mat-list-item-with-avatar", null]], [[null, "click"], [null, "focus"], [null, "blur"]], function (_v, en, $event) {
            var ad = true;
            var _co = _v.component;
            if (("focus" === en)) {
                var pd_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29)._handleFocus() !== false);
                ad = (pd_0 && ad);
            }
            if (("blur" === en)) {
                var pd_1 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29)._handleBlur() !== false);
                ad = (pd_1 && ad);
            }
            if (("click" === en)) {
                var pd_2 = (_co.logOut() !== false);
                ad = (pd_2 && ad);
            }
            return ad;
        }, _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["View_MatListItem_0"], _node_modules_angular_material_list_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_3__["RenderType_MatListItem"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](29, 1097728, null, 2, _angular_material_list__WEBPACK_IMPORTED_MODULE_4__["MatListItem"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], [2, _angular_material_list__WEBPACK_IMPORTED_MODULE_4__["MatNavList"]]], null, null), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](603979776, 3, { _lines: 1 }), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵqud"](335544320, 4, { _avatar: 0 }), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n        "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](33, 0, null, 2, 1, "ec-icon", [], null, null, null, _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["View_EcIconComponent_0"], _ec_icon_ec_icon_component_ngfactory__WEBPACK_IMPORTED_MODULE_7__["RenderType_EcIconComponent"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](34, 114688, null, 0, _ec_icon_ec_icon_component__WEBPACK_IMPORTED_MODULE_8__["EcIconComponent"], [], { icon: [0, "icon"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 2, ["\n        Log out\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n      "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](37, 0, null, 0, 1, "mat-divider", [["class", "mat-divider"], ["role", "separator"]], [[1, "aria-orientation", 0], [2, "mat-divider-vertical", null], [2, "mat-divider-inset", null]], null, null, _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["View_MatDivider_0"], _node_modules_angular_material_divider_typings_index_ngfactory__WEBPACK_IMPORTED_MODULE_5__["RenderType_MatDivider"])), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](38, 49152, null, 0, _angular_material_divider__WEBPACK_IMPORTED_MODULE_6__["MatDivider"], [], null, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, 0, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_5 = _co.Icon.HOME; _ck(_v, 13, 0, currVal_5); var currVal_9 = _co.menuItems; _ck(_v, 23, 0, currVal_9); var currVal_15 = _co.Icon.LOGOUT; _ck(_v, 34, 0, currVal_15); }, function (_ck, _v) { var currVal_0 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).vertical ? "vertical" : "horizontal"); var currVal_1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).vertical; var currVal_2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 5).inset; _ck(_v, 4, 0, currVal_0, currVal_1, currVal_2); var currVal_3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8)._avatar; var currVal_4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 8)._avatar; _ck(_v, 7, 0, currVal_3, currVal_4); var currVal_6 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 20).vertical ? "vertical" : "horizontal"); var currVal_7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 20).vertical; var currVal_8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 20).inset; _ck(_v, 19, 0, currVal_6, currVal_7, currVal_8); var currVal_10 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 26).vertical ? "vertical" : "horizontal"); var currVal_11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 26).vertical; var currVal_12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 26).inset; _ck(_v, 25, 0, currVal_10, currVal_11, currVal_12); var currVal_13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29)._avatar; var currVal_14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 29)._avatar; _ck(_v, 28, 0, currVal_13, currVal_14); var currVal_16 = (_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 38).vertical ? "vertical" : "horizontal"); var currVal_17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 38).vertical; var currVal_18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵnov"](_v, 38).inset; _ck(_v, 37, 0, currVal_16, currVal_17, currVal_18); });
}
function View_MenuComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-menu", [], null, null, null, View_MenuComponent_0, RenderType_MenuComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _menu_component__WEBPACK_IMPORTED_MODULE_10__["MenuComponent"], [_angular_router__WEBPACK_IMPORTED_MODULE_11__["Router"], _core_auth_auth_service__WEBPACK_IMPORTED_MODULE_12__["AuthService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var MenuComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-menu", _menu_component__WEBPACK_IMPORTED_MODULE_10__["MenuComponent"], View_MenuComponent_Host_0, {}, { menuSelect: "menuSelect" }, []);




/***/ }),

/***/ "./src/app/shared/menu/menu.component.ts":
/*!***********************************************!*\
  !*** ./src/app/shared/menu/menu.component.ts ***!
  \***********************************************/
/*! exports provided: MenuComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenuComponent", function() { return MenuComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ec-icon/icon.type */ "./src/app/shared/ec-icon/icon.type.ts");



var MenuComponent = /*@__PURE__*/ (function () {
    function MenuComponent(router, authService) {
        this.router = router;
        this.authService = authService;
        this.Icon = _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"];
        this.menuSelect = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.menuItems = [
            { displayName: 'Home', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].HOME, route: "/", exact: true },
            { displayName: 'Current Budget', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].BUDGETS_CURRENT, route: "/budgets/current", exact: true },
            { displayName: 'Budgets', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].BUDGETS, route: "/budgets", exact: false },
            { displayName: 'Future Budgets', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].BUDGETS_FUTURE, route: "/budgets/future", exact: true },
            { displayName: 'Transactions', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].TRANSACTIONS, route: "/transactions" },
            { displayName: 'Sink Funds', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].SINK_FUND, route: "/sink-funds" },
            { displayName: 'Account Balances', icon: _ec_icon_icon_type__WEBPACK_IMPORTED_MODULE_2__["Icon"].ACCOUNT_BALANCES, route: "/account-balances" },
        ];
    }
    MenuComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.router.events
            .filter(function (e) { return e instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]; })
            .subscribe(function (e) { return _this.menuSelect.emit(); });
    };
    MenuComponent.prototype.logOut = function () {
        var _this = this;
        this.authService.logOut().then(function () {
            _this.menuSelect.emit();
            _this.router.navigate(['/login']);
        });
    };
    return MenuComponent;
}());




/***/ }),

/***/ "./src/app/shared/message-display/message-display.component.ngfactory.js":
/*!*******************************************************************************!*\
  !*** ./src/app/shared/message-display/message-display.component.ngfactory.js ***!
  \*******************************************************************************/
/*! exports provided: RenderType_MessageDisplayComponent, View_MessageDisplayComponent_0, View_MessageDisplayComponent_Host_0, MessageDisplayComponentNgFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RenderType_MessageDisplayComponent", function() { return RenderType_MessageDisplayComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MessageDisplayComponent_0", function() { return View_MessageDisplayComponent_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "View_MessageDisplayComponent_Host_0", function() { return View_MessageDisplayComponent_Host_0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageDisplayComponentNgFactory", function() { return MessageDisplayComponentNgFactory; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var _message_display_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./message-display.component */ "./src/app/shared/message-display/message-display.component.ts");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../message-display/message.service */ "./src/app/message-display/message.service.ts");
/**
 * @fileoverview This file was generated by the Angular template compiler. Do not edit.
 *
 * @suppress {suspiciousCode,uselessCode,missingProperties,missingOverride,checkTypes}
 * tslint:disable
 */
/** PURE_IMPORTS_START _angular_core,_angular_common,_message_display.component,_.._message_display_message.service PURE_IMPORTS_END */
/** PURE_IMPORTS_START _angular_core,_angular_common,_message_display.component,_.._message_display_message.service PURE_IMPORTS_END */




var styles_MessageDisplayComponent = ["div.message-display[_ngcontent-%COMP%]{\n        text-align: center;\n        margin: 10px 15px;\n        padding: 5px;\n        font-family: Roboto,\"Helvetica Neue\",sans-serif;\n        font-weight: 400;\n        font-size: 1.1em;\n        border-radius: 5px;\n        box-shadow: 10px 10px 5px #888888;\n    }\n\n    div.error[_ngcontent-%COMP%] {\n        color: white;\n        background-color: #f44336;\n        border: 2px solid #892822;\n    }\n    div.info[_ngcontent-%COMP%] {\n        color: white;\n        background-color: #8084ec;\n        border: 2px solid #21236f;\n    }"];
var RenderType_MessageDisplayComponent = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵcrt"]({ encapsulation: 0, styles: styles_MessageDisplayComponent, data: {} });

function View_MessageDisplayComponent_1(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "div", [["class", "message-display"]], [[2, "info", null], [2, "error", null]], null, null, null, null)), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](1, null, ["\n        ", "\n    "]))], null, function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.messageService.isInfo(); var currVal_1 = _co.messageService.isError(); _ck(_v, 0, 0, currVal_0, currVal_1); var currVal_2 = _co.messageService.getMessage(); _ck(_v, 1, 0, currVal_2); }); }
function View_MessageDisplayComponent_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n    "])), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵand"](16777216, null, null, 1, null, View_MessageDisplayComponent_1)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](2, 16384, null, 0, _angular_common__WEBPACK_IMPORTED_MODULE_1__["NgIf"], [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewContainerRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["TemplateRef"]], { ngIf: [0, "ngIf"] }, null), (_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵted"](-1, null, ["\n  "]))], function (_ck, _v) { var _co = _v.component; var currVal_0 = _co.messageService.getMessage(); _ck(_v, 2, 0, currVal_0); }, null); }
function View_MessageDisplayComponent_Host_0(_l) { return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵvid"](0, [(_l()(), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵeld"](0, 0, null, null, 1, "ec-message-display", [], null, null, null, View_MessageDisplayComponent_0, RenderType_MessageDisplayComponent)), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵdid"](1, 114688, null, 0, _message_display_component__WEBPACK_IMPORTED_MODULE_2__["MessageDisplayComponent"], [_message_display_message_service__WEBPACK_IMPORTED_MODULE_3__["MessageService"]], null, null)], function (_ck, _v) { _ck(_v, 1, 0); }, null); }
var MessageDisplayComponentNgFactory = /*@__PURE__*/ _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵccf"]("ec-message-display", _message_display_component__WEBPACK_IMPORTED_MODULE_2__["MessageDisplayComponent"], View_MessageDisplayComponent_Host_0, {}, {}, []);




/***/ }),

/***/ "./src/app/shared/message-display/message-display.component.ts":
/*!*********************************************************************!*\
  !*** ./src/app/shared/message-display/message-display.component.ts ***!
  \*********************************************************************/
/*! exports provided: MessageDisplayComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageDisplayComponent", function() { return MessageDisplayComponent; });
var MessageDisplayComponent = /*@__PURE__*/ (function () {
    function MessageDisplayComponent(messageService) {
        this.messageService = messageService;
    }
    MessageDisplayComponent.prototype.ngOnInit = function () {
    };
    return MessageDisplayComponent;
}());




/***/ }),

/***/ "./src/app/shared/money.pipe.ts":
/*!**************************************!*\
  !*** ./src/app/shared/money.pipe.ts ***!
  \**************************************/
/*! exports provided: MoneyPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MoneyPipe", function() { return MoneyPipe; });
/* harmony import */ var _util_cents_to_dollars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/cents-to-dollars */ "./src/app/util/cents-to-dollars.ts");

var MoneyPipe = /*@__PURE__*/ (function () {
    function MoneyPipe() {
    }
    MoneyPipe.prototype.transform = function (valueInCents) {
        return Object(_util_cents_to_dollars__WEBPACK_IMPORTED_MODULE_0__["centsToDollars"])(valueInCents);
    };
    return MoneyPipe;
}());




/***/ }),

/***/ "./src/app/shared/settings.service.ts":
/*!********************************************!*\
  !*** ./src/app/shared/settings.service.ts ***!
  \********************************************/
/*! exports provided: SettingsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SettingsService", function() { return SettingsService; });
var SettingsService = /*@__PURE__*/ (function () {
    function SettingsService(apiGateway) {
        this.apiGateway = apiGateway;
    }
    SettingsService.prototype.getSettings = function () {
        return this.apiGateway.get('/settings');
    };
    SettingsService.prototype.saveSettings = function (newSettings) {
        return this.apiGateway.post('/settings', newSettings);
    };
    return SettingsService;
}());




/***/ }),

/***/ "./src/app/shared/shared.module.ts":
/*!*****************************************!*\
  !*** ./src/app/shared/shared.module.ts ***!
  \*****************************************/
/*! exports provided: SharedModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SharedModule", function() { return SharedModule; });
/* harmony import */ var _confirmation_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./confirmation.service */ "./src/app/shared/confirmation.service.ts");
/* harmony import */ var _deactivate_button_deactivate_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./deactivate-button/deactivate.service */ "./src/app/shared/deactivate-button/deactivate.service.ts");
/* harmony import */ var _loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loading-indicator/loading-indicator.service */ "./src/app/shared/loading-indicator/loading-indicator.service.ts");
/* harmony import */ var _main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./main-toolbar/main-toolbar.service */ "./src/app/shared/main-toolbar/main-toolbar.service.ts");
/* harmony import */ var _message_display_message_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../message-display/message.service */ "./src/app/message-display/message.service.ts");
/* harmony import */ var _settings_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./settings.service */ "./src/app/shared/settings.service.ts");






var SharedModule = /*@__PURE__*/ (function () {
    function SharedModule() {
    }
    SharedModule.forRoot = function () {
        return {
            ngModule: SharedModule,
            providers: [
                _confirmation_service__WEBPACK_IMPORTED_MODULE_0__["ConfirmationService"],
                _deactivate_button_deactivate_service__WEBPACK_IMPORTED_MODULE_1__["DeactivateService"],
                _loading_indicator_loading_indicator_service__WEBPACK_IMPORTED_MODULE_2__["LoadingIndicator"],
                _main_toolbar_main_toolbar_service__WEBPACK_IMPORTED_MODULE_3__["MainToolbarService"],
                _message_display_message_service__WEBPACK_IMPORTED_MODULE_4__["MessageService"],
                _settings_service__WEBPACK_IMPORTED_MODULE_5__["SettingsService"],
            ],
        };
    };
    return SharedModule;
}());




/***/ }),

/***/ "./src/app/transactions/transaction-date-validator.directive.ts":
/*!**********************************************************************!*\
  !*** ./src/app/transactions/transaction-date-validator.directive.ts ***!
  \**********************************************************************/
/*! exports provided: TransactionDateValidatorDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransactionDateValidatorDirective", function() { return TransactionDateValidatorDirective; });
var TransactionDateValidatorDirective = /*@__PURE__*/ (function () {
    function TransactionDateValidatorDirective() {
        this.budget = {};
    }
    TransactionDateValidatorDirective.prototype.validate = function (c) {
        if (!c.value) {
            return { required: true };
        }
        if (!this.budget) {
            return null;
        }
        var dateValue = new Date(c.value);
        if (this.budget.start_date) {
            var startDate = new Date(this.budget.start_date);
            if (dateValue < startDate) {
                return { outOfRange: true, beforeBudgetPeriod: true };
            }
        }
        if (this.budget.end_date) {
            var endDate = new Date(this.budget.end_date);
            if (dateValue > endDate) {
                return { outOfRange: true, afterBudgetPeriod: true };
            }
        }
        return null;
    };
    return TransactionDateValidatorDirective;
}());




/***/ }),

/***/ "./src/app/util/cents-to-dollars.ts":
/*!******************************************!*\
  !*** ./src/app/util/cents-to-dollars.ts ***!
  \******************************************/
/*! exports provided: centsToDollars, ɵ0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "centsToDollars", function() { return centsToDollars; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ɵ0", function() { return ɵ0; });
/* harmony import */ var util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! util */ "./node_modules/util/util.js");
/* harmony import */ var util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(util__WEBPACK_IMPORTED_MODULE_0__);

var centsToDollars = function (centsValue) {
    if (Object(util__WEBPACK_IMPORTED_MODULE_0__["isNullOrUndefined"])(centsValue)) {
        return '0.00';
    }
    var dollarValue = centsValue / 100;
    return dollarValue.toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};
var ɵ0 = centsToDollars;




/***/ }),

/***/ "./src/app/util/dollars-to-cents.ts":
/*!******************************************!*\
  !*** ./src/app/util/dollars-to-cents.ts ***!
  \******************************************/
/*! exports provided: dollarsToCents, ɵ0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dollarsToCents", function() { return dollarsToCents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ɵ0", function() { return ɵ0; });
var dollarsToCents = function (dollarValue) {
    var dollarValueToConvert = dollarValue;
    if (typeof dollarValue === 'string') {
        dollarValueToConvert = dollarValue.replace(/,/g, '');
    }
    var numericDollarValue = Number(dollarValueToConvert);
    if (isNaN(numericDollarValue)) {
        return 0;
    }
    return Math.round(numericDollarValue * 100);
};
var ɵ0 = dollarsToCents;




/***/ }),

/***/ "./src/app/util/total.ts":
/*!*******************************!*\
  !*** ./src/app/util/total.ts ***!
  \*******************************/
/*! exports provided: total, ɵ0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "total", function() { return total; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ɵ0", function() { return ɵ0; });
var total = function (items, fieldToSum) {
    if (items === void 0) { items = []; }
    return items.reduce(function (sum, item) {
        // don't include deleted items
        // ---------------------------
        if (item.deleted) {
            return sum;
        }
        // handle 'net_amount' specially -
        // net amount totaling is deposit - withdrawal
        if (fieldToSum === 'net_amount') {
            return sum + (item.deposit_amount - item.withdrawal_amount);
        }
        // skip any items that don't have the property
        if (!item[fieldToSum]) {
            return sum;
        }
        return sum + item[fieldToSum];
    }, 0);
};
var ɵ0 = total;




/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rxjs_imports__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rxjs-imports */ "./src/rxjs-imports.ts");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _app_app_module_ngfactory__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/app.module.ngfactory */ "./src/app/app.module.ngfactory.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/esm5/platform-browser.js");





if (_environments_environment__WEBPACK_IMPORTED_MODULE_2__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_4__["platformBrowser"]().bootstrapModuleFactory(_app_app_module_ngfactory__WEBPACK_IMPORTED_MODULE_3__["AppModuleNgFactory"])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ "./src/rxjs-imports.ts":
/*!*****************************!*\
  !*** ./src/rxjs-imports.ts ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var rxjs_add_observable_combineLatest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs/add/observable/combineLatest */ "./node_modules/rxjs/_esm5/add/observable/combineLatest.js");
/* harmony import */ var rxjs_add_observable_empty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/add/observable/empty */ "./node_modules/rxjs/_esm5/add/observable/empty.js");
/* harmony import */ var rxjs_add_observable_of__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/add/observable/of */ "./node_modules/rxjs/_esm5/add/observable/of.js");
/* harmony import */ var rxjs_add_observable_throw__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/add/observable/throw */ "./node_modules/rxjs/_esm5/add/observable/throw.js");
/* harmony import */ var rxjs_add_observable_zip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/add/observable/zip */ "./node_modules/rxjs/_esm5/add/observable/zip.js");
/* harmony import */ var rxjs_add_operator_catch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/add/operator/catch */ "./node_modules/rxjs/_esm5/add/operator/catch.js");
/* harmony import */ var rxjs_add_operator_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/add/operator/distinctUntilChanged */ "./node_modules/rxjs/_esm5/add/operator/distinctUntilChanged.js");
/* harmony import */ var rxjs_add_operator_do__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs/add/operator/do */ "./node_modules/rxjs/_esm5/add/operator/do.js");
/* harmony import */ var rxjs_add_operator_filter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/add/operator/filter */ "./node_modules/rxjs/_esm5/add/operator/filter.js");
/* harmony import */ var rxjs_add_operator_map__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/add/operator/map */ "./node_modules/rxjs/_esm5/add/operator/map.js");
/* harmony import */ var rxjs_add_operator_switchMap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs/add/operator/switchMap */ "./node_modules/rxjs/_esm5/add/operator/switchMap.js");
/* harmony import */ var rxjs_add_operator_take__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs/add/operator/take */ "./node_modules/rxjs/_esm5/add/operator/take.js");
/* harmony import */ var rxjs_add_operator_takeUntil__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs/add/operator/takeUntil */ "./node_modules/rxjs/_esm5/add/operator/takeUntil.js");
/* harmony import */ var rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs/add/operator/toPromise */ "./node_modules/rxjs/_esm5/add/operator/toPromise.js");
/* harmony import */ var rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(rxjs_add_operator_toPromise__WEBPACK_IMPORTED_MODULE_13__);
// Class level operators





// Instance level operators











/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/kion/dev/everycent/webclientv3/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map