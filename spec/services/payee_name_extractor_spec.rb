require 'rails_helper'

RSpec.describe PayeeNameExtractor do
  describe '.extract' do
    context 'abn-amro-bank format' do
      def extract(description)
        described_class.extract(description: description, import_format: 'abn-amro-bank')
      end

      it 'strips store code and PAS suffix from a debit-card purchase' do
        expect(extract('ALBERT HEIJN 2242,PAS363')).to eq('ALBERT HEIJN')
      end

      it 'strips store code, city and PAS suffix' do
        expect(extract('Albert Heijn 8591 ALMERE,PAS362')).to eq('Albert Heijn')
      end

      it 'handles fractional store codes (Fr.NNN) and strips city and PAS suffix' do
        expect(extract('Albert Heijn Fr.8642 ALM,PAS362')).to eq('Albert Heijn')
      end

      it 'strips trailing city and PAS suffix' do
        expect(extract('DEEN FL71 ALMERE,PAS362')).to eq('DEEN')
      end

      it 'strips trailing city and PAS suffix without store code ambiguity' do
        expect(extract('KFC ALMERE BUITEN,PAS351')).to eq('KFC')
      end

      it 'strips CCV* processor prefix and city and PAS suffix' do
        expect(extract('CCV*KFC Almere Buiten,PAS363')).to eq('KFC')
      end

      it 'strips NL and BV legal tokens from SEPA names' do
        expect(extract('SIMPEL NL BV')).to eq('SIMPEL')
      end

      it 'preserves domain-style names and strips B.V. legal suffix' do
        expect(extract('BOOKING.COM B.V.')).to eq('BOOKING.COM')
      end

      it 'strips NV legal suffix' do
        expect(extract('VITENS NV')).to eq('VITENS')
      end

      it 'strips B.V. suffix preserving mixed-case name' do
        expect(extract('Picnic B.V.')).to eq('Picnic')
      end

      it 'strips N.V. suffix and preserves mixed-case brand with space' do
        expect(extract('ABN AMRO Bank N.V.')).to eq('ABN AMRO Bank')
      end

      it 'strips B.V. suffix preserving hyphenated brand name' do
        expect(extract('T-MOBILE THUIS B.V.')).to eq('T-MOBILE THUIS')
      end

      it 'preserves a merchant name that contains a dot (not a legal suffix)' do
        expect(extract('Vermaat Booking.com AMST,PAS351')).to eq('Vermaat Booking.com')
      end

      it 'strips trailing NL noise token' do
        expect(extract('DOMINOS NL')).to eq('DOMINOS')
      end

      it 'strips via-processor suffix' do
        expect(extract('BURGER KING Almere via Trustly')).to eq('BURGER KING')
      end

      it 'strips a mid-string personal annotation and its trailing note' do
        expect(extract('bol.com b.v. Pat personal lotion')).to eq('bol.com')
      end

      it 'strips BENELUX location and B.V. suffix from mixed-case brand' do
        expect(extract('HelloFresh Benelux B.V.')).to eq('HelloFresh')
      end

      it 'returns description unchanged when no noise tokens or store codes are present' do
        expect(extract('Allianz Nederland Levens')).to eq('Allianz Nederland Levens')
      end

      it 'returns a single-word hand-typed name unchanged' do
        expect(extract('Simpel')).to eq('Simpel')
      end
    end

    context 'abn-amro-creditcard-2026 format' do
      def extract(description)
        described_class.extract(description: description, import_format: 'abn-amro-creditcard-2026')
      end

      it 'strips city and country code' do
        expect(extract('AUDIBLE NEWARK USA')).to eq('AUDIBLE')
      end

      it 'strips multi-word city and country code preserving domain-style name' do
        expect(extract('NETFLIX.COM LOS GATOS USA')).to eq('NETFLIX.COM')
      end

      it 'strips BENELUX location and country code' do
        expect(extract('HELLOFRESH BENELUX AMSTERDAM NLD')).to eq('HELLOFRESH')
      end

      it 'strips phone number (store code) and country code' do
        expect(extract('DISNEY PLUS 800-022-1476 NLD')).to eq('DISNEY PLUS')
      end

      it 'strips city and country code for two-word merchant' do
        expect(extract('DISNEY PLUS HOOFDDORP NLD')).to eq('DISNEY PLUS')
      end

      it 'strips city, country code and INC legal suffix' do
        expect(extract('GITHUB, INC. SAN FRANCISCO USA')).to eq('GITHUB')
      end

      it 'strips numeric store ref, city and country code' do
        expect(extract('STEAMGAMES.COM 4259522 HAMBURG DEU')).to eq('STEAMGAMES.COM')
      end

      it 'returns domain-style name unchanged when there is no trailing noise' do
        expect(extract('WWW.F1.COM INTERNET GBR')).to eq('WWW.F1.COM')
      end

      it 'strips personal annotation alongside country code' do
        expect(extract('WWW.F1.COM INTERNET GBR Ki Personal')).to eq('WWW.F1.COM')
      end

      it 'strips personal annotation from a hand-typed name' do
        expect(extract('Google Play - Pat Personal')).to eq('Google Play')
      end

      it 'strips a personal annotation followed by a free-text note' do
        expect(extract('AMZN DIGITAL Pat Personal Book purchase')).to eq('AMZN DIGITAL')
      end

      it 'strips GOOGLE* app-store prefix and leaves the app name' do
        expect(extract('GOOGLE *YOUTUBEPREMIUM 650-253-0000 G')).to eq('YOUTUBEPREMIUM')
      end

      it 'returns a hand-typed name unchanged (no city/country tail)' do
        expect(extract('Netflix')).to eq('Netflix')
      end
    end

    context 'abn-amro-creditcard format (same ruleset as abn-amro-creditcard-2026)' do
      it 'routes to the same extractor and strips noise identically' do
        result_2026 = described_class.extract(
          description: 'AUDIBLE NEWARK USA',
          import_format: 'abn-amro-creditcard-2026'
        )
        result_legacy = described_class.extract(
          description: 'AUDIBLE NEWARK USA',
          import_format: 'abn-amro-creditcard'
        )
        expect(result_legacy).to eq(result_2026)
      end
    end

    context 'no-op / nil cases' do
      it 'returns nil for a blank import_format' do
        expect(described_class.extract(description: 'ANYTHING ALMERE', import_format: '')).to be_nil
      end

      it 'returns nil for an unregistered import_format' do
        expect(described_class.extract(description: 'ANYTHING', import_format: 'fc-bank')).to be_nil
      end

      it 'returns nil for a blank description with a registered format' do
        expect(described_class.extract(description: '', import_format: 'abn-amro-bank')).to be_nil
      end

      it 'returns nil for a nil description with a registered format' do
        expect(described_class.extract(description: nil, import_format: 'abn-amro-bank')).to be_nil
      end
    end
  end
end
