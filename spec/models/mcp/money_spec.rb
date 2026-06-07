require 'rails_helper'

RSpec.describe Mcp::Money do
  describe '.display' do
    it 'formats a positive integer' do
      expect(described_class.display(123456)).to eq('€1,234.56')
    end

    it 'formats a negative integer (leading minus before symbol)' do
      expect(described_class.display(-5000)).to eq('-€50.00')
    end

    it 'formats zero' do
      expect(described_class.display(0)).to eq('€0.00')
    end

    it 'formats nil as €0.00' do
      expect(described_class.display(nil)).to eq('€0.00')
    end

    it 'formats a sub-€1 amount (7 cents)' do
      expect(described_class.display(7)).to eq('€0.07')
    end

    it 'formats a thousands boundary (100 000 cents = €1 000.00)' do
      expect(described_class.display(100_000)).to eq('€1,000.00')
    end

    it 'formats a large value with multiple comma groups' do
      expect(described_class.display(12_345_678)).to eq('€123,456.78')
    end

    it 'formats exactly one cent' do
      expect(described_class.display(1)).to eq('€0.01')
    end

    it 'formats a negative sub-€1 amount' do
      expect(described_class.display(-7)).to eq('-€0.07')
    end
  end
end
