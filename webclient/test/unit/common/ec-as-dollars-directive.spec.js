
describe('ecAsDollarsDirective', function(){
  var form, element, scope;

  beforeEach(module('everycent'));
  beforeEach(inject(function($rootScope, $compile){
    scope = $rootScope.$new();

    scope.amount = 500;
    form = angular.element('<form name="form"><input name="amount" ng-model="amount" ec-as-dollars></input></form>');
    form = $compile(form)(scope);
    element = form.find('input');
  }));

  describe("when updating the model", function(){
    it("displays the value as dollars", function(){
      scope.amount = 100;
      scope.$digest();
      expect(element.val()).toEqual('1.00');
    });

    it("displays the value as dollars and cents", function(){
      scope.amount = 340;
      scope.$digest();
      expect(element.val()).toEqual('3.40');
    });
  });

  describe("when updating the view", function(){
    it("converts the user entered value to cents on the model", function(){
      scope.form.amount.$setViewValue(205.15);
      scope.$digest();
      expect(scope.amount).toEqual(20515);
    });

    it("converts the user entered value to cents when user enters integers", function(){
      scope.form.amount.$setViewValue(200);
      scope.$digest();
      expect(scope.amount).toEqual(20000);
    });

    it("converts user-entered strings to numbers", function(){
      scope.form.amount.$setViewValue('215');
      scope.$digest();
      expect(scope.amount).toEqual(21500);
    });
  });

});
