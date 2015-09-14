
describe('ecHumanizeFilter', function(){
  var filter;

  beforeEach(module('everycent.common'));
  beforeEach(inject(function(ecHumanizeFilter){
    filter = ecHumanizeFilter;
  }));

  it("returns blanks if passed undefined", function(){
    expect(filter(undefined)).toEqual('');
  });

  it("returns the number if the input is a number", function(){
    expect(filter(400)).toEqual(400);
  });


  it("converts any underscores in the input to spaces", function(){
    expect(filter("This_Is_Mine")).toEqual("This Is Mine");
  });

  it("uppercases the first letter of each word", function(){
    expect(filter('later_is_good')).toEqual('Later Is Good');
  });

  it("handles words with numbers in it", function(){
    expect(filter('50_to_do')).toEqual('50 To Do');
  });


});
