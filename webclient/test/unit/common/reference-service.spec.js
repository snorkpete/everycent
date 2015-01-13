
describe('ReferenceService', function(){
  var ReferenceService;

  beforeEach(module('everycent'));
  beforeEach(inject(function(_ReferenceService_){
    ReferenceService = _ReferenceService_;
  }));

  it('sets the reference id on a given model', function(){
    var model = {
      bank_account: { id: 5, name: 'Bank' }
    };

    ReferenceService.updateReferenceId(model, 'bank_account');
    expect(model.bank_account_id).toEqual(5);
  });

});
