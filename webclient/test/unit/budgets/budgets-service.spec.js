
describe('BudgetsService', function(){
  var BudgetsService,
      allocations,
      allocationCategories;

  beforeEach(module('everycent'));
  beforeEach(inject(function(_BudgetsService_){
    BudgetsService = _BudgetsService_;
    allocationCategories = [
      { name:'Debt', id:1 },
      { name:'Food', id:2 },
      { name:'Household', id:3 },
      { name:'Saving', id:4 },
      { name:'Transportation', id:5 }
  ];
    allocations = [
      { name: 'Rent', allocation_category_id: 3 },
      { name: 'Groceries', allocation_category_id: 2 },
      { name: 'Bank Loan', allocation_category_id: 3 }
    ];
  }));

  describe('#groupAllocations', function(){
    it("groups the allocations by category", function(){
      var expectedResult = [
        { id: 1, name: 'Debt', allocations: [] },
        { id: 2, name: 'Food', allocations: [{ name: 'Groceries', allocation_category_id: 2}] },
        { id: 3, name: 'Household',
                allocations: [{ name: 'Rent', allocation_category_id: 3},{ name: 'Bank Loan', allocation_category_id: 3}] },
        { id: 4, name: 'Saving', allocations: [] },
        { id: 5, name: 'Transportation', allocations: [] },

      ];
      var result = BudgetsService.groupAllocationsByCategory(allocations, allocationCategories);
      
      expect(result).toEqual(expectedResult);
    });
  });
});
