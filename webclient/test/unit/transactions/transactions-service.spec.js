describe('TransactionsService', function(){
  var TransactionsService;

  beforeEach(module('everycent'));
  beforeEach(inject(function(_TransactionsService_){
    TransactionsService = _TransactionsService_;
  }));

  describe('#updateTransactionStatus', function(){

    describe("when transaction.paid is true", function(){
      it("updates transaction.status to 'paid'", function(){
        var transaction = { status: '', paid: true };
        TransactionsService.updateTransactionStatus(transaction);
        expect(transaction.status).toEqual('paid');
      });
    });

    describe("when transaction.paid is false", function(){
      it("updates transaction.status to 'unpaid'", function(){
        var transaction = { status: '', paid: false };
        TransactionsService.updateTransactionStatus(transaction);
        expect(transaction.status).toEqual('unpaid');
      });
    });
  });


});

