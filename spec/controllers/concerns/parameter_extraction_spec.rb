
describe "ParameterExtraction" do
  before :all do
    @parameter_extraction_class = Class.new do
        include ParameterExtraction
    end
  end

  before :each do
    @parameter_extractor = @parameter_extraction_class.new
  end

  describe "#extract_income_params" do
    before :each do
      @params = {"id"=>"1", "name"=>"Jan 04 - Feb 03, 2015", "start_date"=>"2015-01-04", "end_date"=>"2015-02-03", "incomes"=>[{"id"=>1, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>1, "bank_account_id"=>1, "bank_account"=>{"id"=>1, "name"=>"Kion's Savings' Account", "account_type"=>"Savings", "account_no"=>"1101001", "user_id"=>3, "institution_id"=>9, "opening_balance"=>3000, "user"=>{"id"=>3, "name"=>"Kion Stephen", "first_name"=>"Kion", "last_name"=>"Stephen", "nickname"=>nil, "email"=>"kion.stephen@gmail.com"}, "institution"=>{"id"=>9, "name"=>"First Citizens Bank"}}}], "allocations"=>[{"id"=>1, "name"=>"Rent", "amount"=>200000, "budget_id"=>1, "allocation_category_id"=>nil, "allocation_type"=>"savings", "is_standing_order"=>0, "bank_account_id"=>nil, "allocation_category"=>nil, "bank_account"=>nil}, {"id"=>2, "name"=>"Groceries", "amount"=>220000, "budget_id"=>1, "allocation_category_id"=>nil, "allocation_type"=>"expense", "is_standing_order"=>nil, "bank_account_id"=>nil, "allocation_category"=>nil, "bank_account"=>nil}], "budget"=>{"id"=>"1", "name"=>"Jan 04 - Feb 03, 2015", "start_date"=>"2015-01-04", "end_date"=>"2015-02-03"}}
    end

    it "parses the income params properly" do

      expect(@parameter_extractor.extract_income_params(@params)).to eq [
        {"id"=>1, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>1, "bank_account_id"=>1 } 
      ]
    end
  end
end
