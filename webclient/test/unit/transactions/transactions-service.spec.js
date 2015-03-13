
describe('TransactionsService', function(){
  var TransactionsService;

  beforeEach(module('everycent'));
  beforeEach(inject(function(_TransactionsService_){
    TransactionsService = _TransactionsService_;
  }));

  describe('#convertToTransactions', function(){
    var input, startDate, endDate;
    beforeEach(function(){
      input = '';
      startDate = new Date('2015/01/23');
      endDate = new Date('2015/01/23');
    });

    it('returns an empty list by default', function(){
      expect(TransactionsService.convertToTransactions(input, startDate, endDate)).toEqual([]);
    });

    describe('when handling a normal POS transaction', function(){
      beforeEach(function(){
      });

      fit('returns a transaction list with one transaction', function(){
        var input = '01/23/2015		\n' +
                    'POS FEE (DEBIT)\n' +
                    '0010092 SAMANTHA SINGH\n' +
                    'PORT OF SPAINTT\n' +
                    '$0.75 TTD	\n';
        var result = TransactionsService.convertToTransactions(input, startDate, endDate, true);
        expect(result.length).toEqual(1);
        expect(result[0].transaction_date).toEqual(new Date('01/23/2015'));
        expect(result[0].withdrawal_amount).toEqual(75);
        expect(result[0].deposit_amount).toEqual(0);
        expect(result[0].description).toEqual('SAMANTHA SINGH');
      });

      it('handles service charge transactions', function(){
        var input = '02/23/2015		\n' +
                    'SERVICE CHARGE SBQIBQSBFIBF\n' +
                    '0568053 MARAVAL ROAD\n' +
                    'POS T\n' +
                    '$4.00 TTD		\n' +
                    '02/23/2015	\n';
        var result = TransactionsService.convertToTransactions(input, startDate, endDate, false);
        expect(result.length).toEqual(1);
        expect(result[0].transaction_date).toEqual(new Date('02/23/2015'));
        expect(result[0].withdrawal_amount).toEqual(400);
        expect(result[0].deposit_amount).toEqual(0);
        expect(result[0].payeeCode).toEqual('0568053');
        expect(result[0].payeeName).toEqual('MARAVAL ROAD');
        expect(result[0].description).toEqual('SERVICE CHARGE MARAVAL ROAD');
      });
    });
  });
});
