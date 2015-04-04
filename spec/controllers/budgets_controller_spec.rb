require 'rails_helper'

describe BudgetsController do

  describe '#index' do
    before :each do
      create(:budget, start_date: '2015-01-01')
      create(:budget, start_date: '2015-01-01')
      create(:budget, start_date: '2015-01-01')

    end

    context "when not logged in" do
      it 'has an unauthorized response' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        @user = create(:user)
        auth_request(@user)
      end

      it 'has a response of success' do
        get :index
        expect(response).to have_http_status(:success)
      end

      it 'has 3 items in budgets assignment' do
        get :index
        expect(assigns(:budgets).size).to eq 3
      end
    end
  end

  describe "update" do
    before :each do
      @user = create(:user)
      auth_request(@user)

      @budget = create(:budget)
      @income = @budget.incomes.create(attributes_for(:income))
      @first_allocation = @budget.allocations.create(attributes_for(:allocation))
      @second_allocation = @budget.allocations.create(attributes_for(:allocation))
      #@budget.incomes.create(attributes_for(:income))
      #@budget.incomes.create(attributes_for(:income))

      @params = {"id"=>@budget.id.to_s, "name"=>"Jan 04 - Feb 03, 2015", "start_date"=>"2015-01-04", "end_date"=>"2015-02-03",
                 "incomes"=>[
                   {"id"=>@income.id.to_s, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                    "bank_account_id"=>1,
                    "bank_account"=>{"id"=>1, "name"=>"Kion's Savings' Account",
                                     "account_type"=>"Savings", "account_no"=>"1101001",
                                     "user_id"=>3, "institution_id"=>9, "opening_balance"=>3000,
                                     "user"=>{"id"=>3, "name"=>"Kion Stephen",
                                              "first_name"=>"Kion", "last_name"=>"Stephen",
                                              "nickname"=>nil, "email"=>"kion.stephen@gmail.com"},
                                     "institution"=>{"id"=>9, "name"=>"First Citizens Bank"}}}
                  ],
                  "allocations"=>[
                    {"id"=>@first_allocation.id, "name"=>"Rent", "amount"=>200000, "budget_id"=>@budget.id,
                     "allocation_category_id"=>nil, "allocation_type"=>"savings", "is_standing_order"=>0,
                     "bank_account_id"=>nil, "allocation_category"=>nil, "bank_account"=>nil
                  }, {
                    "id"=>@second_allocation.id, "name"=>"Groceries", "amount"=>220000, "budget_id"=>@budget.id,
                    "allocation_category_id"=>nil, "allocation_type"=>"expense", "is_standing_order"=>nil,
                    "bank_account_id"=>nil, "allocation_category"=>nil, "bank_account"=>nil
                  }],
                  "budget"=>{"id"=>"1", "name"=>"Jan 04 - Feb 03, 2015",
                             "start_date"=>"2015-01-04", "end_date"=>"2015-02-03"}}

      @two_params ={"id"=>@budget.id.to_s, "name"=>"Jan 04 - Feb 03, 2015",
                    "start_date"=>"2015-01-04", "end_date"=>"2015-02-03",
                    "incomes"=>[{
                      "id"=>@income.id.to_s, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                      "bank_account_id"=>1,
                      "bank_account"=>{"id"=>1, "name"=>"Kion's Savings' Account",
                                       "account_type"=>"Savings", "account_no"=>"1101001",
                                       "user_id"=>3, "institution_id"=>9, "opening_balance"=>3000,
                                       "user"=>{
                                         "id"=>3, "name"=>"Kion Stephen", "first_name"=>"Kion", "last_name"=>"Stephen",
                                         "nickname"=>nil, "email"=>"kion.stephen@gmail.com"
                                       },
                                       "institution"=>{ "id"=>9, "name"=>"First Citizens Bank"}
                    }}, {
                      "id"=>"", "name"=>"Pat's Salary", "amount"=>22000, "budget_id"=>@budget.id, "bank_account_id"=>"",
                      "bank_account"=>{"id"=>2, "name"=>"Patrice's Main Account",
                                       "account_type"=>"Checking", "account_no"=>"110233", "user_id"=>4,
                                       "institution_id"=>5, "opening_balance"=>4000,
                                       "user"=>{"id"=>4, "name"=>"Patrice Stephen",
                                                "first_name"=>"Patrice", "last_name"=>"Stephen",
                                                "nickname"=>nil, "email"=>"patrice.stephen@gmail.com"},
                                      "institution"=>{"id"=>5, "name"=>"Scotia Bank Ltd"},
                                      "route"=>"bank_accounts", "reqParams"=>nil,
                                      "fromServer"=>true, "parentResource"=>nil, "restangularCollection"=>false}
                    }],
                    "allocations"=>[
                      { "id"=>@first_allocation.id, "name"=>"Rent", "amount"=>200000, "budget_id"=>@budget.id, "allocation_category_id"=>nil,
                        "allocation_type"=>"savings", "is_standing_order"=>0, "bank_account_id"=>nil,
                        "allocation_category"=>nil, "bank_account"=>nil},
                      {"id"=>@second_allocation.id, "name"=>"Groceries", "amount"=>220000, "budget_id"=>@budget.id, "allocation_category_id"=>nil,
                       "allocation_type"=>"expense", "is_standing_order"=>nil, "bank_account_id"=>nil,
                       "allocation_category"=>nil, "bank_account"=>nil}
                    ],
                    "budget"=>{"id"=>@budget.id, "name"=>"Jan 04 - Feb 03, 2015",
                               "start_date"=>"2015-01-04", "end_date"=>"2015-02-03"}}

      @deleted_params = {"id"=>@budget.id.to_s, "name"=>"Jan 04 - Feb 03, 2015",
                         "start_date"=>"2015-01-04", "end_date"=>"2015-02-03",
                         "incomes"=>[
                           {"id"=>@income.id.to_s, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                            "bank_account_id"=>1,
                            "bank_account"=>{
                              "id"=>1, "name"=>"Kion's Savings' Account", "account_type"=>"Savings",
                              "account_no"=>"1101001", "user_id"=>3, "institution_id"=>9, "opening_balance"=>3000,
                              "user"=>{
                                "id"=>3, "name"=>"Kion Stephen", "first_name"=>"Kion", "last_name"=>"Stephen",
                                "nickname"=>nil, "email"=>"kion.stephen@gmail.com"
                              },
                              "institution"=>{"id"=>9, "name"=>"First Citizens Bank"}
                            }},
                           {"id"=>"", "name"=>"Pat's Salary", "amount"=>22000, "budget_id"=>@budget.id,
                            "bank_account_id"=>"",
                            "bank_account"=>{
                              "id"=>2, "name"=>"Patrice's Main Account", "account_type"=>"Checking",
                              "account_no"=>"110233", "user_id"=>4, "institution_id"=>5, "opening_balance"=>4000,
                              "user"=>{
                                "id"=>4, "name"=>"Patrice Stephen", "first_name"=>"Patrice", "last_name"=>"Stephen",
                                "nickname"=>nil, "email"=>"patrice.stephen@gmail.com"
                              },
                              "institution"=>{"id"=>5, "name"=>"Scotia Bank Ltd"},
                              "route"=>"bank_accounts", "reqParams"=>nil, "fromServer"=>true, "parentResource"=>nil,
                              "restangularCollection"=>false
                            }},
                            {"id"=>"", "name"=>"deleted", "amount"=>30000, "budget_id"=>@budget.id, "bank_account_id"=>"",
                             "bank_account"=>{
                              "id"=>1, "name"=>"Kion's Savings' Account", "account_type"=>"Savings",
                              "account_no"=>"1101001", "user_id"=>3, "institution_id"=>9, "opening_balance"=>3000,
                              "user"=>{
                                "id"=>3, "name"=>"Kion Stephen", "first_name"=>"Kion", "last_name"=>"Stephen",
                                "nickname"=>nil, "email"=>"kion.stephen@gmail.com"
                              },
                              "institution"=>{"id"=>9, "name"=>"First Citizens Bank"},
                            "route"=>"bank_accounts", "reqParams"=>nil, "fromServer"=>true,
                            "parentResource"=>nil, "restangularCollection"=>false
                            }, "deleted"=>true
                            }
                         ],
                         "allocations"=>[
                           {"id"=>@first_allocation.id, "name"=>"Rent", "amount"=>200000, "budget_id"=>@budget.id, "allocation_category_id"=>nil,
                            "allocation_type"=>"savings", "is_standing_order"=>0, "bank_account_id"=>nil,
                            "allocation_category"=>nil, "bank_account"=>nil
                           }, {
                             "id"=>@second_allocation.id, "name"=>"Groceries", "amount"=>220000, "budget_id"=>@budget.id,
                             "allocation_category_id"=>nil, "allocation_type"=>"expense", "is_standing_order"=>nil,
                             "bank_account_id"=>nil, "allocation_category"=>nil, "bank_account"=>nil, "deleted" => true
                           }],
                           "budget"=>{"id"=>"1", "name"=>"Jan 04 - Feb 03, 2015",
                                      "start_date"=>"2015-01-04", "end_date"=>"2015-02-03"}
      }
    end

    it "updates each income" do
      put :update, @params
      expect(@budget.incomes.size).to eq 1
    end

    it "updates the attributes of the first income" do
      put :update, @params
      expect(@budget.incomes[0].name).to eq "Kion's Salary"
    end

    context "when an income is deleted" do
      it "deletes the income from the budget" do
        put :update, @deleted_params
        expect(@budget.incomes.size).to eq 2
      end
    end


    it "updates each allocation" do
      put :update, @params
      expect(@budget.allocations.size).to eq 2
    end

    it "updates the attributes of the first allocation" do
      put :update, @params
      expect(@budget.allocations[0].name).to eq "Rent"
    end

    context "when an allocation is deleted" do
      it "deletes the income from the budget" do
        put :update, @deleted_params
        expect(@budget.allocations.size).to eq 1
      end
    end
  end

  describe "#copy" do
    it "calls Budget.copy with the id" do
      pending "not working - Budget.copy not being called"
      expect(Budget).to receive(:copy)
      put :copy, id: 5
    end

    it "returns the results of Budget.copy" do
    end

  end
end
