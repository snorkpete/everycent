class Report

  def self.net_worth
    sql = "
   with data as (
        select to_char(b.start_date, 'yyyy-mm') as period, sum((deposit_amount - withdrawal_amount)) as net
        from transactions t
                 inner join budgets b
                            on t.transaction_date between b.start_date and b.end_date and b.household_id = t.household_id
        where t.household_id = 96
        group by to_char(b.start_date, 'yyyy-mm')
        order by to_char(b.start_date, 'yyyy-mm')
    )

    select
          period,
           net as net_change,
          sum(net) over (order by period asc rows between unbounded preceding and current row) as net_worth
    from data"

    data = ActiveRecord::Base.connection.select_all(sql)
    {
      success: true,
      data: data,
      fields: %w(period net_change net_worth)
    }
  end
end
