module WeeklyBudget
  extend ActiveSupport::Concern

  module ClassMethods

  end

  def weekly_allocations
    allocations.where(is_cumulative: true)
  end

  # expects to have 'start_date' and 'end_date' attributes
  def start_date_for_week(week_no)
    return self.start_date if week_no == 1
    self.start_date.advance(weeks: (week_no - 1)).beginning_of_week(:saturday)
  end

  def end_date_for_week(week_no)
    return self.end_date if week_no == 5
    self.start_date.advance(weeks: (week_no - 1)).end_of_week(:saturday)
  end

  def weighting_for_week(week_no)
    days_of_week(week_no) / start_date.end_of_month.day.to_f
  end

  def days_of_week(week_no)
    end_date_for_week(week_no).mjd - start_date_for_week(week_no).mjd + 1
  end
end