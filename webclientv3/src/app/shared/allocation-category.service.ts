import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiGateway } from "../../api/api-gateway.service";
import { AllocationCategoryData } from "./allocation-category-data.model";

@Injectable()
export class AllocationCategoryService {
  constructor(private apiGateway: ApiGateway) {}

  getAllocationCategories(): Observable<AllocationCategoryData[]> {
    return this.apiGateway.get("/allocation_categories");
  }
} 