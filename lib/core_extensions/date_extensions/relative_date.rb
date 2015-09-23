module CoreExtensions
  module DateExtensions
    module RelativeDate

      # the date before self that has day=day_of_month
      def previous_date_for_day_of_month(day_of_month)

        if Date.valid_date?(self.year, self.month, day_of_month)
          date_in_current_month = Date.new(self.year, self.month, day_of_month)
          if self.day < day_of_month
            return date_in_current_month.last_month
          else
            return date_in_current_month
          end
        end

        # if exact day_of_month date doesn't exist in the current month
        # then current_day MUST be < day_of_month
        # so find the correct day in the previous month
        date_in_previous_month = self.last_month
        if Date.valid_date?(date_in_previous_month.year, date_in_previous_month.month, day_of_month)
          return Date.new(date_in_previous_month.year, date_in_previous_month.month, day_of_month)
        else
          return date_in_previous_month.end_of_month
        end

      end


      # returns the next date that has the indicated day of month
      def next_date_for_day_of_month(day_in_month)
        if Date.valid_date?(self.year, self.month, day_in_month)
          date_in_current_month = Date.new(self.year, self.month, day_in_month)
          if self.day < day_in_month
            return date_in_current_month
          else
            return date_in_current_month.next_month
          end
        end

        self.end_of_month
      end

    end #end relative_date module
  end
end
