
describe('ecToDollarsFilter', function(){
  var filter;

  beforeEach(module('everycent'));
  beforeEach(inject(function(ecToDollarsFilter){
    filter = ecToDollarsFilter;
  }));

  it("displays a cents value as formatted dollars", function(){
    expect(filter(300)).toEqual('3.00');
  });

  it("displays a cents value as formatted dollars", function(){
    expect(filter(50525)).toEqual('505.25');
  });

});
