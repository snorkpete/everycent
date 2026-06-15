require 'rails_helper'

RSpec.describe User, type: :model do
  it 'has a valid factory' do
    expect(build(:user)).to be_valid
  end

  describe 'email' do
    it 'is required' do
      user = build(:user, email: nil)
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it 'must be unique' do
      create(:user, email: 'taken@example.com')
      duplicate = build(:user, email: 'taken@example.com')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to include('has already been taken')
    end

    it 'is unique case-insensitively' do
      create(:user, email: 'Person@Example.com')
      duplicate = build(:user, email: 'person@example.com')
      expect(duplicate).not_to be_valid
    end
  end
end
