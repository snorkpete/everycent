# Shared validation and constants for the import pipeline (preview + save).
#
# IBAN validation lives here because both services need it and the logic is identical.
# PERMITTED_FIELDS defines what transaction attributes the save service writes to the DB.
#
# Note: the controller also defines permitted params (import_save_params, import_preview_params)
# in transactions_controller.rb. Those are the HTTP security boundary (what Rails strong params
# accepts from the request). PERMITTED_FIELDS here is the persistence boundary (what gets written
# to the DB via slice). They overlap but serve different purposes — see the comment in the
# controller for the other side of this link.
module ImportValidation
  class ValidationError < StandardError; end

  PERMITTED_FIELDS = %i[
    transaction_date description withdrawal_amount deposit_amount bank_ref status allocation_id
  ].freeze

  def validate_iban!(bank_account, iban)
    return if iban.blank? && bank_account.account_no.blank?

    if normalize_iban(iban) != normalize_iban(bank_account.account_no)
      raise ValidationError,
            "IBAN mismatch for bank account #{bank_account.id}: expected #{bank_account.account_no}, got #{iban}"
    end
  end

  def normalize_iban(value)
    value.to_s.gsub(/\s/, '')
  end
end
