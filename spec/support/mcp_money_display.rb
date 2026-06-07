RSpec.shared_examples "money fields have display companions" do
  it "pairs every *_cents field with a matching *_display string" do
    expect(rows).not_to be_empty,
      "shared example 'money fields have display companions' needs at least one row to assert against"

    rows.each do |row|
      row.each_key do |key|
        next unless key.to_s.end_with?("_cents")

        display_key = :"#{key.to_s.delete_suffix('_cents')}_display"
        expect(row).to have_key(display_key), "missing #{display_key} for #{key}"
        expect(row[display_key]).to eq(Mcp::Money.display(row[key]))
      end
    end
  end
end
