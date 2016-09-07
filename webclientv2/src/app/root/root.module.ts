import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {RootComponent} from "./root.component";
import {MenuComponent} from "./menu.component";
import {HomeComponent} from "./home.component";
@NgModule({
  declarations:[
    RootComponent,
    MenuComponent,
    HomeComponent
  ],
  imports:[
    SharedModule
  ],
  exports:[
    RootComponent,
    MenuComponent,
    HomeComponent
  ]
})
export class RootModule{}
