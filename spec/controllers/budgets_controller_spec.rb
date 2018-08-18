require 'rails_helper'

describe BudgetsController do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

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
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'has a response of success' do
        get :index
        expect(response).to be_successful
      end

      it 'has 3 items in budgets assignment' do
        get :index
        expect(assigns(:budgets).size).to eq 3
      end
    end
  end

  describe "update" do
    before :each do
      @user = create(:user, household: @household)
      auth_request(@user)

      @budget = create(:budget)
      @bank_account = create(:bank_account)
      @allocation_category = create(:allocation_category)
      @income = create(:income, budget: @budget)
      @first_allocation = create(:allocation, budget: @budget)
      @second_allocation = create(:allocation, budget: @budget)
      #@budget.incomes.create(attributes_for(:income))
      #@budget.incomes.create(attributes_for(:income))

      @params = {"id"=>@budget.id.to_s, "name"=>"Jan 04 - Feb 03, 2015", "start_date"=>"2015-01-04", "end_date"=>"2015-02-03",
                 "incomes"=>[
                   {"id"=>@income.id.to_s, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                    "bank_account_id"=>@bank_account.id,
                    }
                  ],
                  "allocations"=>[
                    {"id"=>@first_allocation.id, "name"=>"Rent", "amount"=>200000, "budget_id"=>@budget.id,
                     "allocation_category_id"=>@allocation_category.id, "is_standing_order"=>0,
                     "bank_account_id"=>nil
                  }, {
                    "id"=>@second_allocation.id, "name"=>"Groceries", "amount"=>220000, "budget_id"=>@budget.id,
                    "allocation_category_id"=>@allocation_category.id, "is_standing_order"=>nil
                  }],
                  }

      @two_params ={"id"=>@budget.id.to_s, "name"=>"Jan 04 - Feb 03, 2015",
                    "start_date"=>"2015-01-04", "end_date"=>"2015-02-03",
                    "incomes"=>[{
                        "id"=>@income.id.to_s, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                        "bank_account_id"=>@bank_account.id,
                      }, {
                        "id"=>"", "name"=>"Pat's Salary", "amount"=>22000, "budget_id"=>@budget.id,
                        "bank_account_id"=>""

                    }],
                    "allocations"=>[
                      { "id"=>@first_allocation.id, "name"=>"Rent", "amount"=>200000,
                        "budget_id"=>@budget.id, "allocation_category_id"=>@allocation_category.id,
                        "allocation_type"=>"savings", "is_standing_order"=>0, "bank_account_id"=>nil,
                        "allocation_category"=>nil, "bank_account"=>nil},
                      {"id"=>@second_allocation.id, "name"=>"Groceries", "amount"=>220000, "budget_id"=>@budget.id, "allocation_category_id"=>@allocation_category.id,
                       "allocation_type"=>"expense", "is_standing_order"=>nil, "bank_account_id"=>nil,
                       "allocation_category"=>@allocation_category.id, "bank_account"=>nil}
                    ]}

      @deleted_params = {"id"=>@budget.id.to_s, "name"=>"Jan 04 - Feb 03, 2015",
                         "start_date"=>"2015-01-04", "end_date"=>"2015-02-03",
                         "incomes"=>[
                           {"id"=>@income.id.to_s, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                            "bank_account_id"=>@bank_account.id
                           },
                           {"id"=>"", "name"=>"Pat's Salary", "amount"=>22000, "budget_id"=>@budget.id,
                            "bank_account_id"=>"",
                            },
                            {"id"=>"", "name"=>"deleted", "amount"=>30000, "budget_id"=>@budget.id, "bank_account_id"=>"",
                             "deleted"=>true
                            }
                         ],
                         "allocations"=>[
                           {"id"=>@first_allocation.id, "name"=>"Rent", "amount"=>200000, "budget_id"=>@budget.id,
                            "allocation_category_id"=>@allocation_category.id, "is_standing_order"=>0
                           }, {
                             "id"=>@second_allocation.id, "name"=>"Groceries", "amount"=>220000, "budget_id"=>@budget.id,
                             "allocation_category_id"=>@allocation_category.id, "is_standing_order"=>nil,
                              "deleted" => true
                           }],
      }
    end

    it "updates each income" do
      put :update, params: @params
      expect(@budget.incomes.size).to eq 1
    end

    it "updates the attributes of the first income" do
      put :update, params: @params
      expect(@budget.incomes[0].name).to eq "Kion's Salary"
    end

    context "when an income is deleted" do
      it "deletes the income from the budget" do
        put :update, params: @deleted_params
        expect(@budget.incomes.size).to eq 2
      end
    end


    it "updates each allocation" do
      put :update, params: @params
      expect(@budget.allocations.size).to eq 2
    end

    it "updates the attributes of the first allocation" do
      put :update, params: @params
      expect(@budget.allocations[0].name).to eq "Rent"
    end

    context "when an allocation is deleted" do
      it "deletes the income from the budget" do
        put :update, params: @deleted_params
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
