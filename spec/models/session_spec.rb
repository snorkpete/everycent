# == Schema Information
#
# Table name: sessions
#
#  id             :bigint           not null, primary key
#  expires_at     :datetime         not null
#  ip_address     :string
#  last_active_at :datetime
#  token_digest   :string           not null
#  user_agent     :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  user_id        :bigint           not null
#
# Indexes
#
#  index_sessions_on_token_digest  (token_digest) UNIQUE
#  index_sessions_on_user_id       (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
require 'rails_helper'

RSpec.describe Session, type: :model do
  let(:household) { create(:household) }
  let(:user) { create(:user, household: household) }

  describe '.start!' do
    it 'returns a [session, raw_token] tuple' do
      result = Session.start!(user: user)
      expect(result).to be_an(Array)
      expect(result.length).to eq(2)
    end

    it 'persists the session' do
      expect { Session.start!(user: user) }.to change(Session, :count).by(1)
    end

    it 'stores the digest of the token, not the raw token' do
      session, raw = Session.start!(user: user)
      expect(session.token_digest).to eq(Session.digest(raw))
      expect(session.token_digest).not_to eq(raw)
    end

    it 'sets expires_at approximately 7 days from now' do
      session, _ = Session.start!(user: user)
      expect(session.expires_at).to be_within(5.seconds).of(7.days.from_now)
    end

    it 'stores user_agent and ip_address when provided' do
      session, _ = Session.start!(user: user, user_agent: 'TestAgent/1.0', ip_address: '127.0.0.1')
      expect(session.user_agent).to eq('TestAgent/1.0')
      expect(session.ip_address).to eq('127.0.0.1')
    end

    it 'sets last_active_at on the returned session' do
      session, _ = Session.start!(user: user)
      expect(session.last_active_at).to be_within(5.seconds).of(Time.current)
    end
  end

  describe '.authenticate' do
    it 'returns the session for a valid token' do
      session, raw = Session.start!(user: user)
      expect(Session.authenticate(raw)).to eq(session)
    end

    it 'returns nil for a wrong token' do
      Session.start!(user: user)
      expect(Session.authenticate('wrong-token')).to be_nil
    end

    it 'returns nil for a blank token' do
      expect(Session.authenticate('')).to be_nil
      expect(Session.authenticate(nil)).to be_nil
    end

    it 'returns nil for an expired session' do
      session, raw = Session.start!(user: user)
      session.update_columns(expires_at: 1.day.ago)
      expect(Session.authenticate(raw)).to be_nil
    end
  end

  describe '#active?' do
    it 'returns true when expires_at is in the future' do
      session, _ = Session.start!(user: user)
      expect(session.active?).to be true
    end

    it 'returns false when expires_at is in the past' do
      session, _ = Session.start!(user: user)
      session.update_columns(expires_at: 1.hour.ago)
      expect(session.active?).to be false
    end
  end

  describe '#touch_expiry' do
    it 'slides the expiry window when last_active_at is more than a day ago' do
      session, _ = Session.start!(user: user)
      session.update_columns(last_active_at: 2.days.ago, expires_at: 5.days.from_now)
      session.reload
      old_expires_at = session.expires_at

      session.touch_expiry
      session.reload

      expect(session.expires_at).to be > old_expires_at
      expect(session.expires_at).to be_within(5.seconds).of(7.days.from_now)
      expect(session.last_active_at).to be_within(5.seconds).of(Time.current)
    end

    it 'does NOT slide the expiry when last_active_at is within the last day' do
      session, _ = Session.start!(user: user)
      # last_active_at is fresh (just created)
      original_expires_at = session.expires_at
      original_last_active_at = session.last_active_at

      session.touch_expiry

      session.reload
      expect(session.expires_at).to be_within(1.second).of(original_expires_at)
      expect(session.last_active_at).to be_within(1.second).of(original_last_active_at)
    end
  end
end
