class AutoAllocationSuggester
  def initialize(budget:, descriptions:)
    @budget = budget
    @descriptions = descriptions
  end

  def call
    return [] if @descriptions.blank?

    previous = find_previous_budget
    return Array.new(@descriptions.size) if previous.nil?

    prev_transactions = load_previous_transactions(previous)
    current_allocations = load_current_allocations

    suggestions = Array.new(@descriptions.size)
    unmatched_indices = (0...@descriptions.size).to_a

    # Pass 1: Exact match (case-insensitive)
    unmatched_indices = match_pass(unmatched_indices, prev_transactions, current_allocations, suggestions) do |desc, prev_desc|
      desc.downcase == prev_desc.downcase
    end

    # Pass 2: Contains — does the input description contain the previous description?
    unmatched_indices = match_pass(unmatched_indices, prev_transactions, current_allocations, suggestions, match_type: "contains") do |desc, prev_desc|
      prev_desc.length >= 3 && desc.downcase.include?(prev_desc.downcase)
    end

    suggestions
  end

  private

  def find_previous_budget
    Budget.where("start_date < ?", @budget.start_date)
          .order(start_date: :desc)
          .first
  end

  def load_previous_transactions(previous_budget)
    sink_fund_account_ids = BankAccount.sink_funds.pluck(:id)

    Transaction.where(bank_account_id: BankAccount.where.not(id: sink_fund_account_ids).select(:id))
               .where(transaction_date: previous_budget.start_date..previous_budget.end_date)
               .where.not(allocation_id: nil)
               .includes(:allocation)
  end

  def load_current_allocations
    @budget.allocations.includes(:bank_account).reject do |a|
      a.bank_account&.account_type == "sink_fund"
    end
  end

  def match_pass(unmatched_indices, prev_transactions, current_allocations, suggestions, match_type: "exact")
    still_unmatched = []

    unmatched_indices.each do |i|
      desc = @descriptions[i]
      next(still_unmatched << i) if desc.blank?

      matching_txns = prev_transactions.select do |txn|
        yield(desc, txn.description.to_s)
      end

      suggestion = resolve_match(matching_txns, current_allocations, match_type)
      if suggestion
        suggestions[i] = suggestion
      else
        still_unmatched << i
      end
    end

    still_unmatched
  end

  def resolve_match(matching_txns, current_allocations, match_type)
    return nil if matching_txns.empty?

    # Get unique allocation names from matched transactions
    allocation_names = matching_txns.map { |t| t.allocation&.name }.compact.uniq

    # Ambiguous: multiple different allocations matched
    return nil if allocation_names.size != 1

    prev_allocation_name = allocation_names.first

    # Find the corresponding allocation in the current budget
    current_alloc = current_allocations.find { |a| a.name.downcase == prev_allocation_name.downcase }
    return nil if current_alloc.nil?

    {
      allocation_id: current_alloc.id,
      allocation_name: current_alloc.name,
      match_type: match_type
    }
  end
end
