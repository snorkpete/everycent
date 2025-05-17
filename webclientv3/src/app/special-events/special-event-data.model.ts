import { AllocationData } from "../budgets/allocation.model";

export interface SpecialEventData {
    id: number;
    name: string;
    budget_amount: number;
    actual_amount?: number;
    allocations?: AllocationData[];
}