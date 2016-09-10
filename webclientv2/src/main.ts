import "./styles.scss";
import "./material-overrides.scss";
import "@angular2-material/core/overlay/overlay.css";

import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app/app.module";

platformBrowserDynamic().bootstrapModule(AppModule);