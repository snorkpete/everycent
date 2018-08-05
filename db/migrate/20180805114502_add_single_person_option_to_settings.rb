class AddSinglePersonOptionToSettings < ActiveRecord::Migration[5.2]
  def change
    add_column :settings, :family_type, :string, default: 'couple'
    add_column :settings, :single_person, :string

    # default all family types to 'couple'
    Setting.update_all family_type: 'couple'
  end

end
