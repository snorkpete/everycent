
describe('DateService', function(){
  var DateService;

  beforeEach(module('everycent'));
  beforeEach(inject(function(_DateService_){
    DateService = _DateService_;
  }));

  describe('#convertFromBankDateFormat', function(){
    it("swaps dates to 'yyyy-mm-dd' format", function(){
      expect(DateService.convertFromBankDateFormat('01/05/2015')).toEqual('2015-01-05');
    });
    it("returns '' if not a valid date", function(){
      expect(DateService.convertFromBankDateFormat(undefined)).toEqual('');
    });
  });
});
