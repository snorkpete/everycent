import {Injectable} from "@angular/core";
import { convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ActivatedRouteStub {

  // ActivatedRoute.paramMap is Observable
  private paramMapSubject = new BehaviorSubject(convertToParamMap(this.testParamMap));
  private queryParamMapSubject = new BehaviorSubject(convertToParamMap(this.testQueryParamMap));
  paramMap = this.paramMapSubject.asObservable();
  queryParamMap = this.queryParamMapSubject.asObservable();

  // Test parameters
  private _testParamMap: ParamMap;
  get testParamMap() { return this._testParamMap; }
  set testParamMap(params: {}) {
    this._testParamMap = convertToParamMap(params);
    this.paramMapSubject.next(this._testParamMap);
  }

  private _testQueryParamMap: ParamMap;
  get testQueryParamMap() { return this._testQueryParamMap; }
  set testQueryParamMap(params: {}) {
    this._testQueryParamMap = convertToParamMap(params);
    this.queryParamMapSubject.next(this._testQueryParamMap);
  }

  // ActivatedRoute.snapshot.paramMap
  get snapshot() {
    return { paramMap: this.testParamMap };
  }
}
