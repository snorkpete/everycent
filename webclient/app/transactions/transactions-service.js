(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['$http', 'Restangular', 'DateService', '$modal', '$document'];
    function TransactionsService($http, Restangular, DateService, $modal, $document){
      var service = {
        newTransaction: newTransaction,
        getTransactions: getTransactions,
        transactionsFor: transactionsFor,
        save: save,
        convertToTransactions: convertToTransactions,
        showTransactionList: showTransactionList
      };

      var baseAll = Restangular.all('transactions');
      return service;

      function newTransaction(){
        return {
          withdrawal_amount: 0,
          deposit_amount: 0
        };
      }

      function getTransactions(params){
        return baseAll.getList(params);
      }

      function transactionsFor(allocationId){
        return baseAll.customGET('by_allocation', { allocation_id: allocationId });
      }

      function save(transactions, searchOptions){
        var startDate = new Date(searchOptions.budget.start_date);
        var endDate = new Date(searchOptions.budget.end_date);

        var validTransactions = transactions.filter(function(transaction){
          var transactionDate = new Date(transaction.transaction_date);
          return !transaction.deleted && transactionDate >= startDate && transactionDate <= endDate;
        });

        var params = {
          budget_id: searchOptions.budget_id,
          bank_account_id: searchOptions.bank_account_id,
          transactions: validTransactions
        };
        return baseAll.post(params);
      }

      function convertToTransactions(input, startDate, endDate, noBalance){
        var transactionList =[];
        var lines = _combineFieldsIntoLines(_convertInputToFieldList(input));

        // remove the empty first line
        lines.shift();

        lines.forEach(function(lineData){
          var transaction = _createTransactionFromLineData(lineData, startDate, endDate, noBalance);
          transactionList.push(transaction);
        });

        return transactionList;
      }

      function _createTransactionFromLineData(lineData, startDate, endDate, noBalance){
        // line data is an array representing one transaction from the bank
        // That format is
        // ['date', 'ref', 2-4 lines of description, amount withdrawn, amount deposited, balance]
        // Because the description can be of differing nos of lines,
        // we have to instead extract the other fields and the remainder will be the description
        // -------------------------------------------------------------------------------------

        var lineDataCopy = angular.copy(lineData);
        var transaction = {};

        // get the transaction date and bank ref from the front
        // ----------------------------------------------------
        transaction.transaction_date = new Date(DateService.convertFromBankDateFormat(lineDataCopy.shift()));
        transaction.ref = lineDataCopy.shift();

        if(!noBalance){
          transaction.balance = lineDataCopy.pop();
        }

        // get deposit amount and withdrawal amount from the end of the array
        // ------------------------------------------------------------------
        transaction.deposit_amount = _extractNumber(lineDataCopy.pop()) * 100;  //convert to cents
        transaction.withdrawal_amount= _extractNumber(lineDataCopy.pop()) * 100;  //convert to cents

        // transactions with payees are of the format
        //  1. description
        //  2. payee code + name
        //  3. payee location
        //  eg:
        //  POS PURCHASE
        //  0754942 SUPERPHARM
        //  MARAVAL TT
        if(_isPayee(lineDataCopy[2])){

          var payeeDetailsArray = lineDataCopy[2].match(/^(\d{7}) (.*)/);
          var payeeCode = payeeDetailsArray[1];
          var payeeName = payeeDetailsArray[2];

          transaction.description = (lineDataCopy[0] + ' ' + payeeName).trim();
          transaction.payeeName = payeeName;
          transaction.payeeCode = payeeCode;

        }else{
          transaction.description = lineDataCopy.join(' ').trim();
        }

        var start = new Date(startDate);
        var end = new Date(endDate);

        // confirm that the transaction date is within the period
        if(transaction.transaction_date < start || transaction.transaction_date > end){
          transaction.deleted = true;
        }
        return transaction;
      }

      function _extractNumber(dollarString){
        var withoutCommas = dollarString.replace(/,/g, '');
        var match = withoutCommas.match(/[$]([-0-9.,]*)/);
        if(match && match[1]){
          return Number(match[1]);
        }else{
          return 0;
        }
      }

      function _convertInputToFieldList(input) {
        if (!input) return [];
        return input.split(/[\t\n]/);
      }

      function _combineFieldsIntoLines(items) {
        var lines = [];
        var currentLine = [];

        items.forEach(function (item) {

          // if we encounter a date, start a new line
          if (_isDate(item)) {
            lines.push(currentLine);
            currentLine = [];

          }
          currentLine.push(item);

        });
        lines.push(currentLine);
        return lines;
      }

      // Payee Lines are identified by 7 digit number then a description
      //  eg. 0004334 K.F.C
      function _isPayee(data){
        return /^\d{7} /.test(data);
      }

      function _isDate(data) {
        return new RegExp("\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d").test(data);
      }

      function showTransactionList(transactions, allocation){
        allocation = allocation || {};
        var allocationName = allocation.name || '';
        var template = '<div class="modal-header">' +
                       '     <h3>Transactions for : ' + allocationName + '</h3>' +
                       ' </div>' +
                       ' <div class="modal-body">' +
                       '    <ec-allocation-transaction-list transactions="vm.transactions">' +
                       '    </ec-allocation-transaction-list>' +
                       ' </div>' +
                       ' <div class="modal-footer">' +
                       '     <button class="btn btn-primary" ' +
                       '           ng-click="vm.options.confirm();">' +
                       '           Close' +
                       '     </button>' +
                       ' </div>';

        var modalInstance = $modal.open({
          template: template,
          backdrop:'static',
          controller: modalController,
          controllerAs: 'vm'
        });

        return modalInstance.result;

        function modalController(){
          /* jshint validthis: true */
          var vm = this;
          vm.options = {};
          vm.transactions = transactions;
          modalFix();

          vm.options.confirm = function(){
            modalInstance.close('ok');
          };

          vm.options.cancel = function(){
            modalInstance.dismiss('cancel');
          };
        }

        /** TODO: this is a temporary fix for a bootstrap 3.1.1 issue
         * Should be removed once that issue is fixed */
        function modalFix(){
          setTimeout(function(){
            angular.element($document[0].querySelectorAll('div.modal-backdrop'))
                 .css('height','1000px');
                }, 100);
        }

      }
    }

})();
