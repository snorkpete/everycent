# == Schema Information
#
# Table name: payees
#
#  id                      :integer          not null, primary key
#  name                    :string
#  code                    :string
#  default_allocation_name :string
#  status                  :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#

class Payee < ActiveRecord::Base

  def self.update_from_params(params)
    allocation_name = Allocation.where(id: params[:allocation_id]).pluck(:name).first
    existing_payee = Payee.where(code: params[:payeeCode]).first

    if existing_payee

      if allocation_name.nil?
        return existing_payee
      else
        existing_payee.update(default_allocation_name: allocation_name)
        return existing_payee
      end
    end

    update_params = {
      name: params[:payeeName],
      code: params[:payeeCode],
      default_allocation_name: allocation_name,
      status: 'active'
    }

    Payee.create(update_params)
  end
end
