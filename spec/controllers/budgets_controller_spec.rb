require 'rails_helper'

describe BudgetsController do

  it 'can view budgets' do
    create(:budget, start_date: '2015-01-01')
    create(:budget, start_date: '2015-01-01')
    create(:budget, start_date: '2015-01-01')

    expect(assigns(:budgets).size).to eq 3
  end

end
