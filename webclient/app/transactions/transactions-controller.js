
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .controller('TransactionsCtrl', TransactionsCtrl);

  TransactionsCtrl.$inject = ['MessageService', 'TransactionsService', 'ModalService', 'FormService'];

  function TransactionsCtrl(MessageService, TransactionsService, ModalService, FormService){
    var vm = this;
    activate();

    function activate(){
      //refreshTransactionList();
    }

    function refreshTransactionList(){
      TransactionsService.getTransactions().then(function(transactions){
        vm.transactions = transactions;
      });
    }
  }
})();
