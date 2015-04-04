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
    # don't create a new payee if we don't have payee information
    return if params[:payee_code].blank? or params[:payee_name].blank?

    allocation_name = Allocation.where(id: params[:allocation_id]).pluck(:name).first

    # don't create or update a payee for bank charges
    # TODO: don't like this hard-coding - may need to find a way to flag
    #       a certain allocation as 'Bank Charges'
    return if allocation_name == 'Bank Charges'

    existing_payee = Payee.where(code: params[:payee_code]).first
    if existing_payee

      # do nothing if we didn't find an allocation for that ID
      # This shouldn't happen if the UI is working properly
      return existing_payee if allocation_name.nil?

      existing_payee.update(default_allocation_name: allocation_name)
      return existing_payee
    end

    Payee.create({
      name: params[:payee_name],
      code: params[:payee_code],
      default_allocation_name: allocation_name,
      status: 'active'
    })
  end
end
