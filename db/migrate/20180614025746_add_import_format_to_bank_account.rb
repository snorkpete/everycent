class AddImportFormatToBankAccount < ActiveRecord::Migration[5.2]
  def change
    add_column :bank_accounts, :import_format, :string, default: ''
  end
end
