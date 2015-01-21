class PayeesController < ApplicationController
  before_action :authenticate_user!

  def index
    @payees = Payee.all
    respond_with @payees, PayeeSerializer
  end
end
