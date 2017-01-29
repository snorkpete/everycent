import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/theme-material.css";

import "./styles.scss";
import '@angular/material/core/theming/prebuilt/indigo-pink.css';
import "hammerjs";

//import "./material-overrides.scss";
//import "@angular2-material/core/overlay/overlay.css";

import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app/app.module";

platformBrowserDynamic().bootstrapModule(AppModule);