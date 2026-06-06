module Mcp
  # Query object for the categories endpoint.
  # Returns all allocation categories for the current household, ordered by name.
  # Relies on acts_as_tenant implicit scoping — caller must set the current tenant.
  class CategoryList
    # Returns the categories array exactly as the controller built it.
    def results
      AllocationCategory.all.order(:name).map do |c|
        {
          id:          c.id,
          name:        c.name,
          budget_role: c.budget_role
        }
      end
    end
  end
end
